
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Message, Attachment } from '../types';
import { IMAGES, STICKERS } from '../constants';
import { fileToBase64, blobToBase64 } from '../utils/file';
import { PaperclipIcon, MicrophoneIcon, StopIcon, SpeakerphoneIcon, VideoCameraIcon, SparklesIcon, BrainIcon } from './Icons';

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
  latestMood?: number | null;
}

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

    return (
        <div className={`relative group mb-3 max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
            <div className={`px-4 py-3 shadow-sm text-[15px] leading-relaxed break-words relative transition-all duration-200 
                ${isUser ? 'bg-sky-500 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
                {message.attachment && (
                    <div className="mb-2">
                         {message.attachment.mimeType.startsWith('image/') ? (
                            <img src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} alt="attachment" className="rounded-lg max-h-60 w-auto object-cover" />
                        ) : (
                             <div className="rounded-lg p-2 bg-slate-800 text-white text-xs flex items-center gap-2"><VideoCameraIcon className="w-4 h-4" /> Media Attached</div>
                        )}
                    </div>
                )}
                {message.text && <div className="whitespace-pre-wrap">{message.text}</div>}
            </div>
            {!isUser && message.text && (
                <button onClick={handleSpeak} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-sky-500">
                    {isSpeaking ? <div className="w-3 h-3 bg-sky-500 rounded-full animate-ping" /> : <SpeakerphoneIcon />}
                </button>
            )}
        </div>
    );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, onTextToSpeech, usageCount, dailyLimit, isPremium, latestMood }) => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLimitReached = !isPremium && usageCount >= dailyLimit;
  const usagePercentage = Math.min((usageCount / dailyLimit) * 100, 100);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, isLoading]);

  const quickActions = useMemo(() => {
    if (latestMood && latestMood <= 3) return ["I'm struggling right now", "Crisis Protocol", "Deep breathing"];
    if (latestMood && latestMood <= 6) return ["Need a distraction", "Re-center me", "Journal prompt"];
    return ["Daily goal check", "Meditation ideas", "Just chatting"];
  }, [latestMood]);

  const handleSend = async (textToSend: string = input) => {
    if ((textToSend.trim() || attachment) && !isLoading && !isLimitReached) {
      await onSendMessage(textToSend.trim(), { attachment });
      setInput('');
      setAttachment(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 no-scrollbar">
        {messages.length === 0 && (
            <div className="text-center py-10 px-6">
                <div className="w-16 h-16 bg-sky-100 rounded-3xl flex items-center justify-center text-sky-500 mx-auto mb-4">
                    <BrainIcon />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Hello, I'm Resilios.</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">I'm here to support your stability. How are things feeling in your world today?</p>
            </div>
        )}
        {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'model' && <img src={IMAGES.avatar} className="w-7 h-7 rounded-full mr-2 mt-auto mb-3 border border-slate-200" />}
                <MessageBubble message={m} isUser={m.role === 'user'} onTextToSpeech={onTextToSpeech} />
            </div>
        ))}
        {isLoading && <div className="text-[10px] font-black text-sky-400 animate-pulse ml-9 tracking-widest uppercase">Analyzing...</div>}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {quickActions.map(action => (
            <button 
                key={action}
                onClick={() => handleSend(action)}
                disabled={isLoading || isLimitReached}
                className="whitespace-nowrap px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-sky-300 hover:text-sky-600 transition-all active:scale-95"
            >
                {action}
            </button>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {attachment && (
            <div className="mb-3 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><PaperclipIcon className="w-3 h-3"/> Media Attached</span>
                <button onClick={() => setAttachment(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400">&times;</button>
            </div>
        )}

        {isLimitReached ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                <p className="text-sm font-bold text-amber-900">100/100 Free Chats Used</p>
                <button className="mt-2 px-4 py-2 bg-amber-400 text-amber-900 text-xs font-black rounded-xl uppercase tracking-widest">Unlock Premium</button>
            </div>
        ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-end gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl flex items-center px-2 py-1 transition-all focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-400/10">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-sky-500"><PaperclipIcon /></button>
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder="Type something..." 
                        className="flex-1 bg-transparent border-none text-sm py-2 px-1 focus:ring-0 placeholder-slate-400" 
                    />
                    <input type="file" ref={fileInputRef} className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) setAttachment({ data: await fileToBase64(file), mimeType: file.type });
                    }} />
                </div>
                <button type="submit" disabled={(!input.trim() && !attachment) || isLoading} className="p-3 bg-sky-500 text-white rounded-2xl shadow-lg shadow-sky-200 active:scale-95 transition-all disabled:opacity-30">
                    <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
            </form>
        )}
      </div>
    </div>
  );
};
