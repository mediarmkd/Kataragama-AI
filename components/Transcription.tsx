
import React, { useState, useRef } from 'react';
import { getGeminiClient, encode } from '../geminiService';

const Transcription: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunksRef.current = [];
    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      await processAudio(audioBlob);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const processAudio = async (blob: Blob) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { data: base64, mimeType: 'audio/webm' } },
              { text: "Please transcribe this audio accurately." }
            ]
          }
        });
        setTranscription(response.text || "No speech detected.");
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      setTranscription("Error transcribing: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-black mb-2">Audio Transcription</h3>
        <p className="text-zinc-500">Fast and accurate transcription with Gemini 3 Flash.</p>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:scale-105'} disabled:opacity-50`}
        >
          {isRecording ? '⏹️' : '🎙️'}
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 min-h-[200px] relative">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Transcript</h4>
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center z-10 rounded-3xl">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <p className={`text-lg leading-relaxed ${!transcription ? 'text-zinc-700 italic' : 'text-zinc-300'}`}>
          {transcription || "Transcription will appear here after recording stops..."}
        </p>
      </div>
    </div>
  );
};

export default Transcription;
