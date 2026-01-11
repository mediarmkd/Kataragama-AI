
import React, { useState, useEffect, useRef } from 'react';
import { AppView } from './types';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import ImageStudio from './components/ImageStudio';
import VideoGen from './components/VideoGen';
import VoiceLive from './components/VoiceLive';
import Analysis from './components/Analysis';
import Transcription from './components/Transcription';
import SpeechGen from './components/SpeechGen';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const logoId = "1OY6wgXgOu26fMpqLjtg8ZEF_5s89wyq7";
  const logoUrl = `https://drive.google.com/thumbnail?id=${logoId}&sz=w500`;
  const fallbackUrl = "https://raw.githubusercontent.com/Kataragamalk/Kataragama-AI/refs/heads/main/logo.png";

  const navigation = [
    { name: 'Dashboard', view: AppView.DASHBOARD, icon: '🏠' },
    { name: 'AI Chat', view: AppView.CHAT, icon: '💬' },
    { name: 'Image Studio', view: AppView.IMAGE_STUDIO, icon: '🎨' },
    { name: 'Video Gen', view: AppView.VIDEO_GEN, icon: '🎬' },
    { name: 'Live Voice', view: AppView.VOICE_LIVE, icon: '🎙️' },
    { name: 'Deep Analysis', view: AppView.ANALYSIS, icon: '🔬' },
    { name: 'Transcription', view: AppView.TRANSCRIPTION, icon: '📝' },
    { name: 'Speech Synthesis', view: AppView.SPEECH_GEN, icon: '🔊' },
  ];

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard setView={setCurrentView} />;
      case AppView.CHAT: return <ChatBot />;
      case AppView.IMAGE_STUDIO: return <ImageStudio />;
      case AppView.VIDEO_GEN: return <VideoGen />;
      case AppView.VOICE_LIVE: return <VoiceLive />;
      case AppView.ANALYSIS: return <Analysis />;
      case AppView.TRANSCRIPTION: return <Transcription />;
      case AppView.SPEECH_GEN: return <SpeechGen />;
      default: return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 md:translate-x-0 flex flex-col shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col items-center border-b border-zinc-800/50 mb-4 bg-black/20 pt-12 md:pt-6">
          <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="w-full flex flex-col items-center group">
            <div className="relative w-28 h-28 mb-3 flex items-center justify-center bg-zinc-800/30 rounded-3xl overflow-hidden border border-zinc-700/50 shadow-inner">
              <img 
                src={logoUrl} 
                alt="Kataragama AI Logo" 
                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = "true";
                    target.src = fallbackUrl;
                  }
                }}
              />
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent tracking-tighter">Kataragama AI</h1>
          </button>
          <p className="text-[9px] text-zinc-600 mt-2 font-black uppercase tracking-[0.25em] opacity-80">Dev: Kasun Kavinda Gunasekara</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-40 scrollbar-hide">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setCurrentView(item.view);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                currentView === item.view ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer Socials */}
        <div className="p-5 bg-zinc-900 border-t border-zinc-800 space-y-2 pb-10">
          <a
            href="https://www.youtube.com/@kataragamatv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full py-2.5 bg-[#FF0000] hover:bg-[#e60000] rounded-xl transition-all text-white text-xs font-black shadow-lg shadow-red-600/10 active:scale-95"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <span>YouTube</span>
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a href="https://www.facebook.com/kataragamalk" target="_blank" className="flex items-center justify-center py-2 bg-[#1877F2] rounded-xl text-white active:scale-95 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.facebook.com/kkgunasekara" target="_blank" className="flex items-center justify-center py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400 active:scale-95 transition-transform">
              <span className="text-[10px] font-bold">Follow</span>
            </a>
          </div>

          <div className="pt-4 text-center">
            <p className="text-[8px] text-zinc-600 uppercase tracking-[0.2em] font-medium leading-relaxed">
              All rights reserved 2025<br/>
              <span className="text-zinc-500 font-black tracking-[0.3em]">kasunSoft</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative flex flex-col h-screen overflow-hidden">
        {/* Mobile Header - Native Feel */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 sticky top-0 z-40 safe-top">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-zinc-400 active:scale-90 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center space-x-2">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-8 w-auto object-contain drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.triedFallback) {
                  target.dataset.triedFallback = "true";
                  target.src = fallbackUrl;
                }
              }}
            />
            <span className="font-black text-xs uppercase tracking-[0.2em] text-white">Kataragama</span>
          </div>
          <div className="w-10"></div>
        </header>

        {/* View Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-8 py-6 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {renderView()}
          </div>
        </div>

        {/* Simple Bottom Navigation for Mobile (Optional, but adds to App feel) */}
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 rounded-full px-6 py-3 flex items-center space-x-8 shadow-2xl z-40">
           <button onClick={() => setCurrentView(AppView.DASHBOARD)} className={`p-1 ${currentView === AppView.DASHBOARD ? 'text-blue-500' : 'text-zinc-500'}`}>🏠</button>
           <button onClick={() => setCurrentView(AppView.CHAT)} className={`p-1 ${currentView === AppView.CHAT ? 'text-blue-500' : 'text-zinc-500'}`}>💬</button>
           <button onClick={() => setCurrentView(AppView.IMAGE_STUDIO)} className={`p-1 ${currentView === AppView.IMAGE_STUDIO ? 'text-blue-500' : 'text-zinc-500'}`}>🎨</button>
           <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-zinc-500">⋮</button>
        </nav>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
