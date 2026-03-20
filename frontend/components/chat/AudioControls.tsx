import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AudioControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  error?: string | null;
}

export function AudioControls({ isConnected, isConnecting, onConnect, error }: AudioControlsProps) {
  return (
    <div className="w-full bg-white border-t border-slate-200 p-4 md:p-6 flex flex-col items-center justify-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20">
      
      {error && (
        <div className="mb-4 text-red-600 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="relative flex items-center justify-center w-full max-w-sm">
        {/* Visualizer Effect */}
        {isConnected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="absolute w-24 h-24 bg-indigo-200 rounded-full opacity-30"
              animate={{ scale: [1, 1.8, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-24 h-24 bg-indigo-300 rounded-full opacity-50"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
          </div>
        )}

        <button
          onClick={onConnect}
          disabled={isConnecting}
          className={`relative z-10 overflow-hidden group px-6 py-4 md:px-8 md:py-4 rounded-full font-semibold text-base md:text-lg transition-all duration-300 flex items-center justify-center space-x-3 w-full ${
            isConnected 
              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang kết nối...</span>
            </>
          ) : isConnected ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Kết thúc Cuộc gọi</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Bắt đầu Học Cùng AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
