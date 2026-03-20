import React, { useEffect, useRef } from 'react';
import { TranscriptMessage } from '@/hooks/useGeminiLive';
import { Bot, User } from 'lucide-react';

interface MessageListProps {
  messages: TranscriptMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <Bot className="w-16 h-16 mb-4 text-slate-200" />
        <p className="text-lg font-medium text-slate-500">Chưa có nội dung trao đổi</p>
        <p className="text-sm mt-2 max-w-sm">Hãy nhấn nút Bắt đầu ở bên dưới và nói chuyện trực tiếp với Gia sư AI.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        const isSystem = msg.role === 'system';

        if (isSystem) {
          return (
            <div key={idx} className="flex justify-center w-full my-4">
              <div className="bg-orange-50 text-orange-800 text-xs px-4 py-2 italic rounded-full border border-orange-100 shadow-sm font-medium">
                {msg.text}
              </div>
            </div>
          );
        }

        return (
          <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                {isUser ? <User className="w-4 h-4 text-indigo-600" /> : <Bot className="w-4 h-4 text-slate-600" />}
              </div>
              <div className={`rounded-2xl px-5 py-3.5 shadow-sm ${
                isUser 
                  ? 'bg-indigo-600 text-white rounded-br-sm' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
              }`}>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
