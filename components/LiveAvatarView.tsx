import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from "@google/genai";
import { LIVE_SYSTEM_PROMPT, IMAGES, displaySticker, STICKERS } from '../constants';
import { createBlob, decode, decodeAudioData } from '../utils/audio';
import { MicrophoneIcon, StopIcon } from './Icons';

type AvatarState = 'idle' | 'speaking';

export const LiveAvatarView: React.FC = () => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [avatarState, setAvatarState] = useState<AvatarState>('idle');
    const [transcript, setTranscript] = useState('');
    const [sticker, setSticker] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const speakingTimeoutRef = useRef<number | null>(null);
    const stickerTimeoutRef = useRef<number | null>(null);
    const ai = useRef<GoogleGenAI | null>(null);

    // Refs for the audio visualizer
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    
    useEffect(() => {
        if (process.env.API_KEY) {
            ai.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
        return () => {
            // Cleanup on unmount
            sessionPromiseRef.current?.then(session => session.close());
            if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
            if (stickerTimeoutRef.current) clearTimeout(stickerTimeoutRef.current);
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        };
    }, []);

    // Set canvas dimensions on mount, accounting for device pixel ratio for sharpness
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
        }
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
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameIdRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            canvasCtx.save();
            canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);


            const { width, height } = canvas.getBoundingClientRect();
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(centerX, centerY) * 0.85; 
            const barWidth = 3;
            const numBars = bufferLength * 0.7; 
            const angleStep = (2 * Math.PI) / numBars;
            
            for (let i = 0; i < numBars; i++) {
                const barHeight = Math.pow(dataArray[i] / 255, 2.5) * 80; 
                if (barHeight < 2) continue;

                const angle = i * angleStep - Math.PI / 2;
                
                const x1 = centerX + Math.cos(angle) * radius;
                const y1 = centerY + Math.sin(angle) * radius;
                const x2 = centerX + Math.cos(angle) * (radius + barHeight);
                const y2 = centerY + Math.sin(angle) * (radius + barHeight);

                canvasCtx.beginPath();
                canvasCtx.moveTo(x1, y1);
                canvasCtx.lineTo(x2, y2);
                canvasCtx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0.2, dataArray[i] / 255)})`;
                canvasCtx.lineWidth = barWidth;
                canvasCtx.lineCap = 'round';
                canvasCtx.stroke();
            }
            canvasCtx.restore();
        };
        draw();
    }, []);

    const handleToggleSession = useCallback(async () => {
        if (!ai.current) {
            alert("AI service is not available.");
            return;
        }

        if (isSessionActive) {
            setIsSessionActive(false);
            setAvatarState('idle');
            setTranscript('');
            sessionPromiseRef.current?.then(session => session.close());
            mediaStreamRef.current?.getTracks().forEach(track => track.stop());
            scriptProcessorRef.current?.disconnect();
            audioContextRef.current?.close();
            sessionPromiseRef.current = null;
            if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
            if (stickerTimeoutRef.current) clearTimeout(stickerTimeoutRef.current);
            stopVisualizer();
            return;
        }

        setIsSessionActive(true);
        setTranscript('Connecting...');

        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const analyser = outputAudioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;
        analyser.connect(outputAudioContext.destination);
        analyserRef.current = analyser;

        drawVisualizer();
        
        let nextStartTime = 0;

        sessionPromiseRef.current = ai.current.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    setTranscript('Listening... say something!');
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
                    if (message.serverContent?.outputTranscription?.text) {
                        setTranscript(prev => prev + message.serverContent.outputTranscription.text);
                    }
                     if (message.serverContent?.turnComplete) {
                        setTranscript('');
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
                        setAvatarState('speaking');
                        if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
                        
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        
                        // Set timeout to return to idle slightly after audio finishes
                        const audioDurationMs = audioBuffer.duration * 1000;
                        speakingTimeoutRef.current = window.setTimeout(() => setAvatarState('idle'), audioDurationMs);

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
                    setTranscript('Connection error. Please try again.');
                    setIsSessionActive(false);
                    setAvatarState('idle');
                    stopVisualizer();
                },
                onclose: () => {
                    setIsSessionActive(false);
                    setAvatarState('idle');
                    setTranscript('');
                    stopVisualizer();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                outputAudioTranscription: {},
                systemInstruction: LIVE_SYSTEM_PROMPT,
                tools: [{functionDeclarations: [displaySticker]}]
            },
        });

    }, [isSessionActive, drawVisualizer, stopVisualizer]);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-sky-100 p-4">
            <style>{`
                @keyframes subtle-breathing {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.02);
                    }
                }
            `}</style>
            <div className={`relative w-full max-w-sm aspect-square mb-6 transition-transform duration-500 ease-in-out ${avatarState === 'speaking' ? 'scale-105' : 'scale-100'}`}>
                 <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                 <video
                    key="idle-video"
                    className={`w-full h-full object-cover rounded-full shadow-2xl absolute top-0 left-0 transition-opacity duration-700 ease-in-out ${avatarState === 'idle' ? 'opacity-100 [animation:subtle-breathing_5s_ease-in-out_infinite]' : 'opacity-0 pointer-events-none'}`}
                    src={IMAGES.avatarIdle}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <video
                    key="speaking-video"
                    className={`w-full h-full object-cover rounded-full shadow-2xl absolute top-0 left-0 transition-opacity duration-700 ease-in-out ${avatarState === 'speaking' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    src={IMAGES.avatarSpeaking}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                {sticker && STICKERS[sticker] && (
                    <div className="absolute inset-0 flex items-center justify-center transition-all duration-300">
                        <img 
                            src={STICKERS[sticker]} 
                            alt={sticker} 
                            className="w-48 h-48 object-contain drop-shadow-xl"
                        />
                    </div>
                )}
            </div>
            
            <div className="h-16 text-center">
                <p className="text-slate-600 min-h-[2.5rem] px-4 py-2 bg-white/70 rounded-full transition-opacity duration-300">
                    {transcript}
                </p>
            </div>

            <button
                onClick={handleToggleSession}
                className={`mt-6 px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-3 ${isSessionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'}`}
                aria-label={isSessionActive ? 'Stop Conversation' : 'Start Conversation'}
            >
                {isSessionActive ? <StopIcon /> : <MicrophoneIcon />}
                {isSessionActive ? 'Stop Conversation' : 'Start Conversation'}
            </button>
             <p className="text-xs text-slate-400 mt-4">
                This is a premium feature. The avatar provides a more immersive conversational experience.
            </p>
        </div>
    );
};