import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from "@google/genai";
import { LIVE_SYSTEM_PROMPT, displaySticker, STICKERS } from '../constants';
import { createBlob, decode, decodeAudioData } from '../utils/audio';
import { MicrophoneIcon, StopIcon } from './Icons';
import { LiveTranscriptPart } from '../types';

interface LiveAvatarViewProps {
    ai: GoogleGenAI | null;
    onSaveConversation: (transcript: LiveTranscriptPart[]) => void;
}


export const LiveAvatarView: React.FC<LiveAvatarViewProps> = ({ ai, onSaveConversation }) => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [statusText, setStatusText] = useState('Click below to start a conversation.');
    const [sticker, setSticker] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const stickerTimeoutRef = useRef<number | null>(null);
    const conversationRef = useRef<LiveTranscriptPart[]>([]);

    // Refs for the audio visualizer
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    
    useEffect(() => {
        return () => {
            // Cleanup on unmount
            sessionPromiseRef.current?.then(session => session.close());
            if (stickerTimeoutRef.current) clearTimeout(stickerTimeoutRef.current);
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        };
    }, []);

    const stopVisualizer = useCallback(() => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    const drawVisualizer = useCallback(() => {
        if (!analyserRef.current || !canvasRef.current) return;

        const analyser = analyserRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const dpr = window.devicePixelRatio || 1;
        const { width, height } = canvas.getBoundingClientRect();
        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
        }
        
        const draw = () => {
            animationFrameIdRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr, dpr);

            const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
            const corePulse = 1 + (average / 255) * 0.05;

            // --- 1. Background static rings ---
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(width/2, height/2, Math.min(width, height) * 0.25, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(width/2, height/2, Math.min(width, height) * 0.4, 0, 2 * Math.PI);
            ctx.stroke();

            // --- 2. Main visualizer wave ---
            const baseRadius = Math.min(width, height) * 0.3;
            ctx.beginPath();
            for (let i = 0; i <= 360; i += 5) {
                const angle = (i * Math.PI) / 180;
                const dataIndex = Math.floor((i / 360) * (bufferLength * 0.8));
                const amplitude = Math.pow(dataArray[dataIndex] / 255, 2.5) * (baseRadius * 0.6);
                const radius = baseRadius + amplitude;
                const x = width/2 + Math.cos(angle) * radius;
                const y = height/2 + Math.sin(angle) * radius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
            ctx.shadowColor = 'rgba(56, 189, 248, 1)';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // --- 3. Central pulsing orb ---
            const coreRadius = Math.min(width, height) * 0.1 * corePulse;
            const coreGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, coreRadius);
            coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            coreGradient.addColorStop(0.8, 'rgba(56, 189, 248, 0.5)');
            coreGradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(width/2, height/2, coreRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        };
        draw();
    }, []);

    const handleToggleSession = useCallback(async () => {
        if (isSessionActive) {
            sessionPromiseRef.current?.then(session => session.close());
            // The onclose callback will handle the rest of the cleanup.
            return;
        }

        if (!ai) {
            alert("AI service is not available or configured correctly.");
            return;
        }

        setIsSessionActive(true);
        setStatusText('Connecting...');
        conversationRef.current = [];

        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const analyser = outputAudioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;
        analyser.connect(outputAudioContext.destination);
        analyserRef.current = analyser;

        drawVisualizer();
        
        let nextStartTime = 0;
        let currentInputText = '';
        let currentModelText = '';

        const closeSession = () => {
            setIsSessionActive(false);
            setStatusText('Click below to start a conversation.');
            
            mediaStreamRef.current?.getTracks().forEach(track => track.stop());
            scriptProcessorRef.current?.disconnect();
            audioContextRef.current?.close();
            sessionPromiseRef.current = null;
            if (stickerTimeoutRef.current) clearTimeout(stickerTimeoutRef.current);
            stopVisualizer();

            // Save conversation
            if (conversationRef.current.length > 0) {
                onSaveConversation(conversationRef.current);
            }
            conversationRef.current = [];
        };

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    setStatusText('Listening... say something!');
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
                    if (message.serverContent?.inputTranscription?.text) {
                       currentInputText += message.serverContent.inputTranscription.text;
                       setStatusText(currentInputText);
                    }
                    if (message.serverContent?.outputTranscription?.text) {
                        currentModelText += message.serverContent.outputTranscription.text;
                        setStatusText(currentModelText);
                    }
                     if (message.serverContent?.turnComplete) {
                        if (currentInputText.trim()) {
                            conversationRef.current.push({ role: 'user', text: currentInputText.trim() });
                        }
                        if (currentModelText.trim()) {
                            conversationRef.current.push({ role: 'model', text: currentModelText.trim() });
                        }
                        currentInputText = '';
                        currentModelText = '';
                        setStatusText('Listening...');
                    }
                    
                    if (message.toolCall?.functionCalls) {
                        for (const fc of message.toolCall.functionCalls) {
                            if (fc.name === 'displaySticker' && fc.args.stickerName) {
                                setSticker(fc.args.stickerName as string);
                                if (stickerTimeoutRef.current) clearTimeout(stickerTimeoutRef.current);
                                stickerTimeoutRef.current = window.setTimeout(() => setSticker(null), 4000);
                            }
                        }
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        if(analyserRef.current) {
                           source.connect(analyserRef.current);
                        } else {
                           source.connect(outputAudioContext.destination);
                        }
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                    }
                },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    setStatusText('Connection error. Please try again.');
                    closeSession();
                },
                onclose: () => {
                    closeSession();
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

    }, [isSessionActive, ai, drawVisualizer, stopVisualizer, onSaveConversation]);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-sky-100 p-4">
            <div className="relative w-full max-w-sm aspect-square mb-6">
                 <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                {sticker && STICKERS[sticker] && (
                    <div className="absolute inset-0 flex items-center justify-center transition-all duration-300">
                        <style>{`
                            @keyframes fade-in {
                                0% { opacity: 0; transform: scale(0.8); }
                                100% { opacity: 1; transform: scale(1); }
                            }
                        `}</style>
                        <img 
                            src={STICKERS[sticker]} 
                            alt={sticker} 
                            className="w-48 h-48 object-contain drop-shadow-xl"
                            style={{animation: 'fade-in 0.5s ease-out'}}
                        />
                    </div>
                )}
            </div>
            
            <div className="h-16 text-center">
                <p className="text-slate-600 min-h-[2.5rem] px-4 py-2 bg-white/70 rounded-full transition-opacity duration-300">
                    {statusText}
                </p>
            </div>

            <button
                onClick={handleToggleSession}
                disabled={!ai}
                className={`mt-6 px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 ${!ai ? 'bg-slate-400 cursor-not-allowed' : isSessionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'}`}
                aria-label={isSessionActive ? 'Stop Conversation' : 'Start Conversation'}
            >
                {isSessionActive ? <StopIcon /> : <MicrophoneIcon />}
                {isSessionActive ? 'Stop Conversation' : 'Start Conversation'}
            </button>
             <p className="text-xs text-slate-400 mt-4">
                This is a premium feature. The avatar provides a more immersive conversational experience.
            </p>
             {!ai && (
                <p className="text-xs text-red-500 mt-4 text-center">
                    The Live Avatar service could not be initialized.<br />Please contact the administrator.
                </p>
            )}
        </div>
    );
};