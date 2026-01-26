
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Message, Attachment } from '../types';
import { IMAGES } from '../constants';
import { blobToBase64, fileToBase64 } from '../utils/file';
import { PaperclipIcon, SpeakerphoneIcon, VideoCameraIcon, BrainIcon, MicrophoneIcon, StopIcon, TrashIcon, SparklesIcon } from './Icons';
import { AnimatedResilios, ResiliosEmotion } from './AnimatedResilios';
import { useAuth } from '../contexts/AuthContext';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string, options: { attachment?: Attachment }) => Promise<void>;
  isLoading: boolean;
  onTextToSpeech: (text: string) => void;
  initError: string | null;
  onLoadMore: () => void;
  hasMore: boolean;
  usageCount: number;
  dailyLimit: number;
  isPremium: boolean;
  onUpgrade: () => void;
  latestMood?: number | null;
}

const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    }).format(date);
};

const MessageBubble: React.FC<{
  message: Message;
  isUser: boolean;
  onTextToSpeech: (text: string) => void;
}> = ({ message, isUser, onTextToSpeech }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const handleSpeak = async () => {
        setIsSpeaking(true);
        await onTextToSpeech(message.text);
        setIsSpeaking(false);
    };

    const isAudio = message.attachment?.mimeType.startsWith('audio/');

    return (
        <div className={`relative group mb-4 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[88%] px-4 py-3 shadow-sm text-[15px] leading-relaxed break-words relative transition-all duration-200 
                ${isUser ? 'bg-sky-500 text-white rounded-2xl rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-none'}`}>
                {message.attachment && (
                    <div className="mb-2">
                         {message.attachment.mimeType.startsWith('image/') ? (
                            <img src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} alt="attachment" className="rounded-lg max-h-64 w-full object-cover shadow-sm" />
                        ) : isAudio ? (
                            <div className="bg-sky-600/20 p-2 rounded-xl flex flex-col gap-2">
                                <div className="text-[10px] font-bold opacity-70 flex items-center gap-1"><MicrophoneIcon /> Voice Note</div>
                                <audio controls className="max-w-full h-8 opacity-90 brightness-100 accent-sky-500" src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} />
                            </div>
                        ) : (
                             <div className="rounded-lg p-3 bg-slate-800 text-white text-xs flex items-center gap-2 font-bold"><VideoCameraIcon className="w-4 h-4" /> Media Attachment</div>
                        )}
                    </div>
                )}
                {message.text && <div className="whitespace-pre-wrap">{message.text}</div>}
                
                <div className={`text-[10px] mt-1.5 font-bold opacity-50 ${isUser ? 'text-right' : 'text-left'}`}>
                    {formatTime(new Date(message.timestamp))}
                </div>
            </div>
            
            {!isUser && message.text && (
                <div className="flex items-center gap-2 mt-1">
                    <button onClick={handleSpeak} className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg">
                        {isSpeaking ? <div className="w-3 h-3 bg-sky-500 rounded-full animate-ping" /> : <SpeakerphoneIcon />}
                    </button>
                </div>
            )}
        </div>
    );
};

const TypingIndicator = () => (
    <div className="flex gap-1.5 items-center px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none w-fit ml-9 mb-4 shadow-sm animate-view">
        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div>
    </div>
);

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, onTextToSpeech, usageCount, dailyLimit, isPremium, onUpgrade, latestMood }) => {
  const { isTrialActive, trialDaysLeft, hasPremiumAccess } = useAuth();
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);

  const isLimitReached = !hasPremiumAccess && usageCount >= dailyLimit;
  const isNearLimit = !hasPremiumAccess && usageCount >= (dailyLimit * 0.8) && usageCount < dailyLimit;
  const usagePercentage = Math.min((usageCount / dailyLimit) * 100, 100);

  const currentEmotion = useMemo<ResiliosEmotion>(() => {
    if (isLoading) return 'thinking';
    if (messages.length === 0) return 'listening';
    
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'user') return 'listening';
    
    const text = lastMsg.text.toLowerCase();
    if (text.includes('sorry') || text.includes('hard') || text.includes('struggle')) return 'worried';
    if (text.includes('great') || text.includes('good') || text.includes('happy') || text.includes('resilient')) return 'supportive';
    
    return 'idle';
  }, [isLoading, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 300);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickActions = useMemo(() => {
    if (latestMood && latestMood <= 3) return ["I'm struggling", "Crisis plan", "Quick breath"];
    if (latestMood && latestMood <= 6) return ["Journal prompt", "Mood reset", "Need focus"];
    return ["Daily goal", "Gratitude", "Just chatting"];
  }, [latestMood]);

  const handleSend = async (textToSend: string = input) => {
    if ((textToSend.trim() || attachment) && !isLoading && !isLimitReached) {
      await onSendMessage(textToSend.trim(), { attachment });
      setInput('');
      setAttachment(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
        
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const base64 = await blobToBase64(audioBlob);
        setAttachment({
          data: base64,
          mimeType: mimeType
        });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to record messages.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setAttachment(null);
    }
  };

  const formatRecordingTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-1 no-scrollbar"
      >
        {messages.length === 0 && (
            <div className="text-center py-12 px-6 animate-pop">
                <div className="mb-8">
                    <AnimatedResilios emotion="listening" size={240} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">I'm listening.</h3>
                <p className="text-slate-500 text-sm max-w-[240px] mx-auto leading-relaxed font-medium">I'm here to support your stability. How's your energy today?</p>
            </div>
        )}
        
        {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'model' && (
                  <div className="mr-2 mt-auto mb-5">
                    <AnimatedResilios emotion={currentEmotion} size={40} className="rounded-full bg-white ring-1 ring-slate-100 shadow-sm" />
                  </div>
                )}
                <MessageBubble message={m} isUser={m.role === 'user'} onTextToSpeech={onTextToSpeech} />
            </div>
        ))}
        
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {showScrollDown && (
          <button 
            onClick={scrollToBottom}
            className="absolute bottom-40 right-6 p-3 bg-white border border-slate-200 rounded-full shadow-lg text-sky-600 hover:text-sky-700 transition-all animate-pop z-10"
          >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </button>
      )}

      {/* Premium/Trial Limit Indicator */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-white/60 backdrop-blur-md">
        {isPremium ? (
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-600">
            <span className="flex items-center gap-1.5"><SparklesIcon /> Premium Subscription</span>
            <span className="bg-emerald-100 px-2 py-0.5 rounded-full">Unlimited</span>
          </div>
        ) : isTrialActive ? (
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-sky-600">
            <span className="flex items-center gap-1.5"><SparklesIcon /> Premium Trial</span>
            <span className="bg-sky-100 px-2 py-0.5 rounded-full">{trialDaysLeft} Days Remaining</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className={isNearLimit ? 'text-amber-600' : 'text-slate-400'}>Daily Free Usage</span>
              <span className={isNearLimit ? 'text-amber-600' : 'text-slate-500'}>{usageCount} / {dailyLimit}</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${isNearLimit ? 'bg-amber-400' : 'bg-sky-400'}`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth bg-white/30">
        {!isRecording && quickActions.map(action => (
            <button 
                key={action}
                onClick={() => handleSend(action)}
                disabled={isLoading || isLimitReached}
                className="whitespace-nowrap px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-600 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-all active:scale-95 disabled:opacity-30 shadow-sm"
            >
                {action}
            </button>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md bg-white/95">
        {attachment && (
            <div className="mb-4 flex items-center justify-between bg-sky-50/50 p-2 px-3 rounded-2xl border border-sky-100 animate-pop">
                <span className="text-xs font-black text-sky-700 flex items-center gap-2">
                    {attachment.mimeType.startsWith('audio/') ? (
                        <><MicrophoneIcon /> Audio Message Ready</>
                    ) : (
                        <><PaperclipIcon className="w-3.5 h-3.5"/> Attachment Ready</>
                    )}
                </span>
                <button onClick={() => setAttachment(null)} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm">&times;</button>
            </div>
        )}

        {isLimitReached ? (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center animate-view">
                <div className="text-3xl mb-2">🚀</div>
                <p className="text-base font-black text-slate-900">Reach your potential.</p>
                <p className="text-xs text-slate-500 mb-4 font-medium">You've hit your {dailyLimit} message daily limit.</p>
                <button 
                    onClick={onUpgrade}
                    className="w-full px-6 py-3.5 bg-sky-500 text-white text-sm font-black rounded-xl uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-600 transition-all active:scale-95"
                >
                    Unlock Unlimited Access
                </button>
            </div>
        ) : (
            <div className="flex flex-col">
                {isRecording ? (
                    <div className="flex items-center gap-3 bg-red-50 p-2.5 px-4 rounded-[1.5rem] border border-red-100 animate-pulse">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                        <span className="flex-1 text-sm font-black text-red-600 tracking-wider">Recording... {formatRecordingTime(recordingSeconds)}</span>
                        <button 
                            onClick={cancelRecording} 
                            type="button"
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <TrashIcon />
                        </button>
                        <button 
                            onClick={stopRecording} 
                            type="button"
                            className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-xl shadow-lg shadow-red-100 active:scale-95"
                        >
                            <StopIcon />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-end gap-3">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-[1.75rem] flex items-center px-4 py-1.5 transition-all focus-within:bg-white focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-400/10">
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()} 
                                className="p-2 text-slate-400 hover:text-sky-500 transition-colors"
                            >
                                <PaperclipIcon />
                            </button>
                            <input 
                                type="text" 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)} 
                                placeholder="Write your thoughts..." 
                                className="flex-1 bg-transparent border-none text-[15px] py-3 px-1 focus:ring-0 placeholder-slate-400 font-medium text-slate-800" 
                            />
                            <button 
                                type="button" 
                                onClick={startRecording}
                                className="p-2 text-slate-400 hover:text-sky-500 transition-colors"
                            >
                                <MicrophoneIcon />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) setAttachment({ data: await fileToBase64(file), mimeType: file.type });
                            }} />
                        </div>
                        <button 
                            type="submit" 
                            disabled={(!input.trim() && !attachment) || isLoading} 
                            className="w-[56px] h-[56px] flex items-center justify-center bg-sky-500 text-white rounded-2xl shadow-xl shadow-sky-200 active:scale-95 transition-all disabled:opacity-20 disabled:shadow-none"
                        >
                            <svg className="w-6 h-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        </button>
                    </form>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
