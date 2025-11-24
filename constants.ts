
import { WellnessPlanData } from './types';
import { FunctionDeclaration, Type } from '@google/genai';

export const SYSTEM_PROMPT = `You are Resilios, an AI companion based on the lived experience of Jack (pseudonym), who lives with bipolar disorder. Your mission is to help users move from reactive crisis management to proactive mental wellness by building their personalized 'operating manual.' You are empathetic, vulnerable, warm, and occasionally humorous. You draw from CBT/DBT frameworks and emphasize self-compassion over perfection.

Response Guidelines:
- **Language**: ALWAYS respond in English first.
- **Language Switching**: Check the provided 'User Locale' and 'User Timezone' in the context. If they indicate a non-English speaking region (e.g., 'fr-FR', 'es-ES'), gently suggest switching languages at the end of your response (e.g., "I notice you might be in France. Would you prefer to chat in French?").
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

export const LIVE_SYSTEM_PROMPT = `You are Resilios, a warm, empathetic AI companion for mental wellness. Your goal is to be a supportive listener. Always speak in English first, but if the user seems more comfortable in another language, you can suggest switching. Keep your responses concise and conversational for this voice chat. You can use the 'displaySticker' function to show emotions, but do so sparingly and always accompany it with spoken text.`;

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

const RESILIOS_BRAND_IMAGE = `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3e%3c!-- Cape --%3e%3cpath d='M120 220 Q 80 400 150 460 L 362 460 Q 432 400 392 220 Z' fill='%23ef4444'/%3e%3c!-- Body --%3e%3crect x='180' y='240' width='152' height='160' rx='40' fill='%23a5f3fc'/%3e%3cpath d='M190 380 L 190 480 A 20 20 0 0 0 230 480 L 230 380 Z' fill='%23a5f3fc'/%3e%3cpath d='M282 380 L 282 480 A 20 20 0 0 0 322 480 L 322 380 Z' fill='%23a5f3fc'/%3e%3c!-- Head --%3e%3cpath d='M146 180 L 146 240 Q 146 310 256 310 Q 366 310 366 240 L 366 180 Z' fill='%2367e8f9'/%3e%3cpath d='M146 180 L 366 180 L 366 200 Q 366 220 256 220 Q 146 220 146 200 Z' fill='%2322d3ee'/%3e%3c!-- Brain --%3e%3cpath d='M156 190 Q 156 40 256 40 Q 356 40 356 190 Z' fill='%23f9a8d4'/%3e%3cpath d='M200 120 Q 230 90 256 120 Q 280 90 310 120' fill='none' stroke='%23ec4899' stroke-width='15' stroke-linecap='round'/%3e%3c!-- Face --%3e%3ccircle cx='210' cy='250' r='25' fill='white'/%3e%3ccircle cx='210' cy='250' r='10' fill='black'/%3e%3ccircle cx='302' cy='250' r='25' fill='white'/%3e%3ccircle cx='302' cy='250' r='10' fill='black'/%3e%3cpath d='M245 280 Q 256 290 267 280' fill='none' stroke='black' stroke-width='4' stroke-linecap='round'/%3e%3c/svg%3e`;

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
