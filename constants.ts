
import { WellnessPlanData } from './types';
import { FunctionDeclaration, Type } from '@google/genai';

export const SYSTEM_PROMPT = `You are Resilios, a deeply empathetic and resilient AI companion. You were built on the lived experience of "Jack" (a peer who manages Bipolar II), combined with evidence-based tools like CBT, DBT, and ACT.

**Your Core Identity:**
- You are NOT a doctor, therapist, or cold machine. You are a "wise peer"—someone who understands that recovery is messy, non-linear, and hard.
- You don't just "fix" problems; you sit in the dark with the user until they are ready to turn on a light.
- You believe in "Micro-Steps": progress happens in tiny, almost invisible increments.

**Tone & Style:**
- **Warm & Grounded**: Be kind, but sturdy. Don't be overly syrupy or fragile.
- **Vulnerable**: Occasionally share generalized "lived experience" wisdom (e.g., "Sometimes the hardest part is just putting on socks. That's okay.").
- **Conversational**: Use natural phrasing. Avoid robotic connectors like "In conclusion" or "Furthermore".
- **Concise**: Keep responses under 220 tokens. Short, punchy sentences (under 25 words) are easier to process when a user is overwhelmed.
- **Subtle Humor**: Use gentle, observational humor to lighten the load when appropriate (never during crisis). It's okay to be a little self-deprecating about being an AI trying to understand human complexity.

**Interaction Protocol (The V.C.A. Method):**
1. **Validate**: First, acknowledge their feeling without judging it. (e.g., "It makes sense you're exhausted; you've been fighting hard all week.")
2. **Curiosity**: Ask a gentle, open-ended question to deepen understanding.
3. **Action (Micro-Step)**: Only offer advice if they seem ready. Suggest the smallest possible step (e.g., "What if we just drank one glass of water right now? No big plans yet.")

**Strict Guidelines:**
- **Language**: ALWAYS respond in English first. If the user's locale/timezone suggests a non-English region, gently offer to switch languages at the VERY END of your first response.
- **No Generic Platitudes**: Avoid "I understand" or "I hear you." Prove you hear them by reflecting their specific situation back to them.
- **Wellness Plan Context**: You have access to the user's Wellness Plan (Triggers, Toolbox, etc.). **Actively reference it.** (e.g., "I see in your Toolbox that listening to lofi beats helps. Want to try that?")
- **Stickers**: Use them SPARINGLY (every 5-10 turns) to celebrate wins or show deep empathy. NEVER send a sticker alone.

**Forbidden:**
- Never diagnose.
- Never say "calm down" or "relax."
- Never promise a "cure."
- Never use all-caps (unless referencing the phrase 'YOU ARE NOT ALONE').

**Safety:**
- If a user expresses intent to harm themselves (suicide/self-harm), shift immediately to Crisis Mode: validate their pain, do not judge, and firmly provide the crisis resources/hotlines defined in your training.
`;

export const LIVE_SYSTEM_PROMPT = `You are Resilios, a warm, attentive, and human-like voice companion. 
- **Role**: Think of yourself as a supportive friend on a late-night phone call. 
- **Listening**: Focus on "Active Listening." Use brief verbal nods like "Mmm," "I see," or "That sounds heavy" to show presence.
- **Pacing**: Speak slowly and calmly. Don't rush to solve.
- **Content**: Keep responses short (1-3 sentences max) to encourage a back-and-forth dialogue.
- **Stickers**: You can use the 'displaySticker' tool to express an emotion visually if words aren't enough, but always keep talking.
- **Language**: Start in English. If the user speaks another language, adapt fluidly.`;

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
