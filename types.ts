export type MessageRole = 'user' | 'model';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface Attachment {
    data: string; // base64
    mimeType: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  attachment?: Attachment;
  groundingChunks?: GroundingChunk[];
  isLiveTranscription?: boolean;
  sticker?: string;
  wasDeepThinking?: boolean;
  suggestedStickers?: string[];
}

export interface WellnessPlanSection {
  title: string;
  prompt: string;
  content: string;
}

export interface WellnessPlanData {
  toolbox: WellnessPlanSection;
  maintenance: WellnessPlanSection;
  triggers: WellnessPlanSection;
  warningSigns: WellnessPlanSection;
  crisis: WellnessPlanSection;
  journalPrompts: WellnessPlanSection;
}

export interface CheckInData {
  mood: number;
  date: Date;
  notes: string;
}

export type View = 'chat' | 'plan' | 'map' | 'liveAvatar' | 'timeChart';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}