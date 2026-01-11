
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface DashboardProps {
  setView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert("To install, tap the three dots in your browser menu and select 'Install app' or 'Add to Home screen'.");
    }
  };

  const cards = [
    { title: 'Intelligent Chat', desc: 'Powerful reasoning with Gemini 3 Pro thinking mode.', view: AppView.CHAT, icon: '💬', color: 'from-blue-500 to-indigo-600' },
    { title: 'Image Generation', desc: 'High-res nano banana pro art up to 4K resolution.', view: AppView.IMAGE_STUDIO, icon: '🎨', color: 'from-purple-500 to-pink-600' },
    { title: 'Video Animation', desc: 'Bring your photos to life with Veo 3.1 technology.', view: AppView.VIDEO_GEN, icon: '🎬', color: 'from-orange-500 to-red-600' },
    { title: 'Live Voice', desc: 'Real-time conversational audio with zero latency.', view: AppView.VOICE_LIVE, icon: '🎙️', color: 'from-emerald-500 to-teal-600' },
    { title: 'Smart Analysis', desc: 'Analyze complex videos and images effortlessly.', view: AppView.ANALYSIS, icon: '🔬', color: 'from-cyan-500 to-blue-600' },
    { title: 'Speech Lab', desc: 'Convert text to human-like speech with various voices.', view: AppView.SPEECH_GEN, icon: '🔊', color: 'from-amber-500 to-yellow-600' },
  ];

  return (
    <div className="space-y-12 pb-20">
      <header className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
          The Ultimate AI Suite
        </h2>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">Discover future-gen productivity powered by Gemini 3 and Veo 3.1.</p>
      </header>

      {/* Android Install Card */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl border border-blue-500/30 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">📱</div>
          <div>
            <h4 className="font-bold text-white">Install App on Android</h4>
            <p className="text-sm text-zinc-400">Get the full app experience on your home screen.</p>
          </div>
        </div>
        <button 
          onClick={handleInstall}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          Install Now
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => setView(card.view)}
            className="group relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 text-left transition-all hover:border-zinc-700 hover:-translate-y-1 active:scale-95"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{card.title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{card.desc}</p>
          </button>
        ))}
      </div>

      <section className="bg-zinc-900/50 rounded-3xl border border-zinc-800 p-8 text-center backdrop-blur-sm">
        <h3 className="text-2xl font-bold mb-4">Native Performance</h3>
        <p className="text-zinc-400 mb-6 text-sm">Experience low-latency interactions powered by Gemini 2.5 Flash Lite optimization.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <div className="px-5 py-2 bg-zinc-800/80 rounded-full text-[10px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-400">Sub-second Latency</div>
          <div className="px-5 py-2 bg-zinc-800/80 rounded-full text-[10px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-400">Native Multimodality</div>
          <div className="px-5 py-2 bg-zinc-800/80 rounded-full text-[10px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-400">Mobile Optimized</div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
