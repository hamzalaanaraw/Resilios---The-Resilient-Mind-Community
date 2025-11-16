import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from "@google/genai";
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { WellnessPlan } from './components/WellnessPlan';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { CrisisModal } from './components/CrisisModal';
import { Message, WellnessPlanData, View, Attachment, GroundingChunk, CheckInData } from './types';
import { CRISIS_TRIGGER_PHRASES, INITIAL_WELLNESS_PLAN, LIVE_SYSTEM_PROMPT, displaySticker } from './constants';
import { Nav } from './components/Nav';
import { createBlob, decode, decodeAudioData } from './utils/audio';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { SubscriptionModal } from './components/SubscriptionModal';
import { MapComponent } from './components/MapComponent';
import { LiveAvatarView } from './components/LiveAvatarView';
import { TimeChart } from './components/TimeChart';


// A simple client-side check for crisis phrases.
const checkForCrisis = (text: string): boolean => {
  const lowerCaseText = text.toLowerCase();
  return CRISIS_TRIGGER_PHRASES.some(phrase => lowerCaseText.includes(phrase));
};

const loadFromLocalStorage = (key: string, defaultValue: any, parseDates: boolean = false) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    const parsed = JSON.parse(saved);
    if (parseDates && Array.isArray(parsed)) {
      // JSON stringifies dates as strings, so we need to convert them back to Date objects
      return parsed.map((item: any) => ({ ...item, date: new Date(item.date) }));
    }
    return parsed;
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return defaultValue;
  }
};


const App: React.FC = () => {
  const { user, logout, isPremium, subscribe } = useAuth();

  const [view, setView] = useState<View>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [wellnessPlan, setWellnessPlan] = useState<WellnessPlanData>(() => loadFromLocalStorage('wellnessPlan', INITIAL_WELLNESS_PLAN));
  const [isCheckInVisible, setCheckInVisible] = useState(false);
  const [isCrisisModalVisible, setCrisisModalVisible] = useState(false);
  const [isSubscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [latestMood, setLatestMood] = useState<number | null>(() => loadFromLocalStorage('latestMood', null));
  
  // TimeChart state
  const [checkInHistory, setCheckInHistory] = useState<CheckInData[]>(() => loadFromLocalStorage('checkInHistory', [], true));
  const [aiInsights, setAiInsights] = useState('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Nav state
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Map State
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [mapResults, setMapResults] = useState<GroundingChunk[]>([]);
  const [mapUserLocation, setMapUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);

  // Live API State
  const [isVoiceChatActive, setVoiceChatActive] = useState(false);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  
  const [liveSticker, setLiveSticker] = useState<string | null>(null);
  const liveStickerTimeoutRef = useRef<number | null>(null);


  const ai = useRef<GoogleGenAI | null>(null);
  
  // Initialize AI client
  useEffect(() => {
    if (process.env.API_KEY) {
      ai.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      console.error("API_KEY environment variable not set.");
    }
  }, []);

  // Effect to save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wellnessPlan', JSON.stringify(wellnessPlan));
  }, [wellnessPlan]);
  
  useEffect(() => {
    localStorage.setItem('checkInHistory', JSON.stringify(checkInHistory));
  }, [checkInHistory]);

  useEffect(() => {
    localStorage.setItem('latestMood', JSON.stringify(latestMood));
  }, [latestMood]);


  // Effect to load user data on login
  useEffect(() => {
    if (user) {
      console.log(`Logged in as ${user.email}. Loading data...`);
      // Reset non-persistent state on login, but keep persisted state from localStorage
      setMessages([
        {
          role: 'model',
          text: `Welcome back, ${user.email.split('@')[0]}! I'm here to listen. How are you feeling today?`,
          timestamp: new Date(),
        },
      ]);
      setAiInsights('');
    }
  }, [user]);
  
  // Effect to navigate to avatar view on premium subscription
  useEffect(() => {
      if (isPremium && view !== 'liveAvatar') {
          const timeoutId = setTimeout(() => {
              setView('liveAvatar');
          }, 500); // Short delay to make the transition feel deliberate
          return () => clearTimeout(timeoutId);
      }
  // This effect should ONLY run when `isPremium` changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium]);


  const handleSendMessage = useCallback(async (text: string, options: {
    attachment?: Attachment,
    isSearchEnabled?: boolean,
    isDeepThinkingEnabled?: boolean,
    userLocation?: { latitude: number, longitude: number } | null,
    sticker?: string,
  }) => {
    if (checkForCrisis(text)) {
      setCrisisModalVisible(true);
      return;
    }

    setIsLoading(true);

    const userMessage: Message = {
      role: 'user',
      text,
      timestamp: new Date(),
      attachment: options.attachment,
      sticker: options.sticker,
      wasDeepThinking: options.isDeepThinkingEnabled,
    };

    const modelText = options.sticker 
        ? `(User sent the ${options.sticker} sticker) ${text}` 
        : text;

    setMessages(prev => [...prev, userMessage]);

    if (!ai.current) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, the chat service isn't available right now.", timestamp: new Date() }]);
      setIsLoading(false);
      return;
    }

    try {
      const isVideo = options.attachment?.mimeType.startsWith('video/');
      const modelName = isVideo || options.isDeepThinkingEnabled ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

      const parts: any[] = [];

      if(options.attachment) {
        parts.push({
            inlineData: {
                mimeType: options.attachment.mimeType,
                data: options.attachment.data
            }
        });
      }
      parts.push({ text: `CONTEXT: User's Wellness Plan: ${JSON.stringify(wellnessPlan)}\n\n---\n\nMESSAGE: ${modelText}` });

      const config: any = {};
      const tools: any[] = [{functionDeclarations: [displaySticker]}];
      if (options.isSearchEnabled) tools.push({ googleSearch: {} });
      if (options.userLocation) tools.push({ googleMaps: {} });

      config.tools = tools;
      
      if (options.userLocation) {
        config.toolConfig = { retrievalConfig: { latLng: { ...options.userLocation }}};
      }
      if (options.isDeepThinkingEnabled || isVideo) {
          config.thinkingConfig = { thinkingBudget: 32768 };
      }

      const result = await ai.current.models.generateContent({
        model: modelName,
        contents: { parts: parts },
        ... (Object.keys(config).length > 0 && { config })
      });
      
      let stickerName: string | undefined;
      const functionCalls = result.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const stickerCall = functionCalls.find(fc => fc.name === 'displaySticker');
        if (stickerCall) {
            stickerName = stickerCall.args.stickerName;
        }
      }

      const modelMessage: Message = {
        role: 'model',
        text: result.text,
        timestamp: new Date(),
        groundingChunks: result.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [],
        sticker: stickerName,
      };
      
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      const errorMessage: Message = {
        role: 'model',
        text: "I'm having a little trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [wellnessPlan]);

  const handleWellnessPlanChange = (newPlan: WellnessPlanData) => {
    setWellnessPlan(newPlan);
  };

  const handleGenerateJournalPrompts = async () => {
    if (!ai.current) {
        setMessages(prev => [...prev, { role: 'model', text: "Sorry, the AI service isn't available right now.", timestamp: new Date() }]);
        return;
    }
    setIsGeneratingPrompts(true);
    try {
        const prompt = `Based on the user's wellness plan below, generate 3 thoughtful and personalized journal prompts to encourage self-reflection. The prompts should be concise, open-ended, and sensitive to mental health topics. Return them as a numbered list (e.g., "1. ...").\n\n---\n\nWELLNESS PLAN CONTEXT:\n${JSON.stringify(wellnessPlan)}`;
        
        const result = await ai.current.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const updatedPlan = {
            ...wellnessPlan,
            journalPrompts: {
                ...wellnessPlan.journalPrompts,
                content: result.text.trim(),
            }
        };
        handleWellnessPlanChange(updatedPlan);
    } catch (error) {
        console.error("Error generating journal prompts:", error);
        const updatedPlan = {
             ...wellnessPlan,
            journalPrompts: {
                ...wellnessPlan.journalPrompts,
                content: "Sorry, I couldn't generate prompts right now. Please try again.",
            }
        };
        handleWellnessPlanChange(updatedPlan);
    } finally {
        setIsGeneratingPrompts(false);
    }
  };
  
   const handleMapSearch = async (query: string) => {
    if (!ai.current) {
        alert("Sorry, the map service isn't available right now.");
        return;
    }
    setIsMapLoading(true);
    setMapResults([]);

    let location: { latitude: number, longitude: number } | null = null;
    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        setMapUserLocation(location);
    } catch (error) {
        console.error("Geolocation error:", error);
        alert("Could not get your location. Please enable location services in your browser settings to use this feature.");
        setIsMapLoading(false);
        return;
    }

    try {
        const result = await ai.current.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find ${query} near me.`,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: { latLng: { ...location } }
                }
            }
        });
        
        const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
        setMapResults(chunks.filter(c => c.maps));
    } catch (error) {
        console.error("Error searching for places via Gemini:", error);
        alert("Sorry, I couldn't fetch local results. Please try again.");
    } finally {
        setIsMapLoading(false);
    }
  };

  const handleCheckInSubmit = async (mood: number, notes: string) => {
    setCheckInVisible(false);
    setLatestMood(mood);

    const newCheckIn: CheckInData = { mood, notes, date: new Date() };
    setCheckInHistory(prev => [...prev, newCheckIn]);
    
    const checkInText = `My mood is ${mood}/10. Notes: ${notes || 'No notes.'}`;
    handleSendMessage(`(This is a daily check-in) ${checkInText}`, {});
  };
  
  const handleGenerateInsights = async () => {
    if (!ai.current) {
        setAiInsights("Sorry, the AI service isn't available right now.");
        return;
    }
    if (checkInHistory.length < 3) {
        setAiInsights("I need a little more data to spot trends. Keep up with your daily check-ins, and I'll have insights for you soon!");
        return;
    }

    setIsGeneratingInsights(true);
    setAiInsights('');

    const historySummary = checkInHistory
        .map(c => `Date: ${c.date.toLocaleDateString()}, Mood: ${c.mood}/10, Notes: "${c.notes}"`)
        .join('\n');

    const prompt = `Based on the user's mood history and wellness plan below, generate thoughtful insights about their journey. Identify potential patterns, correlations between their notes and mood, and offer gentle, encouraging observations. Do not give medical advice. Frame the insights positively, focusing on progress and self-awareness. The response should be in markdown format with headings (e.g., ###) and bullet points (e.g., *).

---

MOOD HISTORY:
${historySummary}

---

WELLNESS PLAN CONTEXT:
${JSON.stringify(wellnessPlan)}
`;

    try {
        const result = await ai.current.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        setAiInsights(result.text);
    } catch (error) {
        console.error("Error generating insights:", error);
        setAiInsights("I had trouble analyzing the data right now. Please try again in a moment.");
    } finally {
        setIsGeneratingInsights(false);
    }
};


  const handleTextToSpeech = async (text: string) => {
     if (!ai.current) return null;
     try {
        const response = await ai.current.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.start();
        }
     } catch(error) {
        console.error("TTS Error:", error);
     }
  };
  
   const toggleVoiceChat = useCallback(async () => {
    if (!ai.current) return;
    
    if (isVoiceChatActive) {
        setVoiceChatActive(false);
        sessionPromiseRef.current?.then(session => session.close());
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        audioContextRef.current?.close();
        sessionPromiseRef.current = null;
        return;
    }

    setVoiceChatActive(true);

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();
    let currentInputTranscription = '';
    let currentOutputTranscription = '';

    sessionPromiseRef.current = ai.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: async () => {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;
                const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                audioContextRef.current = inputAudioContext;
                const source = inputAudioContext.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                scriptProcessorRef.current = scriptProcessor;

                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromiseRef.current?.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio) {
                    nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputAudioContext.destination);
                    source.addEventListener('ended', () => sources.delete(source));
                    source.start(nextStartTime);
                    nextStartTime += audioBuffer.duration;
                }

                if (message.serverContent?.interrupted) {
                    sources.forEach(source => source.stop());
                    sources.clear();
                    nextStartTime = 0;
                }

                if (message.serverContent?.inputTranscription) {
                  currentInputTranscription += message.serverContent.inputTranscription.text;
                  setMessages(prev => {
                      const last = prev[prev.length - 1];
                      if (last?.role === 'user' && last.isLiveTranscription) {
                          const updatedMessages = [...prev];
                          updatedMessages[prev.length - 1] = { ...last, text: currentInputTranscription };
                          return updatedMessages;
                      }
                      return [...prev, { role: 'user', text: currentInputTranscription, timestamp: new Date(), isLiveTranscription: true }];
                  });
                }

                if (message.serverContent?.outputTranscription) {
                    currentOutputTranscription += message.serverContent.outputTranscription.text;
                    setMessages(prev => {
                        const last = prev[prev.length - 1];
                        if (last?.role === 'model' && last.isLiveTranscription) {
                            const updatedMessages = [...prev];
                            updatedMessages[prev.length - 1] = { ...last, text: currentOutputTranscription };
                            return updatedMessages;
                        }
                        return [...prev, { role: 'model', text: currentOutputTranscription, timestamp: new Date(), isLiveTranscription: true }];
                    });
                }
                
                if (message.serverContent?.turnComplete) {
                   setMessages(prev => prev.map(msg => ({ ...msg, isLiveTranscription: false })));
                   currentInputTranscription = '';
                   currentOutputTranscription = '';
                }
            },
            onerror: (e) => {
                console.error('Live session error:', e);
                setVoiceChatActive(false);
            },
            onclose: () => {
                console.log('Live session closed');
                setVoiceChatActive(false);
            },
        },
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: LIVE_SYSTEM_PROMPT,
            tools: [{functionDeclarations: [displaySticker]}]
        },
    });

}, [isVoiceChatActive]);


  const renderView = () => {
    switch (view) {
      case 'chat':
        return <ChatWindow
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onTextToSpeech={handleTextToSpeech}
                  isVoiceChatActive={isVoiceChatActive}
                  toggleVoiceChat={toggleVoiceChat}
                  />;
      case 'plan':
        return <WellnessPlan 
                  plan={wellnessPlan} 
                  onPlanChange={handleWellnessPlanChange}
                  onGeneratePrompts={handleGenerateJournalPrompts}
                  isGeneratingPrompts={isGeneratingPrompts}
                />;
      case 'map':
        return <MapComponent
                  onSearch={handleMapSearch}
                  isLoading={isMapLoading}
                  results={mapResults}
                  userLocation={mapUserLocation}
                />;
       case 'timeChart':
        return <TimeChart
                  history={checkInHistory}
                  onGenerateInsights={handleGenerateInsights}
                  insights={aiInsights}
                  isGenerating={isGeneratingInsights}
                />;
      case 'liveAvatar':
          return <LiveAvatarView />;
      default:
        return <ChatWindow
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onTextToSpeech={handleTextToSpeech}
                  isVoiceChatActive={isVoiceChatActive}
                  toggleVoiceChat={toggleVoiceChat}
                  />;
    }
  };

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="flex flex-col h-screen font-sans antialiased text-slate-800">
      <Header onMenuClick={() => setIsNavOpen(true)} />
      <main className="flex-1 flex overflow-hidden relative">
        <Nav 
            activeView={view} 
            setView={setView} 
            onCheckInClick={() => setCheckInVisible(true)} 
            onLogout={logout}
            onGoPremium={() => setSubscriptionModalVisible(true)}
            isPremium={isPremium}
            latestMood={latestMood}
            isNavOpen={isNavOpen}
            onClose={() => setIsNavOpen(false)}
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          {renderView()}
        </div>
      </main>
      {isCheckInVisible && (
        <DailyCheckInModal
          onClose={() => setCheckInVisible(false)}
          onSubmit={handleCheckInSubmit}
        />
      )}
      {isCrisisModalVisible && (
        <CrisisModal onClose={() => setCrisisModalVisible(false)} />
      )}
      {isSubscriptionModalVisible && (
          <SubscriptionModal 
            onClose={() => setSubscriptionModalVisible(false)} 
            onSubscribe={() => {
                subscribe();
                setSubscriptionModalVisible(false);
            }}
          />
      )}
    </div>
  );
};

export default App;