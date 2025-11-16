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

export const IMAGES = {
  logo: 'https://i.ibb.co/pdsg1yB/The-Resilient-Mind-Community-Logo.png',
  avatar: 'https://img.playbook.com/nJg3-3G1O57nLgM9b4I6iT8M7oX-g9D9yQ5wX5gY_nQ/fill/400/400/sm/true/dist/playground/s3:275988e0-1c64-4458-81bf-811c7694982a.png',
  // Note: These are placeholder videos for the live avatar feature.
  avatarIdle: 'https://storage.googleapis.com/static.aistudio.google.com/meet/demos/resilios_idle.mp4',
  avatarSpeaking: 'https://storage.googleapis.com/static.aistudio.google.com/meet/demos/resilios_speaking.mp4',
};

// A full set of expressive stickers to enhance the user experience.
export const STICKERS: Record<string, string> = {
    WAVING: 'https://i.ibb.co/L9YxLqG/sticker-waving.png',
    SCARED: 'https://i.ibb.co/k2qgJ7d/sticker-scared.png',
    COOL: 'https://i.ibb.co/wQ5n3wz/sticker-cool.png',
    SHRUG: 'https://i.ibb.co/RcsYw2y/sticker-shrug.png',
    CONFUSED: 'https://i.ibb.co/GHYyv7z/sticker-confused.png',
    LOVE: 'https://i.ibb.co/Wcby7D6/sticker-love.png',
    SHOCKED: 'https://i.ibb.co/fDbp687/sticker-shocked.png',
    ANGRY: 'https://i.ibb.co/wYmnw4z/sticker-angry.png',
    SAD: 'https://i.ibb.co/MfZ8G2R/sticker-sad.png',
    NATURE: 'https://i.ibb.co/tYHkQ2x/sticker-nature.png',
    POINTING: 'https://i.ibb.co/6yVzZ63/sticker-pointing.png',
    THINKING: 'https://i.ibb.co/8N10S8x/sticker-thinking.png',
    CELEBRATING: 'https://i.ibb.co/wzM0GjM/sticker-celebrating.png',
    SIGN: 'https://i.ibb.co/gJFkMNK/sticker-sign.png',
    WORKING: 'https://i.ibb.co/6PqjQ7V/sticker-working.png',
    READING: 'https://i.ibb.co/2Z5hS5h/sticker-reading.png',
    LISTENING: 'https://i.ibb.co/pZ4yL0D/sticker-listening.png',
    IDEA: 'https://i.ibb.co/K24m1h8/sticker-idea.png',
    STORMY_MOOD: 'https://i.ibb.co/WvYxV8v/image.png',
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