import React from 'react';
import { FileText, Camera, Loader2, Info } from 'lucide-react';

interface UploadPanelProps {
  isUploadingPdf: boolean;
  isUploadingImage: boolean;
  uploadMessage: { type: 'success' | 'error', text: string } | null;
  pdfInputRef: React.RefObject<HTMLInputElement | null>;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  onPdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadPanel({
  isUploadingPdf, isUploadingImage, uploadMessage,
  pdfInputRef, imageInputRef, onPdfUpload, onImageUpload
}: UploadPanelProps) {
  return (
    <div className="flex flex-col space-y-6">

      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-start space-x-3 shadow-sm">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-900 leading-relaxed font-medium">
          Việc nạp tài liệu giúp Gia sư AI hiểu chính xác ngữ cảnh Câu hỏi, thay vì trả lời dập khuôn.
        </p>
      </div>

      <div className="space-y-4">
        {/* PDF Input */}
        <input type="file" ref={pdfInputRef} accept=".pdf" className="hidden" onChange={onPdfUpload} />
        <button
          onClick={() => pdfInputRef.current?.click()}
          disabled={isUploadingPdf}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col items-center hover:bg-slate-50 hover:border-indigo-200 transition-all group"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-50 transition-colors">
            {isUploadingPdf ? <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> : <FileText className="w-6 h-6 text-slate-500 group-hover:text-indigo-600 transition-colors" />}
          </div>
          <span className="font-semibold text-slate-800 text-sm">Sách Giáo Khoa (PDF RAG)</span>
          <span className="text-[11px] text-slate-500 mt-1 text-center font-medium">Lưu vào cơ sở dữ liệu vĩnh viễn</span>
        </button>

        {/* Image Input */}
        <input type="file" ref={imageInputRef} accept=".jpg,.jpeg,.png" className="hidden" onChange={onImageUpload} />
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={isUploadingImage}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col items-center hover:bg-slate-50 hover:border-indigo-200 transition-all group"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-50 transition-colors">
            {isUploadingImage ? <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> : <Camera className="w-6 h-6 text-slate-500 group-hover:text-indigo-600 transition-colors" />}
          </div>
          <span className="font-semibold text-slate-800 text-sm">Ảnh bài tập</span>
          <span className="text-[11px] text-slate-500 mt-1 text-center font-medium">Bắt nội dung câu hỏi muốn giải</span>
        </button>
      </div>

      {uploadMessage && (
        <div className={`mt-4 w-full px-4 py-3 rounded-xl text-xs text-center font-semibold shadow-sm ${uploadMessage.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {uploadMessage.text}
        </div>
      )}
    </div>
  );
}
