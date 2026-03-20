import { useState, useRef } from 'react';

export function useUploadControl() {
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [ocrText, setOcrText] = useState<string>('');
  const [uploadMessage, setUploadMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPdf(true);
    setUploadMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:8000/api/rag/upload_pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to upload PDF');
      setUploadMessage({ type: 'success', text: 'Nạp sách RAG thành công!' });
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.message });
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setUploadMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:8000/api/ocr/upload_image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Failed to process OCR');
      setOcrText(data.text);
      setUploadMessage({ type: 'success', text: 'Nhận diện ảnh OCR thành công! AI đã ghi nhớ bài tập.' });
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.message });
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  return {
    isUploadingPdf,
    isUploadingImage,
    ocrText,
    uploadMessage,
    pdfInputRef,
    imageInputRef,
    handleUploadPdf,
    handleUploadImage
  };
}
