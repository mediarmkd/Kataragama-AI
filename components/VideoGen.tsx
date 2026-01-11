
import React, { useState } from 'react';
import { getGeminiClient, fileToDataPart } from '../geminiService';

const VideoGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (isLoading) return;
    
    // Check for API key selection if needed for Veo
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }

    setIsLoading(true);
    setVideoUrl(null);
    setStatus('Initializing Veo 3.1 Fast...');

    try {
      const ai = getGeminiClient();
      let payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio,
        }
      };

      if (sourceImage) {
        const imagePart = await fileToDataPart(sourceImage);
        payload.image = {
          imageBytes: imagePart.inlineData.data,
          mimeType: imagePart.inlineData.mimeType
        };
      }

      let operation = await ai.models.generateVideos(payload);
      
      setStatus('Animating frames... This may take a minute.');
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setStatus('Finalizing video download...');
        const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await res.blob();
        setVideoUrl(URL.createObjectURL(blob));
      } else {
        throw new Error("Video generation failed - no URI returned.");
      }
    } catch (error) {
      console.error(error);
      alert("Error: " + (error as Error).message);
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
        <h3 className="text-2xl font-bold">Veo Animation Studio</h3>
        
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Reference Photo (Optional)</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setSourceImage(e.target.files?.[0] || null)}
            className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Aspect Ratio</label>
          <div className="flex gap-4">
            <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-3 rounded-xl font-bold border ${aspectRatio === '16:9' ? 'bg-orange-600 border-orange-500' : 'bg-zinc-800 border-zinc-700'}`}>16:9 Landscape</button>
            <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-3 rounded-xl font-bold border ${aspectRatio === '9:16' ? 'bg-orange-600 border-orange-500' : 'bg-zinc-800 border-zinc-700'}`}>9:16 Portrait</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Motion Prompt</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the action (e.g. 'A cat running through a neon city at night')..."
            className="w-full h-32 bg-zinc-800 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl font-bold shadow-xl shadow-orange-900/20 disabled:opacity-50"
        >
          {isLoading ? 'Processing Video...' : 'Animate with Veo'}
        </button>
      </div>

      <div className="bg-black/40 rounded-3xl border border-zinc-800 overflow-hidden flex items-center justify-center relative aspect-[16/9]">
        {videoUrl ? (
          <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-zinc-500">Your video preview will appear here</p>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-lg font-bold text-center">{status}</p>
            <p className="text-zinc-400 text-sm mt-2">AI-driven animation takes a few moments of reflection.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGen;
