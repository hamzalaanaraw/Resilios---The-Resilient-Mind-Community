
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/config";
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { WellnessPlan } from './components/WellnessPlan';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { CrisisModal } from './components/CrisisModal';
import { DailyFocus } from './components/DailyFocus';
import { Message, WellnessPlanData, View, Attachment, GroundingChunk, CheckInData, LiveConversation, SavedMeditation, Notification, NotificationType } from './types';
import { CRISIS_TRIGGER_PHRASES, INITIAL_WELLNESS_PLAN, STICKERS, displaySticker } from './constants';
import { Nav } from './components/Nav';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LiveAvatarView } from './components/LiveAvatarView';
import { WellnessCalendar } from './components/WellnessCalendar';
import { LiveHistoryPage } from './components/LiveHistoryPage';
import { LandingPage } from './components/LandingPage';
import { NotificationToast } from './components/NotificationToast';
import { VerifyEmailScreen } from './components/VerifyEmailScreen';

const DAILY_LIMIT = 100;

const App: React.FC = () => {
  const { user, logout, isPremium, subscribe } = useAuth();
  const [view, setView] = useState<View>('chat');
  const [showLandingPage, setShowLandingPage] = useState(true);

  const [usage, setUsage] = useState({ count: 0, date: new Date().toDateString() });
  const [dailyChallenge, setDailyChallenge] = useState({ text: "", completed: false });
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [wellnessPlan, setWellnessPlan] = useState<WellnessPlanData>(INITIAL_WELLNESS_PLAN);
  const [isCheckInVisible, setCheckInVisible] = useState(false);
  const [isCrisisModalVisible, setCrisisModalVisible] = useState(false);
  const [isSubscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestMood, setLatestMood] = useState<number | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInData[]>([]);
  const [liveHistory, setLiveHistory] = useState<LiveConversation[]>([]);
  const [initError, setInitError] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // States for WellnessPlan components
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [isGeneratingMeditation, setIsGeneratingMeditation] = useState(false);
  const [generatedMeditationScript, setGeneratedMeditationScript] = useState("");
  const [savedMeditations, setSavedMeditations] = useState<SavedMeditation[]>([]);
  
  const aiRef = useRef<GoogleGenAI | null>(null);

  // Initialize AI client using the provided environment variable
  useEffect(() => {
    if (process.env.API_KEY) {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      setInitError("API Connection missing.");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.wellnessPlan) setWellnessPlan(data.wellnessPlan);
        if (data.challenge && data.challenge.date === new Date().toDateString()) {
            setDailyChallenge({ text: data.challenge.text, completed: data.challenge.completed });
        }
        if (data.usage && data.usage.date === new Date().toDateString()) {
          setUsage(data.usage);
        } else {
          updateDoc(userDocRef, { "usage.count": 0, "usage.date": new Date().toDateString() });
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  const generateDailyChallenge = async () => {
    if (!aiRef.current || !user) return;
    try {
        const result = await aiRef.current.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ text: `Based on this Wellness Plan: ${JSON.stringify(wellnessPlan)}, suggest one VERY SMALL (micro-step) daily resilience task (max 10 words). Focus on stability.` }] }
        });
        // Accessing .text property as per @google/genai guidelines
        const text = result.text?.trim().replace(/"/g, '') || '';
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { 
            challenge: { text, completed: false, date: new Date().toDateString() } 
        });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
      if (user && !dailyChallenge.text) {
          generateDailyChallenge();
      }
  }, [user, dailyChallenge.text]);

  const toggleChallenge = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { "challenge.completed": !dailyChallenge.completed });
  };

  const handleSendMessage = useCallback(async (text: string, options: { attachment?: Attachment }) => {
    if (CRISIS_TRIGGER_PHRASES.some(p => text.toLowerCase().includes(p))) {
      setCrisisModalVisible(true);
      return;
    }

    if (!isPremium && usage.count >= DAILY_LIMIT) {
      setSubscriptionModalVisible(true);
      return;
    }

    setIsLoading(true);
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        updateDoc(userDocRef, { "usage.count": usage.count + 1 });
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text, timestamp: new Date(), attachment: options.attachment };
    setAllMessages(prev => [...prev, userMsg]);

    try {
      if (!aiRef.current) throw new Error("AI not ready");

      const parts: any[] = [{ text: `CONTEXT: ${JSON.stringify(wellnessPlan)}\nMOOD: ${latestMood}\nCHALLENGE_STATUS: ${dailyChallenge.completed ? 'Done' : 'Pending'}\nUSER: ${text}` }];
      if (options.attachment) {
        parts.push({
          inlineData: {
            data: options.attachment.data,
            mimeType: options.attachment.mimeType
          }
        });
      }

      const result = await aiRef.current.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts }
      });

      // result.text is a property, not a method
      const modelMsg: Message = { id: crypto.randomUUID(), role: 'model', text: result.text || '', timestamp: new Date() };
      setAllMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      setNotification({ id: 'err', type: 'error', message: "AI connection lost." });
    } finally {
      setIsLoading(false);
    }
  }, [isPremium, usage.count, wellnessPlan, user, latestMood, dailyChallenge.completed]);

  // Wellness Plan Handlers
  const handleGeneratePrompts = async () => {
    if (!aiRef.current) return;
    setIsGeneratingPrompts(true);
    try {
      const result = await aiRef.current.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on my current wellness plan: ${JSON.stringify(wellnessPlan)}, generate 5 personalized deep reflection journal prompts.`
      });
      setWellnessPlan(prev => ({
        ...prev,
        journalPrompts: { ...prev.journalPrompts, content: result.text || '' }
      }));
    } catch (e) {
      setNotification({ id: 'err', type: 'error', message: "Failed to generate prompts." });
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  const handleSaveEntry = async (key: keyof WellnessPlanData) => {
    if (!user) return;
    const section = wellnessPlan[key];
    const newEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      content: section.content
    };
    const updatedHistory = [newEntry, ...(section.history || [])];
    const updatedPlan = {
      ...wellnessPlan,
      [key]: { ...section, history: updatedHistory }
    };
    setWellnessPlan(updatedPlan);
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { wellnessPlan: updatedPlan });
  };

  const handleGenerateMeditation = async () => {
    if (!aiRef.current) return;
    setIsGeneratingMeditation(true);
    try {
      const result = await aiRef.current.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Write a short, 3-minute guided meditation script focusing on resilience and grounding. Keep it peaceful and slow-paced."
      });
      setGeneratedMeditationScript(result.text || '');
    } catch (e) {
      setNotification({ id: 'err', type: 'error', message: "Failed to generate meditation." });
    } finally {
      setIsGeneratingMeditation(false);
    }
  };

  const handleSaveMeditation = (script: string) => {
    const newMeditation: SavedMeditation = {
      id: crypto.randomUUID(),
      name: `Meditation ${new Date().toLocaleDateString()}`,
      script
    };
    setSavedMeditations(prev => [...prev, newMeditation]);
    setGeneratedMeditationScript("");
    setNotification({ id: 'saved', type: 'success', message: "Meditation saved to favorites!" });
  };

  if (!user) return showLandingPage ? <LandingPage onGetStarted={() => setShowLandingPage(false)} onLogin={() => setShowLandingPage(false)} /> : <AuthScreen onBack={() => setShowLandingPage(true)} />;
  if (!user.emailVerified) return <VerifyEmailScreen />;

  return (
    <div className="flex flex-col h-[100dvh] font-sans antialiased text-slate-800 overflow-hidden bg-slate-50">
      <Header onMenuClick={() => setIsNavOpen(true)} />
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />

      <main className="flex-1 flex overflow-hidden">
        <Nav activeView={view} setView={setView} onCheckInClick={() => setCheckInVisible(true)} onLogout={() => { logout(); setShowLandingPage(true); }} onGoPremium={() => setSubscriptionModalVisible(true)} isPremium={isPremium} latestMood={latestMood} isNavOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {view === 'chat' && (
            <>
              <DailyFocus challenge={dailyChallenge.text} isCompleted={dailyChallenge.completed} onToggle={toggleChallenge} />
              <ChatWindow 
                messages={allMessages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
                onTextToSpeech={() => {}} 
                usageCount={usage.count} 
                dailyLimit={DAILY_LIMIT} 
                isPremium={isPremium} 
                latestMood={latestMood} 
                initError={initError} 
                onLoadMore={() => {}} 
                hasMore={false} 
              />
            </>
          )}
          {view === 'plan' && (
            <WellnessPlan 
              plan={wellnessPlan} 
              onPlanChange={(p) => setWellnessPlan(p)} 
              onGeneratePrompts={handleGeneratePrompts}
              onSaveEntry={handleSaveEntry}
              isGeneratingPrompts={isGeneratingPrompts}
              initError={initError}
              isGeneratingMeditation={isGeneratingMeditation}
              generatedMeditationScript={generatedMeditationScript}
              savedMeditations={savedMeditations}
              onGenerateMeditation={handleGenerateMeditation}
              onPlayMeditation={() => {}}
              onSaveMeditation={handleSaveMeditation}
              onDeleteMeditation={(id) => setSavedMeditations(prev => prev.filter(m => m.id !== id))}
            />
          )}
          {view === 'calendar' && <WellnessCalendar history={checkInHistory} wellnessPlan={wellnessPlan} insights="" isGenerating={false} onGenerateInsights={() => {}} initError={null} />}
          {view === 'liveAvatar' && isPremium && <LiveAvatarView ai={aiRef.current} onSaveConversation={() => {}} />}
        </div>
      </main>

      {isCheckInVisible && <DailyCheckInModal onClose={() => setCheckInVisible(false)} onSubmit={(m, n) => { setLatestMood(m); setCheckInHistory(prev => [...prev, { mood: m, notes: n, date: new Date() }]); setCheckInVisible(false); }} />}
      {isCrisisModalVisible && <CrisisModal onClose={() => setCrisisModalVisible(false)} />}
      {isSubscriptionModalVisible && <SubscriptionModal onClose={() => setSubscriptionModalVisible(false)} onSubscribe={() => { subscribe(); setSubscriptionModalVisible(false); }} />}
    </div>
  );
};

// Fix: Export the App component as default to resolve the missing default export error in index.tsx
export default App;
