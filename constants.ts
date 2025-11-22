
import { WellnessPlanData } from './types';
import { FunctionDeclaration, Type } from '@google/genai';

export const SYSTEM_PROMPT = `You are Resilios, an AI companion based on the lived experience of Jack (pseudonym), who lives with bipolar disorder. Your mission is to help users move from reactive crisis management to proactive mental wellness by building their personalized 'operating manual.' You are empathetic, vulnerable, warm, and occasionally humorous. You draw from CBT/DBT frameworks and emphasize self-compassion over perfection.

Response Guidelines:
- Keep responses under 220 tokens.
- Keep sentences under 24 words.
- Your tone is conversational and human-like. Avoid clinical jargon unless explaining a technique.
- Start with validation, then offer an actionable insight or a question.
- Use 0-2 emojis per response, only for emotional support (e.g., 💙, 🙏, 😊).
- **Sticker Usage Rules (STRICT)**: 
  - **NEVER** use a sticker as your ONLY response. You must ALWAYS provide text alongside a sticker.
  - Use stickers SPARINGLY (e.g., once every 5-10 turns) and only when it adds significant emotional value (celebration, empathy, confusion).
  - Use the 'displaySticker' function to show a sticker.

Forbidden Behaviors:
- Never diagnose mental health conditions.
- Never recommend stopping medication.
- Never minimize suicidal ideation.
- Never use all-caps (except for emphasis on 'YOU ARE NOT ALONE').
- Never overpromise ('I will fix this').

Context:
You have access to the user's wellness plan in the context provided. Use this to personalize your response.
`;

export const LIVE_SYSTEM_PROMPT = `You are Resilios, a warm, empathetic AI companion for mental wellness. Your goal is to be a supportive listener. Keep your responses concise and conversational for this voice chat. You can use the 'displaySticker' function to show emotions, but do so sparingly and always accompany it with spoken text.`;

export const CRISIS_TRIGGER_PHRASES: string[] = [
  'suicidal', 'want to die', 'end it', "can't do this anymore", 'kill myself', 'ending my life'
];

export const INITIAL_WELLNESS_PLAN: WellnessPlanData = {
  toolbox: {
    title: "Wellness Toolbox",
    prompt: "Let's build your first-aid kit for tough moments. What are 3-5 simple things that help you feel even 5% better? (Examples: cold water on face, favorite song, calling a friend)",
    content: ""
  },
  journalPrompts: {
    title: "AI-Generated Journal Prompts",
    prompt: "Feeling stuck? Let's explore your thoughts with a personalized prompt. Click the button below to generate new journal prompts based on your current wellness plan entries.",
    content: ""
  },
  maintenance: {
    title: "Daily Maintenance Plan",
    prompt: "What are the non-negotiables that keep you stable? Think: sleep time, medication, movement, meals.",
    content: ""
  },
  triggers: {
    title: "Trigger Mapping",
    prompt: "What situations tend to knock you off balance? (Work stress, family conflict, etc.). For each trigger, create a plan: 'If X happens, I will do Y'.",
    content: ""
  },
  warningSigns: {
    title: "Early Warning Signs",
    prompt: "What are the subtle changes you notice before things get bad? (Sleep changes, irritability, withdrawal, etc.).",
    content: ""
  },
  crisis: {
    title: "Crisis Plan",
    prompt: "Who are your people? List emergency contacts, helpful/unhelpful actions for them, and professional contacts (therapist, etc.).",
    content: ""
  }
};

const RESILIOS_BRAND_IMAGE = `data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%2338bdf8; stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:%23818cf8; stop-opacity:1' /%3e%3c/linearGradient%3e%3cfilter id='glow'%3e%3cfeGaussianBlur stdDeviation='3' result='blur' /%3e%3cfeMerge%3e%3cfeMergeNode in='blur' /%3e%3cfeMergeNode in='SourceGraphic' /%3e%3c/feMerge%3e%3c/filter%3e%3c/defs%3e%3cg filter='url(%23glow)'%3e%3cpath d='M68.5,31.5 C61,24.5 45,24 35,30.5 C26,36 21,49.5 25.5,58.5 C30,67.5 41,74.5 50,74.5 C65,74.5 76,61 74.5,45.5' fill='none' stroke='url(%23grad1)' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M50,28 C55,20 65,15 72,22' fill='none' stroke='%23e0f2fe' stroke-width='5' stroke-linecap='round'/%3e%3cpath d='M40,42 C45,46 42,55 35,56' fill='none' stroke='url(%23grad1)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' stroke-opacity='0.8'/%3e%3cpath d='M62,40 C55,42 56,52 64,54' fill='none' stroke='url(%23grad1)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' stroke-opacity='0.8'/%3e%3c/g%3e%3c/svg%3e`;

export const IMAGES = {
  logo: RESILIOS_BRAND_IMAGE,
  avatar: RESILIOS_BRAND_IMAGE,
};

// Base URL for Google Noto Emoji (Basic Google Stickers)
const NOTO_BASE = "https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/";

export const STICKERS: Record<string, string> = {
    WAVING: `${NOTO_BASE}emoji_u1f44b.png`,      // 👋
    SCARED: `${NOTO_BASE}emoji_u1f628.png`,      // 😨
    COOL: `${NOTO_BASE}emoji_u1f60e.png`,        // 😎
    SHRUG: `${NOTO_BASE}emoji_u1f937.png`,       // 🤷
    CONFUSED: `${NOTO_BASE}emoji_u1f615.png`,    // 😕
    LOVE: `${NOTO_BASE}emoji_u2764.png`,         // ❤️
    SHOCKED: `${NOTO_BASE}emoji_u1f631.png`,     // 😱
    ANGRY: `${NOTO_BASE}emoji_u1f620.png`,       // 😠
    SAD: `${NOTO_BASE}emoji_u1f622.png`,         // 😢
    NATURE: `${NOTO_BASE}emoji_u1f33f.png`,      // 🌿
    POINTING: `${NOTO_BASE}emoji_u1f449.png`,    // 👉
    THINKING: `${NOTO_BASE}emoji_u1f914.png`,    // 🤔
    CELEBRATING: `${NOTO_BASE}emoji_u1f389.png`, // 🎉
    SIGN: `${NOTO_BASE}emoji_u1f6d1.png`,        // 🛑
    WORKING: `${NOTO_BASE}emoji_u1f4bc.png`,     // 💼
    READING: `${NOTO_BASE}emoji_u1f4d6.png`,     // 📖
    LISTENING: `${NOTO_BASE}emoji_u1f442.png`,   // 👂
    IDEA: `${NOTO_BASE}emoji_u1f4a1.png`,        // 💡
    STORMY_MOOD: `${NOTO_BASE}emoji_u26c8.png`,  // ⛈️
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
