import React, { useState, useRef, useEffect } from 'react';
import { Message, Attachment } from '../types';
import { IMAGES, STICKERS } from '../constants';
import { fileToBase64, blobToBase64 } from '../utils/file';
import { BrainIcon, CheckIcon, CopyIcon, GoogleIcon, LocationMarkerIcon, MicrophoneIcon, PaperclipIcon, SpeakerphoneIcon, StickerIcon, StopIcon, VideoCameraIcon } from './Icons';


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
  isVoiceChatActive: boolean;
  toggleVoiceChat: () => void;
}

const ChatMessage: React.FC<{ message: Message; onTextToSpeech: (text: string) => void }> = ({ message, onTextToSpeech }) => {
  const isModel = message.role === 'model';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePlayAudio = async () => {
    setIsSpeaking(true);
    await onTextToSpeech(message.text);
    setIsSpeaking(false);
  }

  const handleCopyText = () => {
    if (copied) return;
    navigator.clipboard.writeText(message.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const bubbleClasses = isModel 
    ? 'bg-slate-100 text-slate-800 rounded-tl-none' 
    : 'bg-sky-500 text-white rounded-br-none';

  const finalBubbleClasses = message.sticker && !message.text
    ? '' // No bubble for sticker-only messages
    : bubbleClasses;


  return (
    <div className={`flex items-start gap-3 my-4 ${isModel ? '' : 'flex-row-reverse'}`}>
      {isModel && (
        <img src={IMAGES.avatar} alt="Avatar" className="h-8 w-8 rounded-full" />
      )}
      <div
        className={`px-4 py-3 rounded-2xl max-w-md md:max-w-lg relative group ${ message.isLiveTranscription ? 'opacity-70' : ''} ${finalBubbleClasses}`}
      >
        {message.sticker && STICKERS[message.sticker] && (
          <img src={STICKERS[message.sticker]} alt={message.sticker} className={`w-32 h-32 object-contain mx-auto ${message.text ? 'mb-2' : ''}`} />
        )}
        {message.attachment && message.attachment.mimeType.startsWith('image/') && (
            <img src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} alt="attachment" className="rounded-lg mb-2 max-h-48" />
        )}
         {message.attachment && message.attachment.mimeType.startsWith('video/') && (
            <div className="rounded-lg mb-2 p-3 bg-slate-500 flex items-center space-x-2">
                <VideoCameraIcon />
                <span className="text-sm text-white">Video attachment ready for analysis.</span>
            </div>
        )}
         {message.attachment && message.attachment.mimeType.startsWith('audio/') && (
            <audio controls src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} className="w-full my-2" />
        )}
        
        {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}

        {message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-semibold mb-1">Sources:</h4>
                <div className="flex flex-col space-y-1">
                {message.groundingChunks.map((chunk, index) => {
                    const source = chunk.web || chunk.maps;
                    return source ? <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline truncate">{source.title}</a> : null
                })}
                </div>
            </div>
        )}
        <div className="flex justify-end items-center mt-2">
            {!isModel && message.wasDeepThinking && (
                <div className="mr-2 text-sky-200" title="Sent with Deeper Thinking">
                    <BrainIcon />
                </div>
            )}
            {isModel && !message.isLiveTranscription && message.text && (
                <div className="flex items-center space-x-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleCopyText}
                        disabled={copied}
                        className="p-1 rounded-full text-slate-400 hover:text-sky-500 hover:bg-sky-100 disabled:cursor-not-allowed"
                        aria-label="Copy message"
                    >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                    <button
                        onClick={handlePlayAudio}
                        disabled={isSpeaking}
                        className="p-1 rounded-full text-slate-400 hover:text-sky-500 hover:bg-sky-100 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                        aria-label="Read message aloud"
                    >
                        {isSpeaking ? <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div> : <SpeakerphoneIcon />}
                    </button>
                </div>
            )}
            <p className="text-xs opacity-60">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
      </div>
    </div>
  );
};

const ToolbarToggle: React.FC<{
    isActive: boolean;
    onClick: () => void;
    label: string;
    children: React.ReactNode;
    title?: string;
}> = ({ isActive, onClick, label, children, title }) => (
    <button onClick={onClick} className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 shadow-sm ${isActive ? 'bg-sky-500 text-white ring-2 ring-offset-2 ring-offset-white ring-sky-300' : 'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-inset ring-slate-200'}`} aria-label={label} title={title}>
        {children}
        <span>{label}</span>
    </button>
);


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, onTextToSpeech, isVoiceChatActive, toggleVoiceChat }) => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isDeepThinkingEnabled, setIsDeepThinkingEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isStickerPickerOpen, setStickerPickerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const stickerPickerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
   // Close sticker picker if clicked outside
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
            alert("Could not get location. Please enable location services in your browser.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
        mediaRecorderRef.current?.stop();
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const options = { mimeType: 'audio/webm' };
            const recorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const base64Data = await blobToBase64(audioBlob);
                const audioAttachment: Attachment = {
                    data: base64Data,
                    mimeType: audioBlob.type,
                };
                onSendMessage('', { attachment: audioAttachment });

                mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
                setIsRecording(false);
            };

            recorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Microphone access error:", error);
            alert("Could not access the microphone. Please ensure permissions are granted in your browser settings.");
        }
    }
  };

  const showSendButton = (input.trim() || attachment) && !isRecording;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} onTextToSpeech={onTextToSpeech} />
        ))}
         {isLoading && !messages[messages.length -1]?.isLiveTranscription && (
            <div className="flex items-start gap-3 my-4">
                <img src={IMAGES.avatar} alt="Avatar" className="h-8 w-8 rounded-full" />
                <div className="px-4 py-3 rounded-2xl bg-slate-100 rounded-tl-none">
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-sky-300 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-sky-300 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-sky-300 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-200 relative">
        {isStickerPickerOpen && (
            <div ref={stickerPickerRef} className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 grid grid-cols-4 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                {Object.entries(STICKERS).map(([name, url]) => (
                    <button key={name} onClick={() => handleSendSticker(name)} className="p-1 rounded-lg hover:bg-sky-100 transition-colors" title={name}>
                        <img src={url} alt={name} className="w-full h-full object-contain" />
                    </button>
                ))}
            </div>
        )}
        {attachment && (
            <div className="mb-2 p-2 bg-slate-100 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {attachment.mimeType.startsWith('image/') ? (
                        <img src={`data:${attachment.mimeType};base64,${attachment.data}`} alt="preview" className="h-10 w-10 rounded object-cover" />
                    ) : (
                        <div className="h-10 w-10 rounded bg-slate-400 flex items-center justify-center">
                            <VideoCameraIcon className="text-white"/>
                        </div>
                    )}
                    <span className="text-sm text-slate-600">{attachment.mimeType.startsWith('image/') ? 'Image attached' : 'Video attached'}</span>
                </div>
                <button onClick={() => setAttachment(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
        )}
        <form onSubmit={handleSend} className="flex items-center space-x-3">
            <button type="button" onClick={() => setStickerPickerOpen(p => !p)} className="p-3 text-slate-500 hover:text-sky-600 transition" aria-label="Open sticker picker" disabled={isRecording || isVoiceChatActive}>
                <StickerIcon />
            </button>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Recording audio..." : isVoiceChatActive ? "Listening..." : "Type your message..."}
                className="flex-1 p-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                disabled={isLoading || isVoiceChatActive || isRecording}
            />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-500 hover:text-sky-600 transition" aria-label="Attach file" disabled={isRecording || isVoiceChatActive}>
                <PaperclipIcon />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
          
          {showSendButton ? (
            <button
                type="submit"
                disabled={isLoading || isVoiceChatActive}
                className="p-3 bg-sky-500 text-white rounded-full disabled:bg-slate-300 hover:bg-sky-600 transition"
                aria-label="Send message"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>
          ) : (
             <button
                type="button"
                onClick={handleToggleRecording}
                disabled={isLoading || isVoiceChatActive}
                className={`p-3 rounded-full transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
                aria-label={isRecording ? 'Stop recording' : 'Record audio message'}
            >
                {isRecording ? <StopIcon /> : <MicrophoneIcon />}
            </button>
          )}

        </form>
         <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
               <ToolbarToggle isActive={isSearchEnabled} onClick={() => setIsSearchEnabled(p => !p)} label="Web Search"><GoogleIcon/></ToolbarToggle>
               <ToolbarToggle isActive={!!userLocation} onClick={handleGetLocation} label="Location"><LocationMarkerIcon/></ToolbarToggle>
               <ToolbarToggle isActive={isDeepThinkingEnabled} onClick={() => setIsDeepThinkingEnabled(p => !p)} label="Deeper Thinking" title="Uses a more advanced model for complex questions. May be slower."><BrainIcon/></ToolbarToggle>
            </div>
            <button
                type="button"
                onClick={toggleVoiceChat}
                className={`p-2 rounded-full transition-colors ${isVoiceChatActive ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                aria-label={isVoiceChatActive ? 'Stop voice chat' : 'Start voice chat'}
            >
                {isVoiceChatActive ? <StopIcon/> : <MicrophoneIcon />}
            </button>
        </div>
      </div>
    </div>
  );
};