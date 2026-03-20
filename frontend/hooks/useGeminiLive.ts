import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { AudioRecorder } from '@/lib/audio-recorder';
import { AudioStreamer } from '@/lib/audio-streamer';

export type TranscriptMessage = { role: string; text: string; isFinished?: boolean; partialText?: string };

export function useGeminiLive() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  const sessionRef = useRef<any>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const handleDisconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    if (audioStreamerRef.current) {
      audioStreamerRef.current.stop();
      audioStreamerRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const handleConnect = useCallback(async (initialOcrText: string) => {
    if (isConnected) {
      handleDisconnect();
      return;
    }

    setIsConnecting(true);
    setError(null);
    setTranscript([]);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Vui lòng cung cấp NEXT_PUBLIC_GEMINI_API_KEY trong file .env.local');
      }

      const ai = new GoogleGenAI({ apiKey });
      audioStreamerRef.current = new AudioStreamer();
      await audioStreamerRef.current.resume();

      audioRecorderRef.current = new AudioRecorder();

      let systemInstruction = 
        "Bạn là một gia sư AI thân thiện, kiên nhẫn. Bạn nắm rõ bối cảnh địa phương cụ thể là chương trình SGK của Bộ Giáo dục (Cánh Diều, Kết nối tri thức). " +
        "Bạn phải áp dụng phương pháp Socratic: " +
        "1. TUYỆT ĐỐI KHÔNG được phép đưa ra đáp án ngay từ câu lệnh đầu tiên. " +
        "2. Phân tích lỗi sai của học sinh nếu có. " + 
        "3. Đưa ra gợi ý dưới dạng câu hỏi ngược lại để gợi mở tư duy cho học sinh. " + 
        "4. Chỉ đưa ra đáp án cuối cùng và giải thích chi tiết khi học sinh đã nỗ lực thử 2 lần.";

      if (initialOcrText) {
        systemInstruction += `\n\n[THÔNG TIN BÀI TẬP]: Học sinh vừa chụp ảnh: "${initialOcrText}". Hãy chào thân thiện và hỏi phần muốn giải nhé!`;
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
          },
          systemInstruction: systemInstruction,
          outputAudioTranscription: { },
          inputAudioTranscription: { },
        },
        callbacks: {
          onopen: async () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            if (initialOcrText) {
              setTranscript(prev => [...prev, { role: 'system', text: `Đã tự động nạp Text OCR của bài tập vào bộ nhớ của Gia sư. Bắt đầu phiên học!`, isFinished: true }]);
            }
            
            await audioRecorderRef.current?.start((base64Data) => {
              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            });
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn) {
              const parts = message.serverContent.modelTurn.parts;
              if (parts) {
                for (const part of parts) {
                  if (part.inlineData && part.inlineData.data) {
                    audioStreamerRef.current?.addPCM16(part.inlineData.data);
                  }
                }
              }
              
              // Khi AI bắt đầu trả lời -> Chốt câu nói trước đó của người dùng
              setTranscript(prev => {
                const newT = [...prev];
                const lastUserIdx = newT.findLastIndex(t => t.role === 'user');
                if (lastUserIdx !== -1 && !newT[lastUserIdx].isFinished) {
                  newT[lastUserIdx].isFinished = true;
                  newT[lastUserIdx].partialText = "";
                }
                return newT;
              });
            }
            
            if (message.serverContent?.interrupted) {
              audioStreamerRef.current?.interrupt();
              // Người dùng ngắt lời -> Chốt câu nói đang dở của AI
              setTranscript(prev => {
                const newT = [...prev];
                const lastAiIdx = newT.findLastIndex(t => t.role === 'ai');
                if (lastAiIdx !== -1) {
                  newT[lastAiIdx].isFinished = true;
                  newT[lastAiIdx].partialText = "";
                }
                return newT;
              });
            }

            const updateTrans = (prev: TranscriptMessage[], role: string, transPart: any) => {
              if (!transPart || !transPart.text) return prev;
              const textVal = transPart.text.replace(/<noise>/gi, "").trim();
              if (!textVal && !transPart.finished) return prev;

              const newT = [...prev];
              const lastIdx = newT.findLastIndex(t => t.role === role);
              if (lastIdx !== -1 && !newT[lastIdx].isFinished) {
                const msg = newT[lastIdx];
                const prevPartial = msg.partialText || "";
                
                if (!prevPartial) {
                   msg.text = msg.text ? msg.text + " " + textVal : textVal;
                } else if (textVal.includes(prevPartial) || prevPartial.includes(textVal)) {
                   const baseText = msg.text.substring(0, msg.text.length - prevPartial.length);
                   msg.text = baseText + textVal;
                } else {
                   if (textVal) {
                     msg.text = msg.text + " " + textVal;
                   }
                }
                msg.partialText = textVal;
                if (transPart.finished) msg.isFinished = true;
              } else if (textVal) {
                newT.push({ role, text: textVal, partialText: textVal, isFinished: transPart.finished });
              }
              return newT;
            };

            if (message.serverContent?.inputTranscription) {
               setTranscript(prev => updateTrans(prev, 'user', message.serverContent?.inputTranscription));
            }
            if (message.serverContent?.outputTranscription) {
               setTranscript(prev => updateTrans(prev, 'ai', message.serverContent?.outputTranscription));
            }

            if (message.serverContent?.turnComplete) {
              setTranscript(prev => {
                const newT = [...prev];
                const lastIdx = newT.findLastIndex(t => t.role === 'ai');
                if (lastIdx !== -1) {
                   newT[lastIdx].isFinished = true;
                   newT[lastIdx].partialText = "";
                }
                return newT;
              });
            }
          },
          onerror: (err) => {
            console.error('Live API Error:', err);
            setError('Đã xảy ra lỗi đường truyền khi kết nối tới Gemini API.');
            handleDisconnect();
          },
          onclose: () => {
             handleDisconnect();
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error('Failed to connect:', err);
      setError(err.message || 'Lỗi không xác định khi mở kết nối tới AI Tutor');
      setIsConnecting(false);
      handleDisconnect();
    }
  }, [isConnected, handleDisconnect]);

  useEffect(() => {
    return () => {
      handleDisconnect();
    };
  }, [handleDisconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    transcript,
    handleConnect,
    handleDisconnect
  };
}
