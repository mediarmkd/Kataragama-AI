
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiClient } from '../geminiService';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = getGeminiClient();
      const modelName = useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const config: any = {};
      if (useThinking) {
        config.thinkingConfig = { thinkingBudget: 32768 };
      }
      
      const tools = [];
      if (useSearch) tools.push({ googleSearch: {} });
      if (useMaps) tools.push({ googleMaps: {} });
      if (tools.length > 0) config.tools = tools;

      if (useMaps) {
        // Mock geolocation if browser permits
        const pos = await new Promise<GeolocationPosition | null>((res) => {
          navigator.geolocation.getCurrentPosition(res, () => res(null));
        });
        if (pos) {
          config.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              }
            }
          };
        }
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: input,
        config
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
        if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
        return null;
      }).filter(Boolean) || [];

      const modelMessage: ChatMessage = {
        role: 'model',
        text: response.text || "No response received.",
        timestamp: Date.now(),
        sources: sources.length > 0 ? sources : undefined
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: " + (error as Error).message, timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex flex-wrap gap-2 items-center justify-between">
        <h3 className="font-bold">Gemini 3 Pro Intelligence</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setUseThinking(!useThinking)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${useThinking ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}
          >
            Thinking Mode
          </button>
          <button 
            onClick={() => setUseSearch(!useSearch)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${useSearch ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}
          >
            Google Search
          </button>
          <button 
            onClick={() => setUseMaps(!useMaps)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${useMaps ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}
          >
            Google Maps
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-zinc-800 border border-zinc-700'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <a key={sIdx} href={src.uri} target="_blank" rel="noopener noreferrer" className="text-xs bg-zinc-900 hover:bg-black px-2 py-1 rounded border border-zinc-600 truncate max-w-full">
                        {src.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl p-4 flex space-x-2">
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask anything..."
            className="w-full bg-zinc-800 rounded-2xl py-4 pl-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-14"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-2 p-2 bg-blue-600 disabled:bg-zinc-700 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
