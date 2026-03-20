import React from 'react';
import { Sparkles } from 'lucide-react';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
}

export function AppLayout({ sidebar, main }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Area */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col hidden md:flex shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-xl shadow-inner">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Tutor</h1>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Teacher Panel</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {sidebar}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative bg-white md:bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 md:hidden">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h1 className="font-bold text-slate-900">AI Tutor</h1>
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden relative">
          {main}
        </div>
      </main>
    </div>
  );
}
