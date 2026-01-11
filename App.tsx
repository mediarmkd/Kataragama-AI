
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

  // Using a more reliable Google Drive proxy for images
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
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 md:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col items-center border-b border-zinc-800/50 mb-4 bg-black/20">
          <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="w-full flex flex-col items-center group">
            <div className="relative w-32 h-32 mb-2 flex items-center justify-center bg-zinc-800/30 rounded-2xl overflow-hidden border border-zinc-700/50">
              <img 
                src={logoUrl} 
                alt="Kataragama AI Logo" 
                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = "true";
                    target.src = fallbackUrl;
                  } else {
                    // Final fallback to hide if everything fails
                    target.style.display = 'none';
                    target.parentElement?.classList.add('flex-col');
                  }
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-4xl opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 pointer-events-none">✨</span>
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent tracking-tighter">Kataragama AI</h1>
          </button>
          <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-[0.2em] opacity-80">Dev: Kasun Kavinda Gunasekara</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-40 scrollbar-hide">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setCurrentView(item.view);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.view ? 'bg-zinc-800 text-white shadow-lg shadow-black/20 border border-zinc-700/50' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer Socials */}
        <div className="p-5 bg-zinc-900 border-t border-zinc-800 space-y-2">
          <a
            href="https://www.youtube.com/@kataragamatv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full py-2 bg-[#FF0000] hover:bg-[#e60000] rounded-xl transition-all text-white text-xs font-bold shadow-lg shadow-red-600/10 hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <span>Kataragama TV</span>
          </a>
          <a
            href="https://www.facebook.com/kataragamalk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full py-2 bg-[#1877F2] hover:bg-[#166fe5] rounded-xl transition-all text-white text-xs font-bold shadow-lg shadow-blue-600/10 hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span>Our Fan Page</span>
          </a>
          <a
            href="https://www.facebook.com/kkgunasekara"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all text-zinc-300 text-xs font-bold border border-zinc-700 hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 fill-current opacity-70" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span>Follow Kasun</span>
          </a>

          {/* Copyright Notice */}
          <div className="pt-4 mt-2 text-center border-t border-zinc-800/50">
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-medium leading-relaxed">
              All rights reserved 2025<br/>
              <span className="text-zinc-500 font-black tracking-[0.3em]">kasunSoft</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <div className="flex items-center space-x-2">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]" 
              onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = "true";
                    target.src = fallbackUrl;
                  }
              }}
            />
            <span className="font-black text-sm uppercase tracking-widest text-zinc-300">Kataragama</span>
          </div>
          <div className="w-10"></div>
        </header>

        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {renderView()}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
