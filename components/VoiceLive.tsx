
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiClient, encode, decode, decodeAudioData } from '../geminiService';
import { Modality } from '@google/genai';

const VoiceLive: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = getGeminiClient();
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg) => {
            if (msg.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev.slice(-4), "AI: " + msg.serverContent!.outputTranscription!.text]);
            }

            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const { output: ctx } = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsActive(false),
          onerror: (e) => console.error(e),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          outputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      alert("Failed to start voice session: " + (err as Error).message);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 py-12">
      <div className="text-center">
        <h3 className="text-3xl font-black mb-4">Gemini Live Voice</h3>
        <p className="text-zinc-400">Natural, zero-latency conversation with Gemini 2.5.</p>
      </div>

      <div className={`aspect-square rounded-full mx-auto max-w-[280px] flex items-center justify-center border-8 transition-all duration-700 ${isActive ? 'border-blue-500 animate-pulse bg-blue-500/10' : 'border-zinc-800 bg-zinc-900'}`}>
        <button 
          onClick={isActive ? stopSession : startSession}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${isActive ? 'bg-red-500 shadow-xl shadow-red-900/40' : 'bg-blue-600 shadow-xl shadow-blue-900/40'}`}
        >
          {isActive ? (
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          ) : (
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          )}
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 min-h-[120px]">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Live Insights</h4>
        {transcription.length > 0 ? (
          <div className="space-y-2">
            {transcription.map((t, i) => (
              <p key={i} className="text-sm text-zinc-300">{t}</p>
            ))}
          </div>
        ) : (
          <p className="text-zinc-600 italic text-center py-4">"Hello, how can I help you today?"</p>
        )}
      </div>
    </div>
  );
};

export default VoiceLive;
