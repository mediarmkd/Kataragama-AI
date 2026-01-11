
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VIDEO_GEN = 'VIDEO_GEN',
  VOICE_LIVE = 'VOICE_LIVE',
  ANALYSIS = 'ANALYSIS',
  TRANSCRIPTION = 'TRANSCRIPTION',
  SPEECH_GEN = 'SPEECH_GEN'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  thinking?: string;
  sources?: Array<{title: string, uri: string}>;
}

export interface GenerationSettings {
  aspectRatio: string;
  imageSize: string;
  thinkingBudget: number;
}
