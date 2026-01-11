
import React, { useState } from 'react';
import { getGeminiClient, fileToDataPart } from '../geminiService';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [seed, setSeed] = useState<string>('');
  const [numImages, setNumImages] = useState<number>(1);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setGeneratedImages([]);
    
    const ai = getGeminiClient();
    const parsedSeed = seed.trim() !== '' ? parseInt(seed) : undefined;

    try {
      if (isBatchMode) {
        const prompts = prompt.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        setBatchProgress({ current: 0, total: prompts.length });
        
        const results: string[] = [];
        for (let i = 0; i < prompts.length; i++) {
          setBatchProgress(prev => ({ ...prev, current: i + 1 }));
          const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompts[i] }] },
            config: {
              seed: parsedSeed,
              imageConfig: {
                aspectRatio,
                imageSize: imageSize as any
              }
            }
          });

          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              results.push(`data:image/png;base64,${part.inlineData.data}`);
              break;
            }
          }
          // Partial updates for smoother UX
          setGeneratedImages([...results]);
        }
      } else if (isEditing && editImage) {
        const imagePart = await fileToDataPart(editImage);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [imagePart, { text: prompt }]
          },
          config: {
            seed: parsedSeed
          }
        });

        const newImages: string[] = [];
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            newImages.push(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
        setGeneratedImages(newImages);
      } else if (numImages > 1) {
        const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: numImages,
            aspectRatio: aspectRatio as any,
            outputMimeType: 'image/jpeg',
          },
        });
        setGeneratedImages(response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`));
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: { parts: [{ text: prompt }] },
          config: {
            seed: parsedSeed,
            imageConfig: {
              aspectRatio,
              imageSize: imageSize as any
            }
          }
        });

        const newImages: string[] = [];
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            newImages.push(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
        setGeneratedImages(newImages);
      }
    } catch (error) {
      console.error(error);
      alert("Error generating images: " + (error as Error).message);
    } finally {
      setIsLoading(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  };

  const downloadAll = () => {
    generatedImages.forEach((src, idx) => {
      const link = document.createElement('a');
      link.href = src;
      link.download = `kataragama-ai-gen-${idx + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Controls Panel */}
        <div className="w-full md:w-1/3 space-y-6 bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-xl overflow-y-auto max-h-[85vh]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Studio Controls</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setIsEditing(!isEditing);
                  setIsBatchMode(false);
                  if (!isEditing) setNumImages(1);
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${isEditing ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
              >
                Edit
              </button>
              <button 
                onClick={() => {
                  setIsBatchMode(!isBatchMode);
                  setIsEditing(false);
                  if (!isBatchMode) setNumImages(1);
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${isBatchMode ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
              >
                Batch
              </button>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Source Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                className="w-full text-sm bg-zinc-800 p-2 rounded-xl border border-zinc-700 focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {['1:1', '3:4', '4:3', '9:16', '16:9'].map(ratio => (
                <button 
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 rounded-lg text-xs font-medium border transition-all ${aspectRatio === ratio ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {!isEditing && !isBatchMode && (
            <>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400 flex justify-between">
                  <span>Variants (Single Prompt)</span>
                  <span className="text-blue-400 font-bold">{numImages}</span>
                </label>
                <input 
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={numImages}
                  onChange={(e) => setNumImages(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Resolution</label>
                <div className="flex gap-2">
                  {['1K', '2K', '4K'].map(size => (
                    <button 
                      key={size}
                      onClick={() => setImageSize(size)}
                      disabled={numImages > 1}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${imageSize === size && numImages === 1 ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-zinc-700 bg-zinc-800 text-zinc-500'} disabled:opacity-30`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Seed (Global)</label>
            <input 
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Random seed..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">
              {isBatchMode ? "Prompts (One per line)" : "Prompt"}
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isBatchMode 
                ? "A red cat\nA blue dog\nA green bird..." 
                : isEditing 
                  ? "Describe the changes..." 
                  : "Describe your vision..."
              }
              className="w-full h-40 bg-zinc-800 rounded-xl p-4 border border-zinc-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim() || (isEditing && !editImage)}
            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${
              isBatchMode 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/20' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/20'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isBatchMode ? `Processing ${batchProgress.current}/${batchProgress.total}` : 'Creating...'}</span>
              </>
            ) : (
              <span>
                {isBatchMode ? 'Generate Batch' : isEditing ? 'Reimagine Image' : numImages > 1 ? `Generate ${numImages} Variants` : 'Generate Masterpiece'}
              </span>
            )}
          </button>
        </div>

        {/* Display Area */}
        <div className="flex-1 min-h-[500px] bg-zinc-950/50 rounded-3xl border border-zinc-800 border-dashed overflow-hidden relative flex flex-col">
          {generatedImages.length > 1 && (
            <div className="p-4 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/20">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                {isBatchMode ? `Batch: ${generatedImages.length} Images` : `${generatedImages.length} Variants Ready`}
              </span>
              <button 
                onClick={downloadAll}
                className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all border border-zinc-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Download All</span>
              </button>
            </div>
          )}

          <div className={`p-6 flex-1 w-full overflow-y-auto ${generatedImages.length > 1 ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'flex items-center justify-center'}`}>
            {generatedImages.length > 0 ? (
              generatedImages.map((src, idx) => (
                <div key={idx} className="relative group rounded-2xl bg-zinc-900 flex flex-col border border-zinc-800 overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
                  <div className="flex-1 flex items-center justify-center overflow-hidden bg-black/20 min-h-[300px]">
                    <img src={src} alt={`Generated ${idx}`} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="p-4 bg-zinc-900/95 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Image #{idx + 1}</span>
                    <a 
                      href={src} 
                      download={`kataragama-ai-${idx + 1}.png`}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/20 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))
            ) : !isLoading && (
              <div className="text-center p-8 max-w-sm">
                <div className="text-6xl mb-6 opacity-20 filter grayscale">🎨</div>
                <h4 className="text-zinc-400 font-bold mb-2">Canvas Empty</h4>
                <p className="text-zinc-600 text-sm">
                  {isBatchMode 
                    ? "Enter multiple prompts separated by lines to generate a collection of images." 
                    : "Your artistic journey begins with a prompt. Pro models use advanced reasoning for pixel-perfect results."}
                </p>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="font-black text-2xl tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">
                {isBatchMode 
                  ? `BATCH PROCESSING: ${batchProgress.current}/${batchProgress.total}...` 
                  : numImages > 1 
                    ? `CRAFTING ${numImages} VARIANTS...` 
                    : isEditing 
                      ? 'REIMAGINING SCENE...' 
                      : 'GENERATING MASTERPIECE...'}
              </p>
              <div className="mt-4 flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
