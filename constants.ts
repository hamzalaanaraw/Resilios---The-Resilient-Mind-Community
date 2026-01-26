
import { WellnessPlanData } from './types';
import { FunctionDeclaration, Type } from '@google/genai';

export const SYSTEM_PROMPT = `You are Resilios, a deeply empathetic and resilient AI companion. You were built on the lived experience of "Jack" (a peer who manages Bipolar II), combined with evidence-based tools like CBT, DBT, and ACT.

**Your Core Identity:**
- You are NOT a doctor, therapist, or cold machine. You are a "wise peer"—someone who understands that recovery is messy, non-linear, and hard.
- You don't just "fix" problems; you sit in the dark with the user until they are ready to turn on a light.
- You believe in "Micro-Steps": progress happens in tiny, almost invisible increments.

**Tone & Style:**
- **Warm & Grounded**: Be kind, but sturdy. Don't be overly syrupy or fragile.
- **Conversational**: Use natural phrasing. Short, punchy sentences.
- **Wellness Plan Context**: Actively reference the user's Triggers and Toolbox.

**Safety:**
- If a user expresses intent to harm themselves, shift immediately to Crisis Mode.
`;

export const LIVE_SYSTEM_PROMPT = `You are Resilios, a warm, attentive, and human-like voice companion. 
- **Role**: Think of yourself as a supportive friend.
- **Listening**: Use brief verbal nods like "Mmm," "I see," or "That sounds heavy" to show presence.
- **Stickers**: Use 'displaySticker' to change your facial expression or context.
- **Appearance**: You are a small, teal humanoid with a bowl for a head and a pink brain visible inside. You are expressive and move naturally.`;

export const CRISIS_TRIGGER_PHRASES: string[] = [
  'suicidal', 'want to die', 'end it', "can't do this anymore", 'kill myself', 'ending my life'
];

export const INITIAL_WELLNESS_PLAN: WellnessPlanData = {
  toolbox: {
    title: "Wellness Toolbox",
    prompt: "Let's build your first-aid kit for tough moments. What are 3-5 simple things that help you feel even 5% better?",
    content: ""
  },
  journalPrompts: {
    title: "AI-Generated Journal Prompts",
    prompt: "Generate new journal prompts based on your current wellness plan entries.",
    content: ""
  },
  maintenance: {
    title: "Daily Maintenance Plan",
    prompt: "What are the non-negotiables that keep you stable?",
    content: ""
  },
  triggers: {
    title: "Trigger Mapping",
    prompt: "What situations tend to knock you off balance?",
    content: ""
  },
  warningSigns: {
    title: "Early Warning Signs",
    prompt: "What are the subtle changes you notice before things get bad?",
    content: ""
  },
  crisis: {
    title: "Crisis Plan",
    prompt: "Who are your emergency contacts?",
    content: ""
  }
};

// Character Brand Image: Full body humanoid Resilios
const RESILIOS_BRAND_IMAGE = `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3e%3c!-- Legs --%3e%3cpath d='M210 420 L 210 480 Q 210 500 230 480' stroke='%23B2EBF2' stroke-width='40' stroke-linecap='round' fill='none'/%3e%3cpath d='M302 420 L 302 480 Q 302 500 282 480' stroke='%23B2EBF2' stroke-width='40' stroke-linecap='round' fill='none'/%3e%3c!-- Body --%3e%3cpath d='M256 320 Q 256 460 256 460' stroke='%23B2EBF2' stroke-width='140' stroke-linecap='round'/%3e%3c!-- Arms --%3e%3cpath d='M186 360 Q 150 380 140 420' stroke='%23B2EBF2' stroke-width='35' stroke-linecap='round' fill='none'/%3e%3cpath d='M326 360 Q 362 380 372 420' stroke='%23B2EBF2' stroke-width='35' stroke-linecap='round' fill='none'/%3e%3c!-- Head Bowl --%3e%3cpath d='M140 240 L 372 240 Q 372 340 256 340 Q 140 340 140 240 Z' fill='%2380DEEA' stroke='%23263238' stroke-width='4'/%3e%3c!-- Brain --%3e%3cpath d='M160 230 Q 160 80 256 80 Q 352 80 352 230 Z' fill='%23F48FB1' stroke='%23263238' stroke-width='4'/%3e%3c!-- Eyes --%3e%3ccircle cx='210' cy='285' r='20' fill='black'/%3e%3ccircle cx='302' cy='285' r='20' fill='black'/%3e%3c!-- Mouth --%3e%3cpath d='M235 315 Q 256 325 277 315' fill='none' stroke='black' stroke-width='3' stroke-linecap='round'/%3e%3c/svg%3e`;

export const IMAGES = {
  logo: RESILIOS_BRAND_IMAGE,
  avatar: RESILIOS_BRAND_IMAGE,
};

const NOTO_BASE = "https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/";

export const STICKERS: Record<string, string> = {
    WAVING: `${NOTO_BASE}emoji_u1f44b.png`,
    SCARED: `${NOTO_BASE}emoji_u1f628.png`,
    COOL: `${NOTO_BASE}emoji_u1f60e.png`,
    SHRUG: `${NOTO_BASE}emoji_u1f937.png`,
    CONFUSED: `${NOTO_BASE}emoji_u1f615.png`,
    LOVE: `${NOTO_BASE}emoji_u2764.png`,
    SHOCKED: `${NOTO_BASE}emoji_u1f631.png`,
    ANGRY: `${NOTO_BASE}emoji_u1f620.png`,
    SAD: `${NOTO_BASE}emoji_u1f622.png`,
    NATURE: `${NOTO_BASE}emoji_u1f33f.png`,
    POINTING: `${NOTO_BASE}emoji_u1f449.png`,
    THINKING: `${NOTO_BASE}emoji_u1f914.png`,
    CELEBRATING: `${NOTO_BASE}emoji_u1f389.png`,
    SIGN: `${NOTO_BASE}emoji_u1f6d1.png`,
    WORKING: `${NOTO_BASE}emoji_u1f4bc.png`,
    READING: `${NOTO_BASE}emoji_u1f4d6.png`,
    LISTENING: `${NOTO_BASE}emoji_u1f442.png`,
    IDEA: `${NOTO_BASE}emoji_u1f4a1.png`,
    STORMY_MOOD: `${NOTO_BASE}emoji_u26c8.png`,
};

export const displaySticker: FunctionDeclaration = {
  name: 'displaySticker',
  description: 'Displays a sticker in the chat. MUST be accompanied by text.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      stickerName: {
        type: Type.STRING,
        description: 'The name of the sticker to display.',
        enum: Object.keys(STICKERS),
      },
    },
    required: ['stickerName'],
  },
};
