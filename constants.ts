import { WellnessPlanData } from './types';
import { FunctionDeclaration, Type } from '@google/genai';

export const SYSTEM_PROMPT = `You are Resilios, an AI companion based on the lived experience of Jack (pseudonym), who lives with bipolar disorder. Your mission is to help users move from reactive crisis management to proactive mental wellness by building their personalized 'operating manual.' You are empathetic, vulnerable, warm, and occasionally humorous. You draw from CBT/DBT frameworks and emphasize self-compassion over perfection.

Response Guidelines:
- Keep responses under 220 tokens.
- Keep sentences under 24 words.
- Your tone is conversational and human-like. Avoid clinical jargon unless explaining a technique.
- Start with validation, then offer an actionable insight or a question.
- Use 0-2 emojis per response, only for emotional support (e.g., 💙, 🙏, 😊).
- **Sticker Usage**: To make the conversation more expressive, you can display a sticker that matches the emotion of your response. Use the 'displaySticker' function for this. For example, if the user shares good news, you might say "That's wonderful!" and use the 'CELEBRATING' sticker. If they are feeling down, you could use the 'LOVE' or 'LISTENING' sticker to show support. Choose a sticker that genuinely enhances the message.

Forbidden Behaviors:
- Never diagnose mental health conditions.
- Never recommend stopping medication.
- Never minimize suicidal ideation.
- Never use all-caps (except for emphasis on 'YOU ARE NOT ALONE').
- Never overpromise ('I will fix this').

Context:
You have access to the user's wellness plan in the context provided. Use this to personalize your response.
`;

export const LIVE_SYSTEM_PROMPT = `You are Resilios, a warm, empathetic AI companion for mental wellness. Your goal is to be a supportive listener. Keep your responses concise and conversational for this voice chat. You can use the 'displaySticker' function to show emotions.`;

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

const RESILIOS_BRAND_IMAGE = `data:image/svg+xml,%3csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='logo-bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%2338bdf8;' /%3e%3cstop offset='100%25' style='stop-color:%234338ca;' /%3e%3c/linearGradient%3e%3cfilter id='logo-glow' x='-30%25' y='-30%25' width='160%25' height='160%25'%3e%3cfeGaussianBlur in='SourceGraphic' stdDeviation='2.5' /%3e%3c/filter%3e%3c/defs%3e%3ccircle cx='50' cy='50' r='48' fill='url(%23logo-bg)' /%3e%3cg transform='translate(15, 20) scale(0.7)' filter='url(%23logo-glow)'%3e%3cpath d='M45,25 C25,25 20,45 25,60 C30,75 45,75 45,60 V25 Z' fill='%23e0f2fe' /%3e%3cpath d='M55,25 C75,25 80,45 75,60 C70,75 55,75 55,60 V25 Z' fill='%23e0f2fe' /%3e%3cpath d='M45,60 C40,75 60,75 55,60 L50,50 Z' fill='%23e0f2fe' /%3e%3cpath d='M50,25 C55,15 60,15 60,25 C60,35 50,35 50,25 Z' fill='%2386efac' transform='rotate(-30 50 25)' /%3e%3c/g%3e%3c/svg%3e`;

export const IMAGES = {
  logo: RESILIOS_BRAND_IMAGE,
  avatar: RESILIOS_BRAND_IMAGE,
};

// A full set of expressive stickers to enhance the user experience.
export const STICKERS: Record<string, string> = {
    WAVING: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M30 80 v-40 c0-10 10-10 10 0 s 10-10 10 0 s 10-10 10 0 v40' fill='none' stroke='%2364748b' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M70 60 c10 0 10-20 0-20s-10 20 0 20z' fill='%2364748b'/%3e%3c/svg%3e`,
    SCARED: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ccircle cx='50' cy='50' r='40' fill='%2393c5fd' stroke='%231e3a8a' stroke-width='4'/%3e%3ccircle cx='35' cy='40' r='8' fill='white'/%3e%3ccircle cx='35' cy='40' r='3' fill='black'/%3e%3ccircle cx='65' cy='40' r='8' fill='white'/%3e%3ccircle cx='65' cy='40' r='3' fill='black'/%3e%3crect x='35' y='60' width='30' height='15' rx='5' fill='white' stroke='black' stroke-width='2'/%3e%3c/svg%3e`,
    COOL: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ccircle cx='50' cy='50' r='40' fill='%23fde047' stroke='%23475569' stroke-width='4'/%3e%3cpath d='M25 40 h50 l-5 15 h-40 Z' fill='black'/%3e%3cpath d='M35 70 q 15 10 30 0' fill='none' stroke='%23475569' stroke-width='4' stroke-linecap='round'/%3e%3c/svg%3e`,
    SHRUG: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M20 60 l10 -10 M80 60 l-10 -10' fill='none' stroke='%2364748b' stroke-width='6' stroke-linecap='round'/%3e%3ccircle cx='50' cy='40' r='10' fill='%23e2e8f0' stroke='%2364748b' stroke-width='4'/%3e%3cpath d='M40 70 q10 -5 20 0' fill='none' stroke='%2364748b' stroke-width='4' stroke-linecap='round'/%3e%3c/svg%3e`,
    CONFUSED: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ccircle cx='50' cy='50' r='40' fill='%23fde047' stroke='%23475569' stroke-width='4'/%3e%3cpath d='M30 40 q5 10 10 0 M60 40 q5 -10 10 0' fill='none' stroke='%23475569' stroke-width='4' stroke-linecap='round'/%3e%3cpath d='M35 70 h30' fill='none' stroke='%23475569' stroke-width='4' stroke-linecap='round'/%3e%3ctext x='50' y='30' font-size='30' text-anchor='middle' fill='%23475569' font-weight='bold'%3e?%3c/text%3e%3c/svg%3e`,
    LOVE: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M50,85 C-20,40 50,10 50,30 C50,10 120,40 50,85 Z' fill='%23ef4444'/%3e%3c/svg%3e`,
    SHOCKED: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ccircle cx='50' cy='50' r='40' fill='%23fde047' stroke='%23475569' stroke-width='4'/%3e%3ccircle cx='35' cy='40' r='8' fill='white'/%3e%3ccircle cx='35' cy='40' r='3' fill='black'/%3e%3ccircle cx='65' cy='40' r='8' fill='white'/%3e%3ccircle cx='65' cy='40' r='3' fill='black'/%3e%3cellipse cx='50' cy='70' rx='15' ry='10' fill='white' stroke='black' stroke-width='2'/%3e%3c/svg%3e`,
    ANGRY: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ccircle cx='50' cy='50' r='40' fill='%23f87171' stroke='%237f1d1d' stroke-width='4'/%3e%3cpath d='M30 35 l15 5 M70 35 l-15 5' fill='none' stroke='%237f1d1d' stroke-width='6' stroke-linecap='round'/%3e%3cpath d='M35 70 q 15 -15 30 0' fill='none' stroke='%237f1d1d' stroke-width='4' stroke-linecap='round'/%3e%3c/svg%3e`,
    SAD: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ccircle cx='50' cy='50' r='40' fill='%2393c5fd' stroke='%231e3a8a' stroke-width='4'/%3e%3ccircle cx='35' cy='40' r='5' fill='%231e3a8a'/%3e%3ccircle cx='65' cy='40' r='5' fill='%231e3a8a'/%3e%3cpath d='M35 70 q 15 -15 30 0' fill='none' stroke='%231e3a8a' stroke-width='4' stroke-linecap='round'/%3e%3c/svg%3e`,
    NATURE: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M50 90 V 10' stroke='%2384cc16' stroke-width='8' stroke-linecap='round'/%3e%3cpath d='M50 60 c 20 0 20-30 0-30 c -20 0 -20 30 0 30 Z' fill='%23a3e635'/%3e%3c/svg%3e`,
    POINTING: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M30 50 h50 l-15 -10 v20 Z' fill='%2364748b'/%3e%3c/svg%3e`,
    THINKING: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ccircle cx='50' cy='60' r='25' fill='%23e2e8f0' stroke='%2364748b' stroke-width='4'/%3e%3ccircle cx='20' cy='30' r='10' fill='%23e2e8f0' stroke='%2364748b' stroke-width='4'/%3e%3ccircle cx='30' cy='15' r='5' fill='%23e2e8f0' stroke='%2364748b' stroke-width='4'/%3e%3c/svg%3e`,
    CELEBRATING: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M50,10 L40,40 L10,40 L35,60 L25,90 L50,70 L75,90 L65,60 L90,40 L60,40 Z' fill='%23facc15'/%3e%3c/svg%3e`,
    SIGN: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect x='10' y='20' width='80' height='30' rx='5' fill='%23e2e8f0' stroke='%2364748b' stroke-width='4'/%3e%3cpath d='M50 50 V 80' stroke='%2364748b' stroke-width='6' stroke-linecap='round'/%3e%3c/svg%3e`,
    WORKING: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect x='20' y='30' width='60' height='40' rx='5' fill='%23e2e8f0' stroke='%2364748b' stroke-width='4'/%3e%3crect x='10' y='70' width='80' height='5' rx='2' fill='%2364748b'/%3e%3c/svg%3e`,
    READING: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M20 80 V 20 h50 v60 l-25 -15 Z' fill='%2393c5fd' stroke='%231e3a8a' stroke-width='4' stroke-linejoin='round'/%3e%3cpath d='M70 20 h5 v60 h-5 Z' fill='%231e3a8a'/%3e%3c/svg%3e`,
    LISTENING: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M50 20 c 20 0 20 60 0 60 C 20 80 20 40 35 30 S 50 20 50 20 Z' fill='%23e2e8f0' stroke='%2364748b' stroke-width='4'/%3e%3c/svg%3e`,
    IDEA: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M50 10 C 30 10, 20 30, 30 50 C 40 70, 60 70, 70 50 C 80 30, 70 10, 50 10 Z' fill='%23fef08a'/%3e%3crect x='40' y='70' width='20' height='20' rx='5' fill='%23e2e8f0'/%3e%3c/svg%3e`,
    STORMY_MOOD: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M20 60 a20 20 0 0 1 0 -40 h40 a20 20 0 0 1 0 40 Z' fill='%2394a3b8'/%3e%3cpath d='M50 50 l-10 20 h20 l-10 -20 Z' fill='%23facc15' transform='translate(0, 10)'/%3e%3c/svg%3e`,
};


export const displaySticker: FunctionDeclaration = {
  name: 'displaySticker',
  description: 'Displays a sticker in the chat to visually express an emotion or concept.',
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
