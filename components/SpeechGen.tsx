
import React, { useState } from 'react';
import { getGeminiClient, decode, decodeAudioData } from '../geminiService';
import { Modality } from '@google/genai';

const SpeechGen: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [isLoading, setIsLoading] = useState(false);

  const voices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

  const generateSpeech = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
        <h3 className="text-2xl font-bold">Speech Lab</h3>
        
        <div className="space-y-2">
          <label className="text-sm text-zinc-500">Text to Speak</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-40 bg-zinc-800 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none"
            placeholder="Type something you want Gemini to say..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-500">Select Voice</label>
          <div className="flex flex-wrap gap-2">
            {voices.map(v => (
              <button 
                key={v}
                onClick={() => setVoice(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${voice === v ? 'bg-amber-600 border-amber-500' : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={generateSpeech}
          disabled={!text.trim() || isLoading}
          className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-amber-900/20"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>🔊</span>
              <span>Speak Text</span>
            </>
          )}
        </button>
      </div>

      <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start space-x-4">
        <div className="text-2xl">💡</div>
        <p className="text-sm text-amber-200/60 leading-relaxed">
          Pro-tip: You can include style instructions in your text like <strong>"Say cheerfully: Welcome home!"</strong> to influence the emotional tone of the generated speech.
        </p>
      </div>
    </div>
  );
};

export default SpeechGen;
