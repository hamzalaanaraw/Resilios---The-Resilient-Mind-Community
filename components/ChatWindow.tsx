import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Message, Attachment, MessageRole } from '../types';
import { IMAGES, STICKERS } from '../constants';
import { fileToBase64 } from '../utils/file';
import { BrainIcon, CheckIcon, CopyIcon, GoogleIcon, LocationMarkerIcon, PaperclipIcon, SpeakerphoneIcon, StickerIcon, VideoCameraIcon } from './Icons';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string, options: {
    attachment?: Attachment,
    isSearchEnabled?: boolean,
    isDeepThinkingEnabled?: boolean,
    userLocation?: { latitude: number, longitude: number } | null,
    sticker?: string,
  }) => Promise<void>;
  isLoading: boolean;
  onTextToSpeech: (text: string) => void;
  initError: string | null;
}

interface MessageGroup {
    id: string;
    role: MessageRole;
    messages: Message[];
    startTime: Date;
    endTime: Date;
}

// --- Sub-components ---

const ToolbarToggle: React.FC<{
    isActive: boolean;
    onClick: () => void;
    label: string;
    children: React.ReactNode;
    title?: string;
    disabled?: boolean;
}> = ({ isActive, onClick, label, children, title, disabled=false }) => (
    <button 
        onClick={onClick} 
        className={`flex items-center space-x-1.5 px-3 py-2 text-xs md:text-sm font-medium rounded-full transition-all duration-200 shadow-sm border 
        ${isActive 
            ? 'bg-sky-500 text-white border-sky-600 shadow-md transform scale-105' 
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
        aria-label={label} 
        title={title} 
        disabled={disabled}
    >
        {children}
        <span className="hidden sm:inline">{label}</span>
    </button>
);

const MessageBubble: React.FC<{
  message: Message;
  isUser: boolean;
  isFirst: boolean;
  isLast: boolean;
  isOnly: boolean;
  onTextToSpeech: (text: string) => void;
}> = ({ message, isUser, isFirst, isLast, isOnly, onTextToSpeech }) => {
    const [copied, setCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSpeak = async () => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        await onTextToSpeech(message.text);
        setIsSpeaking(false);
    };

    // Calculate border radius classes
    let radiusClass = 'rounded-2xl';
    if (isUser) {
        if (isOnly) radiusClass += ' rounded-br-sm';
        else if (isFirst) radiusClass += ' rounded-br-xl';
        else if (isLast) radiusClass += ' rounded-br-sm rounded-tr-md';
        else radiusClass += ' rounded-r-md';
    } else {
        if (isOnly) radiusClass += ' rounded-bl-sm';
        else if (isFirst) radiusClass += ' rounded-bl-xl';
        else if (isLast) radiusClass += ' rounded-bl-sm rounded-tl-md';
        else radiusClass += ' rounded-l-md';
    }

    // Sticker only message?
    if (message.sticker && !message.text) {
        return (
             <div className="mb-1">
                 {STICKERS[message.sticker] && (
                    <img 
                        src={STICKERS[message.sticker]} 
                        alt={message.sticker} 
                        className="w-32 h-32 object-contain drop-shadow-md hover:scale-105 transition-transform" 
                    />
                )}
             </div>
        );
    }

    return (
        <div className={`relative group mb-1 max-w-full ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`px-4 py-3 shadow-sm text-[15px] md:text-base leading-relaxed break-words relative transition-all duration-200 
                ${isUser 
                    ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white' 
                    : 'bg-white border border-slate-100 text-slate-800'
                } ${radiusClass} ${message.isLiveTranscription ? 'opacity-75' : ''}`}
            >
                {/* Sticker with Text */}
                {message.sticker && STICKERS[message.sticker] && (
                    <div className="mb-3 flex justify-center">
                        <img src={STICKERS[message.sticker]} alt={message.sticker} className="w-24 h-24 object-contain" />
                    </div>
                )}

                {/* Attachments */}
                {message.attachment && (
                    <div className="mb-2">
                         {message.attachment.mimeType.startsWith('image/') ? (
                            <img src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} alt="attachment" className="rounded-lg max-h-60 w-auto object-cover" />
                        ) : message.attachment.mimeType.startsWith('video/') ? (
                             <div className="rounded-lg p-3 bg-slate-800 text-white flex items-center gap-2">
                                <VideoCameraIcon className="w-5 h-5" />
                                <span className="text-sm">Video attached</span>
                            </div>
                        ) : (
                             <audio controls src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} className="w-full" />
                        )}
                    </div>
                )}

                {/* Text Content */}
                {message.text && <div className="whitespace-pre-wrap">{message.text}</div>}
                
                {/* Deep Thinking Badge */}
                {!isUser && message.wasDeepThinking && (
                     <div className="mt-2 flex items-center text-xs text-sky-600 font-medium">
                        <BrainIcon />
                        <span className="ml-1">Deep Thinking</span>
                    </div>
                )}

                {/* Grounding Sources */}
                {message.groundingChunks && message.groundingChunks.length > 0 && (
                     <div className="mt-3 pt-3 border-t border-slate-200/50">
                        <p className="text-xs font-semibold mb-1 opacity-70">Sources:</p>
                        <ul className="space-y-1">
                        {message.groundingChunks.map((chunk, idx) => {
                             const source = chunk.web || chunk.maps;
                             if (!source) return null;
                             return (
                                 <li key={idx}>
                                     <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline flex items-center gap-1">
                                         <span className="truncate max-w-[200px]">{source.title}</span>
                                     </a>
                                 </li>
                             );
                        })}
                        </ul>
                    </div>
                )}
            </div>

            {/* Actions (visible on hover for desktop, always for last message on mobile/AI) */}
            {!isUser && !message.isLiveTranscription && message.text && (
                <div className="absolute top-full left-0 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1 rounded-lg">
                    <button onClick={handleCopy} className="p-1.5 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-sky-600 shadow-sm" aria-label="Copy">
                        {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                    <button onClick={handleSpeak} className="p-1.5 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-sky-600 shadow-sm" aria-label="Speak">
                        {isSpeaking ? <div className="w-3 h-3 bg-sky-500 rounded-full animate-ping" /> : <SpeakerphoneIcon />}
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, onTextToSpeech, initError }) => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isDeepThinkingEnabled, setIsDeepThinkingEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isStickerPickerOpen, setStickerPickerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickerPickerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (stickerPickerRef.current && !stickerPickerRef.current.contains(event.target as Node)) {
            setStickerPickerOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
        const base64Data = await fileToBase64(file);
        setAttachment({ data: base64Data, mimeType: file.type });
    }
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || attachment) && !isLoading) {
      await onSendMessage(input.trim(), { attachment, isSearchEnabled, isDeepThinkingEnabled, userLocation });
      setInput('');
      setAttachment(null);
    }
  };

  const handleSendSticker = (stickerName: string) => {
    onSendMessage('', { sticker: stickerName });
    setStickerPickerOpen(false);
  }

  const handleGetLocation = () => {
    if (userLocation) {
        setUserLocation(null);
        return;
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Could not get location.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
  };

  // Group messages logic
  const groupedMessages = useMemo(() => {
    if (messages.length === 0) return [];
    
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup = {
        id: `group-${messages[0].id}`,
        role: messages[0].role,
        messages: [messages[0]],
        startTime: messages[0].timestamp,
        endTime: messages[0].timestamp
    };

    for (let i = 1; i < messages.length; i++) {
        const msg = messages[i];
        const prevMsg = messages[i - 1];
        
        // Group if same role and < 2 minutes apart
        const isSameRole = msg.role === prevMsg.role;
        const isRecent = msg.timestamp.getTime() - prevMsg.timestamp.getTime() < 2 * 60 * 1000;

        if (isSameRole && isRecent) {
            currentGroup.messages.push(msg);
            currentGroup.endTime = msg.timestamp;
        } else {
            groups.push(currentGroup);
            currentGroup = {
                id: `group-${msg.id}`,
                role: msg.role,
                messages: [msg],
                startTime: msg.timestamp,
                endTime: msg.timestamp
            };
        }
    }
    groups.push(currentGroup);
    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4 space-y-6">
        {groupedMessages.map((group, groupIndex) => {
            const isUser = group.role === 'user';
            const showDateHeader = groupIndex === 0 || 
                (group.startTime.getTime() - groupedMessages[groupIndex - 1].endTime.getTime() > 10 * 60 * 1000);

            return (
                <div key={group.id}>
                    {/* Date Header */}
                    {showDateHeader && (
                        <div className="flex justify-center mb-6">
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                {group.startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </span>
                        </div>
                    )}

                    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                        {/* Avatar for Model */}
                        {!isUser && (
                            <div className="flex flex-col justify-end mr-2 mb-1">
                                <img src={IMAGES.avatar} alt="AI" className="w-8 h-8 rounded-full shadow-sm" />
                            </div>
                        )}

                        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
                            {group.messages.map((msg, idx) => (
                                <MessageBubble 
                                    key={msg.id}
                                    message={msg}
                                    isUser={isUser}
                                    isFirst={idx === 0}
                                    isLast={idx === group.messages.length - 1}
                                    isOnly={group.messages.length === 1}
                                    onTextToSpeech={onTextToSpeech}
                                />
                            ))}
                            
                            {/* Group Timestamp */}
                            <span className={`text-[10px] text-slate-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                                {group.endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </span>

                            {/* Suggested Stickers (Only for model group) */}
                            {!isUser && group.messages[group.messages.length - 1].suggestedStickers && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {group.messages[group.messages.length - 1].suggestedStickers!.map(sName => (
                                        STICKERS[sName] && (
                                            <button 
                                                key={sName} 
                                                onClick={() => handleSendSticker(sName)}
                                                className="w-10 h-10 p-1 bg-white rounded-lg border border-slate-200 shadow-sm hover:scale-110 transition"
                                                title={`Send ${sName}`}
                                            >
                                                <img src={STICKERS[sName]} alt={sName} className="w-full h-full object-contain" />
                                            </button>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}

        {/* Loading Indicator */}
        {isLoading && (
             <div className="flex w-full justify-start animate-fadeIn">
                <div className="flex flex-col justify-end mr-2 mb-1">
                    <img src={IMAGES.avatar} alt="AI" className="w-8 h-8 rounded-full shadow-sm" />
                </div>
                <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-1">
                     <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-10 sticky bottom-0 pb-safe">
        {initError && (
          <div className="mb-2 p-2 bg-red-50 text-red-600 text-xs rounded-lg text-center border border-red-100">
            {initError}
          </div>
        )}
        
        {/* Sticker Picker */}
        {isStickerPickerOpen && (
            <div ref={stickerPickerRef} className="absolute bottom-full mb-4 left-4 right-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 grid grid-cols-4 sm:grid-cols-6 gap-4 max-h-60 overflow-y-auto z-20 animate-fadeIn">
                {Object.entries(STICKERS).map(([name, url]) => (
                    <button key={name} onClick={() => handleSendSticker(name)} className="aspect-square p-2 rounded-xl hover:bg-sky-50 transition-colors flex items-center justify-center">
                        <img src={url} alt={name} className="w-full h-full object-contain" />
                    </button>
                ))}
            </div>
        )}

        {/* Attachment Preview */}
        {attachment && (
            <div className="mb-3 mx-1 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    {attachment.mimeType.startsWith('image/') ? (
                        <img src={`data:${attachment.mimeType};base64,${attachment.data}`} alt="preview" className="h-12 w-12 rounded-lg object-cover border border-slate-200" />
                    ) : (
                        <div className="h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center">
                            <VideoCameraIcon className="text-white w-6 h-6"/>
                        </div>
                    )}
                    <span className="text-sm font-medium text-slate-700">Media attached</span>
                </div>
                <button onClick={() => setAttachment(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex items-end space-x-2">
            <button type="button" onClick={() => setStickerPickerOpen(p => !p)} className="p-3 text-slate-400 hover:text-sky-500 transition-colors rounded-full hover:bg-slate-50" aria-label="Stickers" disabled={!!initError}>
                <StickerIcon />
            </button>
            
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl flex items-center px-2 py-1 focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-300 transition-all">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-sky-500 transition-colors" aria-label="Attach" disabled={!!initError}>
                    <PaperclipIcon />
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={initError ? "Connecting..." : "Message Resilios..."}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 px-2 py-2 text-base max-h-32"
                    disabled={isLoading || !!initError}
                />
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
            </div>

            <button
                type="submit"
                disabled={isLoading || (!input.trim() && !attachment) || !!initError}
                className="p-3 bg-sky-500 text-white rounded-full shadow-md hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all transform active:scale-95"
                aria-label="Send"
            >
                <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>
        </form>

        {/* Tools Toolbar */}
        <div className="mt-3 flex items-center justify-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            <ToolbarToggle isActive={isSearchEnabled} onClick={() => setIsSearchEnabled(p => !p)} label="Web" disabled={!!initError}><GoogleIcon/></ToolbarToggle>
            <ToolbarToggle isActive={!!userLocation} onClick={handleGetLocation} label="Location" disabled={!!initError}><LocationMarkerIcon className="w-4 h-4"/></ToolbarToggle>
            <ToolbarToggle isActive={isDeepThinkingEnabled} onClick={() => setIsDeepThinkingEnabled(p => !p)} label="Deep Think" disabled={!!initError}><BrainIcon/></ToolbarToggle>
        </div>
      </div>
    </div>
  );
};