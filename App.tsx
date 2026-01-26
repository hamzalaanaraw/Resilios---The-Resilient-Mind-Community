
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { doc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, limit, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase/config";
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { WellnessPlan } from './components/WellnessPlan';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { CrisisModal } from './components/CrisisModal';
import { DailyFocus } from './components/DailyFocus';
import { Message, WellnessPlanData, View, Attachment, CheckInData, LiveConversation, SavedMeditation, Notification, WellnessPlanEntry, MapSearch } from './types';
import { CRISIS_TRIGGER_PHRASES, INITIAL_WELLNESS_PLAN, SYSTEM_PROMPT } from './constants';
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
import { MissionPage } from './components/MissionPage';
import { ContactPage } from './components/ContactPage';
import { PoliciesPage } from './components/PoliciesPage';
import { MapComponent } from './components/MapComponent';

const DAILY_LIMIT = 100;

const App: React.FC = () => {
  const { user, logout, isPremium, hasPremiumAccess, subscribe } = useAuth();
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
  const [mapSearchHistory, setMapSearchHistory] = useState<MapSearch[]>([]);
  const [initError, setInitError] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [isGeneratingMeditation, setIsGeneratingMeditation] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isGeneratingCalendarInsights, setIsGeneratingCalendarInsights] = useState(false);
  const [planSynthesis, setPlanSynthesis] = useState<string>("");
  const [calendarInsights, setCalendarInsights] = useState<string>("");
  const [generatedMeditationScript, setGeneratedMeditationScript] = useState("");
  const [savedMeditations, setSavedMeditations] = useState<SavedMeditation[]>([]);
  
  const [mapResults, setMapResults] = useState<any[]>([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);

  const aiRef = useRef<GoogleGenAI | null>(null);

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
    
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.wellnessPlan) setWellnessPlan(data.wellnessPlan);
        if (data.planSynthesis) setPlanSynthesis(data.planSynthesis);
        if (data.calendarInsights) setCalendarInsights(data.calendarInsights);
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

    const checkinsRef = collection(db, "users", user.uid, "checkins");
    const qCheckins = query(checkinsRef, orderBy("date", "desc"), limit(50));
    const unsubCheckins = onSnapshot(qCheckins, (snap) => {
        const history = snap.docs.map(d => {
            const data = d.data();
            return {
                mood: data.mood,
                notes: data.notes,
                date: data.date.toDate ? data.date.toDate() : new Date(data.date)
            } as CheckInData;
        });
        setCheckInHistory(history);
        if (history.length > 0) setLatestMood(history[0].mood);
    });

    const meditationsRef = collection(db, "users", user.uid, "meditations");
    const unsubMeditations = onSnapshot(meditationsRef, (snap) => {
        setSavedMeditations(snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedMeditation)));
    });

    const liveRef = collection(db, "users", user.uid, "voice_logs");
    const qLive = query(liveRef, orderBy("timestamp", "desc"), limit(20));
    const unsubLive = onSnapshot(qLive, (snap) => {
        setLiveHistory(snap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                timestamp: data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
                transcript: data.transcript
            } as LiveConversation;
        }));
    });

    const mapHistoryRef = collection(db, "users", user.uid, "map_searches");
    const qMapHistory = query(mapHistoryRef, orderBy("timestamp", "desc"), limit(10));
    const unsubMapHistory = onSnapshot(qMapHistory, (snap) => {
        setMapSearchHistory(snap.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                query: data.query,
                timestamp: data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
            } as MapSearch;
        }));
    });

    return () => {
      unsubUser();
      unsubCheckins();
      unsubMeditations();
      unsubLive();
      unsubMapHistory();
    };
  }, [user]);

  const handleSendMessage = useCallback(async (text: string, options: { attachment?: Attachment }) => {
    if (CRISIS_TRIGGER_PHRASES.some(p => text.toLowerCase().includes(p))) {
      setCrisisModalVisible(true);
      return;
    }

    if (!hasPremiumAccess && usage.count >= DAILY_LIMIT) {
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

      const contextPrefix = `CONTEXT: ${JSON.stringify(wellnessPlan)}\nMOOD: ${latestMood}\nCHALLENGE_STATUS: ${dailyChallenge.completed ? 'Done' : 'Pending'}`;
      const promptParts: any[] = [];
      
      if (text.trim()) {
        promptParts.push({ text: `${contextPrefix}\nUSER_MESSAGE: ${text}` });
      } else {
        promptParts.push({ text: `${contextPrefix}\nUSER_SENT_ATTACHMENT_ONLY` });
      }

      if (options.attachment) {
        promptParts.push({
          inlineData: {
            data: options.attachment.data,
            mimeType: options.attachment.mimeType
          }
        });
      }

      const modelToUse = 'gemini-3-flash-preview';

      const result = await aiRef.current.models.generateContent({
        model: modelToUse,
        contents: { parts: promptParts },
        config: { systemInstruction: SYSTEM_PROMPT }
      });

      const modelMsg: Message = { id: crypto.randomUUID(), role: 'model', text: result.text || '', timestamp: new Date() };
      setAllMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      setNotification({ id: 'err', type: 'error', message: "I couldn't process that message. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }, [hasPremiumAccess, usage.count, wellnessPlan, user, latestMood, dailyChallenge.completed]);

  const handleCheckInSubmit = async (mood: number, notes: string) => {
    if (!user || !aiRef.current) return;
    
    setCheckInVisible(false);
    setIsLoading(true);
    setLatestMood(mood);

    try {
      const checkinsRef = collection(db, "users", user.uid, "checkins");
      await addDoc(checkinsRef, { mood, notes, date: new Date() });

      const userMsg: Message = { 
        id: crypto.randomUUID(), 
        role: 'user', 
        text: `I just logged my mood as ${mood}/10. ${notes ? `Here's what's on my mind: ${notes}` : ""}`, 
        timestamp: new Date() 
      };
      setAllMessages(prev => [...prev, userMsg]);

      const result = await aiRef.current.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `USER_CHECK_IN: Mood ${mood}/10, Notes: ${notes || "None"}\n\nRespond briefly as Resilios (a peer). Validate the feeling and offer one tiny micro-step based on their Wellness Plan if relevant.`,
        config: { systemInstruction: SYSTEM_PROMPT }
      });

      const modelMsg: Message = { 
        id: crypto.randomUUID(), 
        role: 'model', 
        text: result.text || 'I hear you. Thank you for sharing how you’re doing.', 
        timestamp: new Date() 
      };
      setAllMessages(prev => [...prev, modelMsg]);
      
      setView('chat');
      setNotification({ id: 'checkin', type: 'success', message: "Mood logged and analyzed." });

    } catch (e) {
      setNotification({ id: 'checkin-err', type: 'error', message: "Logged, but I couldn't generate a response." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCalendarInsights = async () => {
    if (!aiRef.current || !user || checkInHistory.length < 3) {
      setNotification({ id: 'insight-min', type: 'info', message: "I need at least 3 check-ins to start finding patterns." });
      return;
    }
    
    setIsGeneratingCalendarInsights(true);
    try {
      const dataForAnalysis = checkInHistory.slice(0, 10).map(h => ({
        mood: h.mood,
        notes: h.notes,
        date: h.date.toDateString()
      }));

      const result = await aiRef.current.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `MOOD_HISTORY: ${JSON.stringify(dataForAnalysis)}\nWELLNESS_PLAN: ${JSON.stringify(wellnessPlan)}\n\nAs Resilios, analyze these patterns. Look for early warning signs or resilience anchors being used. Provide a "Stability Forecast" for the next 3 days. Use warm, Markdown-formatted peer support language.`,
        config: { systemInstruction: SYSTEM_PROMPT }
      });

      const insights = result.text || '';
      setCalendarInsights(insights);
      await updateDoc(doc(db, "users", user.uid), { calendarInsights: insights });
      setNotification({ id: 'insight-success', type: 'success', message: "Insights updated." });
    } catch (e) {
      setNotification({ id: 'insight-err', type: 'error', message: "Failed to analyze patterns." });
    } finally {
      setIsGeneratingCalendarInsights(false);
    }
  };

  const handleMapSearch = async (searchQuery: string) => {
    if (!aiRef.current || !user) return;
    setIsSearchingMap(true);
    try {
      let lat = 37.78193; 
      let lng = -122.40476;
      if ("geolocation" in navigator) {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          lat = pos.coords.latitude; lng = pos.coords.longitude;
          setUserLocation({ latitude: lat, longitude: lng });
      }
      const response = await aiRef.current.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find ${searchQuery} near me. provide a list with names and Google Maps links.`,
        config: { tools: [{googleMaps: {}}], toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } } },
      });
      const results = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setMapResults(results);
      await addDoc(collection(db, "users", user.uid, "map_searches"), { query: searchQuery, timestamp: new Date() });
    } catch (e) {
      setNotification({ id: 'map-err', type: 'error', message: "Resource search failed." });
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleSaveMeditation = async (script: string) => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "meditations"), {
      name: `Meditation ${new Date().toLocaleDateString()}`,
      script,
      createdAt: new Date().toISOString()
    });
    setGeneratedMeditationScript("");
    setNotification({ id: 'saved', type: 'success', message: "Saved to your toolbox." });
  };

  const handleDeleteMeditation = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "meditations", id));
  };

  const handleSaveLiveConversation = async (transcript: any[]) => {
      if (!user || transcript.length === 0) return;
      await addDoc(collection(db, "users", user.uid, "voice_logs"), { transcript, timestamp: new Date() });
  };

  const handleSynthesizePlan = async () => {
    if (!aiRef.current || !user) return;
    setIsSynthesizing(true);
    try {
      const result = await aiRef.current.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on this wellness plan: ${JSON.stringify(wellnessPlan)}, synthesize a cohesive "Stability Guide" in Markdown. Focus on strengths and proactive steps.`
      });
      const synthesis = result.text || '';
      setPlanSynthesis(synthesis);
      await updateDoc(doc(db, "users", user.uid), { planSynthesis: synthesis });
    } catch (e) {
      setNotification({ id: 'synth-err', type: 'error', message: "Failed to synthesize your guide." });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleGeneratePrompts = async () => {
    if (!aiRef.current || !user) return;
    setIsGeneratingPrompts(true);
    try {
      const result = await aiRef.current.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 3 personalized, therapeutic journal prompts based on this user's current wellness plan: ${JSON.stringify(wellnessPlan)}`
      });
      const content = result.text || '';
      const newPlan = { ...wellnessPlan, journalPrompts: { ...wellnessPlan.journalPrompts, content } };
      setWellnessPlan(newPlan);
      await updateDoc(doc(db, "users", user.uid), { wellnessPlan: newPlan });
      setNotification({ id: 'prompts', type: 'success', message: "New prompts generated." });
    } catch (e) {
      setNotification({ id: 'prompt-err', type: 'error', message: "Failed to generate prompts." });
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  const handleSaveEntry = async (key: keyof WellnessPlanData) => {
    if (!user) return;
    const section = wellnessPlan[key];
    const newEntry: WellnessPlanEntry = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), content: section.content };
    const updatedHistory = [newEntry, ...(section.history || [])].slice(0, 10);
    const newPlan = { ...wellnessPlan, [key]: { ...section, history: updatedHistory } };
    setWellnessPlan(newPlan);
    await updateDoc(doc(db, "users", user.uid), { wellnessPlan: newPlan });
  };

  const handleGenerateMeditation = async () => {
    if (!aiRef.current || !user) return;
    setIsGeneratingMeditation(true);
    try {
      const result = await aiRef.current.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a short, grounded meditation for someone feeling at a mood of ${latestMood || 5}/10. Focus on deep breathing and physical safety.`
      });
      setGeneratedMeditationScript(result.text || '');
    } catch (e) {
      setNotification({ id: 'med-err', type: 'error', message: "Failed to create meditation." });
    } finally {
      setIsGeneratingMeditation(false);
    }
  };

  if (!user) return showLandingPage ? <LandingPage onGetStarted={() => setShowLandingPage(false)} onLogin={() => setShowLandingPage(false)} /> : <AuthScreen onBack={() => setShowLandingPage(true)} />;
  if (!user.emailVerified) return <VerifyEmailScreen />;

  return (
    <div className="flex flex-col h-[100dvh] font-sans antialiased text-slate-800 overflow-hidden bg-slate-50">
      <Header onMenuClick={() => setIsNavOpen(true)} />
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />

      <main className="flex-1 flex overflow-hidden">
        <Nav activeView={view} setView={setView} onCheckInClick={() => setCheckInVisible(true)} onLogout={() => { logout(); setShowLandingPage(true); }} onGoPremium={() => setSubscriptionModalVisible(true)} isPremium={hasPremiumAccess} latestMood={latestMood} isNavOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
        <div className="flex-1 flex flex-col min-h-0 relative bg-slate-50">
          <div key={view} className="absolute inset-0 flex flex-col animate-view overflow-hidden">
            {view === 'chat' && (
              <div className="flex flex-col h-full overflow-hidden">
                <DailyFocus challenge={dailyChallenge.text} isCompleted={dailyChallenge.completed} onToggle={async () => {
                    await updateDoc(doc(db, "users", user.uid), { "challenge.completed": !dailyChallenge.completed });
                }} />
                <ChatWindow messages={allMessages} onSendMessage={handleSendMessage} isLoading={isLoading} onTextToSpeech={() => {}} usageCount={usage.count} dailyLimit={DAILY_LIMIT} isPremium={hasPremiumAccess} onUpgrade={() => setSubscriptionModalVisible(true)} latestMood={latestMood} initError={initError} onLoadMore={() => {}} hasMore={false} />
              </div>
            )}
            {view === 'plan' && (
              <WellnessPlan plan={wellnessPlan} synthesis={planSynthesis} isSynthesizing={isSynthesizing} onSynthesize={handleSynthesizePlan} onPlanChange={async (p) => { setWellnessPlan(p); await updateDoc(doc(db, "users", user.uid), { wellnessPlan: p }); }} onGeneratePrompts={handleGeneratePrompts} onSaveEntry={handleSaveEntry} isGeneratingPrompts={isGeneratingPrompts} initError={initError} isGeneratingMeditation={isGeneratingMeditation} generatedMeditationScript={generatedMeditationScript} savedMeditations={savedMeditations} onGenerateMeditation={handleGenerateMeditation} onPlayMeditation={() => {}} onSaveMeditation={handleSaveMeditation} onDeleteMeditation={handleDeleteMeditation} />
            )}
            {view === 'calendar' && (
              <WellnessCalendar 
                history={checkInHistory} 
                wellnessPlan={wellnessPlan} 
                insights={calendarInsights} 
                isGenerating={isGeneratingCalendarInsights} 
                onGenerateInsights={handleGenerateCalendarInsights} 
                initError={null} 
              />
            )}
            {view === 'map' && <MapComponent onSearch={handleMapSearch} isLoading={isSearchingMap} results={mapResults} history={mapSearchHistory} userLocation={userLocation} initError={initError} />}
            {view === 'liveAvatar' && hasPremiumAccess && <LiveAvatarView ai={aiRef.current} onSaveConversation={handleSaveLiveConversation} />}
            {view === 'liveHistory' && <LiveHistoryPage history={liveHistory} />}
            {view === 'mission' && <MissionPage />}
            {view === 'contact' && <ContactPage />}
            {view === 'policies' && <PoliciesPage />}
          </div>
        </div>
      </main>

      {isCheckInVisible && <DailyCheckInModal onClose={() => setCheckInVisible(false)} onSubmit={handleCheckInSubmit} />}
      {isCrisisModalVisible && <CrisisModal onClose={() => setCrisisModalVisible(false)} />}
      {isSubscriptionModalVisible && <SubscriptionModal onClose={() => setSubscriptionModalVisible(false)} onSubscribe={() => { subscribe(); setSubscriptionModalVisible(false); }} />}
    </div>
  );
};

export default App;
