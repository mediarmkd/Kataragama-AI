
import React, { useState } from 'react';
import { getGeminiClient, fileToDataPart } from '../geminiService';

const Analysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('Analyze this content and summarize key takeaways.');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file || isLoading) return;
    setIsLoading(true);
    setResult('');

    try {
      const ai = getGeminiClient();
      const filePart = await fileToDataPart(file);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [filePart, { text: prompt }]
        }
      });

      setResult(response.text || 'No findings.');
    } catch (err) {
      console.error(err);
      setResult("Error: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-2xl mx-auto space-y-6">
        <h3 className="text-2xl font-bold">Intelligent Multi-modal Analysis</h3>
        <p className="text-zinc-400">Gemini 3 Pro can watch videos and look at photos to find deep information.</p>
        
        <div className="space-y-2">
          <label className="text-sm text-zinc-500">Upload Media (Image or Video)</label>
          <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-6 hover:border-blue-500 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept="image/*,video/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <span className="text-4xl mb-2 block">{file ? '✅' : '📁'}</span>
              <p className="text-sm">{file ? file.name : 'Click to select or drag and drop'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-500">Analysis Goal</label>
          <input 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-zinc-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={!file || isLoading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 rounded-xl font-bold transition-all"
        >
          {isLoading ? 'Thinking Deeply...' : 'Start Deep Analysis'}
        </button>
      </div>

      {result && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h4 className="font-bold text-zinc-500 uppercase text-xs tracking-widest mb-6">AI Findings</h4>
          <div className="prose prose-invert max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">{result}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
