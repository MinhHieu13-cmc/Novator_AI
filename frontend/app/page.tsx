'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { UploadPanel } from '@/components/upload/UploadPanel';
import { MessageList } from '@/components/chat/MessageList';
import { AudioControls } from '@/components/chat/AudioControls';

import { useUploadControl } from '@/hooks/useUploadControl';
import { useGeminiLive } from '@/hooks/useGeminiLive';

export default function Home() {
  const uploadCtrl = useUploadControl();
  const geminiLive = useGeminiLive();

  const handleStartCall = () => {
    if (geminiLive.isConnected) {
      geminiLive.handleDisconnect();
    } else {
      geminiLive.handleConnect(uploadCtrl.ocrText);
    }
  };

  const sidebar = (
    <UploadPanel 
      isUploadingPdf={uploadCtrl.isUploadingPdf}
      isUploadingImage={uploadCtrl.isUploadingImage}
      uploadMessage={uploadCtrl.uploadMessage}
      pdfInputRef={uploadCtrl.pdfInputRef}
      imageInputRef={uploadCtrl.imageInputRef}
      onPdfUpload={uploadCtrl.handleUploadPdf}
      onImageUpload={uploadCtrl.handleUploadImage}
    />
  );

  const mainArea = (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Messages */}
      <MessageList messages={geminiLive.transcript} />

      {/* Audio Controls fixed at bottom */}
      <div className="mt-auto">
        <AudioControls 
          isConnected={geminiLive.isConnected}
          isConnecting={geminiLive.isConnecting}
          error={geminiLive.error}
          onConnect={handleStartCall}
        />
      </div>
    </div>
  );

  return (
    <AppLayout sidebar={sidebar} main={mainArea} />
  );
}
