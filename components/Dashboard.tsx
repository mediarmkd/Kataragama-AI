
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  setView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const cards = [
    { title: 'Intelligent Chat', desc: 'Powerful reasoning with Gemini 3 Pro thinking mode.', view: AppView.CHAT, icon: '💬', color: 'from-blue-500 to-indigo-600' },
    { title: 'Image Generation', desc: 'High-res nano banana pro art up to 4K resolution.', view: AppView.IMAGE_STUDIO, icon: '🎨', color: 'from-purple-500 to-pink-600' },
    { title: 'Video Animation', desc: 'Bring your photos to life with Veo 3.1 technology.', view: AppView.VIDEO_GEN, icon: '🎬', color: 'from-orange-500 to-red-600' },
    { title: 'Live Voice', desc: 'Real-time conversational audio with zero latency.', view: AppView.VOICE_LIVE, icon: '🎙️', color: 'from-emerald-500 to-teal-600' },
    { title: 'Smart Analysis', desc: 'Analyze complex videos and images effortlessly.', view: AppView.ANALYSIS, icon: '🔬', color: 'from-cyan-500 to-blue-600' },
    { title: 'Speech Lab', desc: 'Convert text to human-like speech with various voices.', view: AppView.SPEECH_GEN, icon: '🔊', color: 'from-amber-500 to-yellow-600' },
  ];

  return (
    <div className="space-y-12">
      <header className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight">The Ultimate AI Multi-Tool</h2>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Discover the future of productivity and creativity powered by Gemini 3 and Veo 3.1.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => setView(card.view)}
            className="group relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 text-left transition-all hover:border-zinc-700 hover:-translate-y-1"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{card.title}</h3>
            <p className="text-zinc-500 leading-relaxed">{card.desc}</p>
          </button>
        ))}
      </div>

      <section className="bg-zinc-900/50 rounded-3xl border border-zinc-800 p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Fast AI Responses</h3>
        <p className="text-zinc-400 mb-6">Experience low-latency interactions powered by Gemini 2.5 Flash Lite.</p>
        <div className="flex justify-center space-x-4">
          <div className="px-6 py-3 bg-zinc-800 rounded-full text-sm font-medium border border-zinc-700">Sub-second Latency</div>
          <div className="px-6 py-3 bg-zinc-800 rounded-full text-sm font-medium border border-zinc-700">Native Multimodality</div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
