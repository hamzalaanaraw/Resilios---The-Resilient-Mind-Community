
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
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
    const [statusText, setStatusText] = useState('Tap to start your interactive voice session.');
    const [sticker, setSticker] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const conversationRef = useRef<LiveTranscriptPart[]>([]);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const micAnalyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    
    const blinkRef = useRef({ lastBlink: 0, isBlinking: false });
    const breathRef = useRef(0);
    const mouthRef = useRef(0);
    const eyePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
    const headTiltRef = useRef({ current: 0, target: 0 });
    const thinkingPulseRef = useRef(0);
    const lastVoiceTimeRef = useRef(Date.now());

    useEffect(() => {
        drawCharacter();
        return () => {
            sessionPromiseRef.current?.then(session => session.close());
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    const drawCharacter = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        
        const animate = (time: number) => {
            animationFrameIdRef.current = requestAnimationFrame(animate);
            const { width, height } = canvas.getBoundingClientRect();
            if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                canvas.width = width * dpr; canvas.height = height * dpr;
            }

            let audioVolume = 0;
            if (analyserRef.current) {
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);
                const sum = dataArray.slice(0, 15).reduce((a, b) => a + b, 0);
                audioVolume = sum / 15 / 255;
            }

            let userVolume = 0;
            if (micAnalyserRef.current) {
                const micData = new Uint8Array(micAnalyserRef.current.frequencyBinCount);
                micAnalyserRef.current.getByteFrequencyData(micData);
                const micSum = micData.slice(0, 15).reduce((a, b) => a + b, 0);
                userVolume = micSum / 15 / 255;
                if (userVolume > 0.05) lastVoiceTimeRef.current = time;
            }

            mouthRef.current = mouthRef.current * 0.5 + audioVolume * 0.8;
            if (!blinkRef.current.isBlinking && time - blinkRef.current.lastBlink > Math.random() * 5000 + 3000) {
                blinkRef.current.isBlinking = true; blinkRef.current.lastBlink = time;
            }
            if (blinkRef.current.isBlinking && time - blinkRef.current.lastBlink > 140) blinkRef.current.isBlinking = false;
            thinkingPulseRef.current = isThinking ? (Math.sin(time / 200) * 0.5 + 0.5) : 0;
            breathRef.current = Math.sin(time / 1400) * 5;
            headTiltRef.current.target = isThinking ? 0.12 : (userVolume > 0.05 ? -0.08 : Math.sin(time / 3000) * 0.03);
            headTiltRef.current.current += (headTiltRef.current.target - headTiltRef.current.current) * 0.08;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr, dpr);
            const cx = width / 2; const cy = height / 2 + 50;
            ctx.lineJoin = 'round'; ctx.lineCap = 'round';

            // Floor Shadow
            ctx.beginPath(); ctx.ellipse(cx, cy + 140, 60, 15, 0, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fill();
            // Legs
            ctx.lineWidth = 35; ctx.strokeStyle = '#B2EBF2';
            ctx.beginPath(); ctx.moveTo(cx - 30, cy + 80); ctx.lineTo(cx - 45, cy + 160); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx + 30, cy + 80); ctx.lineTo(cx + 45, cy + 160); ctx.stroke();
            // Arms
            ctx.beginPath(); ctx.moveTo(cx - 55, cy + 40); ctx.quadraticCurveTo(cx - 90, cy + 60, cx - 100, cy + 110); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx + 55, cy + 40); ctx.quadraticCurveTo(cx + 90, cy + 60, cx + 100, cy + 110); ctx.stroke();
            // Body
            ctx.beginPath(); ctx.moveTo(cx - 60, cy + 20); ctx.quadraticCurveTo(cx, cy + 15 + breathRef.current, cx + 60, cy + 20); ctx.lineTo(cx + 60, cy + 120); ctx.quadraticCurveTo(cx, cy + 140, cx - 60, cy + 120); ctx.closePath(); ctx.fillStyle = '#B2EBF2'; ctx.fill(); ctx.strokeStyle = '#263238'; ctx.lineWidth = 4; ctx.stroke();

            ctx.save(); ctx.translate(cx, cy - 25); ctx.rotate(headTiltRef.current.current); ctx.translate(-cx, -(cy - 25));
            ctx.beginPath(); ctx.moveTo(cx - 105, cy - 80); ctx.lineTo(cx + 105, cy - 80); ctx.quadraticCurveTo(cx + 105, cy + 30, cx, cy + 30); ctx.quadraticCurveTo(cx - 105, cy + 30, cx - 105, cy - 80); ctx.closePath();
            ctx.fillStyle = '#80DEEA'; ctx.fill(); ctx.stroke();

            ctx.save();
            if (isThinking) { ctx.shadowBlur = 25 + thinkingPulseRef.current * 20; ctx.shadowColor = '#D81B60'; }
            ctx.beginPath(); ctx.arc(cx, cy - 95 + breathRef.current * 0.5, 95, Math.PI, 0); ctx.fillStyle = '#F48FB1'; ctx.fill(); ctx.stroke(); ctx.restore();

            const blinkH = blinkRef.current.isBlinking ? 2 : 25;
            ctx.fillStyle = 'black';
            ctx.beginPath(); ctx.ellipse(cx - 45, cy - 35, 18, blinkH, 0, 0, 2 * Math.PI); ctx.fill();
            ctx.beginPath(); ctx.ellipse(cx + 45, cy - 35, 18, blinkH, 0, 0, 2 * Math.PI); ctx.fill();

            if (mouthRef.current > 0.05) {
                ctx.beginPath(); ctx.ellipse(cx, cy + 5, 20 + mouthRef.current * 22, mouthRef.current * 38, 0, 0, 2 * Math.PI); ctx.fillStyle = '#37474F'; ctx.fill(); ctx.stroke();
            } else {
                ctx.beginPath(); ctx.moveTo(cx - 20, cy + 5); ctx.quadraticCurveTo(cx, cy + 15, cx + 20, cy + 5); ctx.strokeStyle = 'black'; ctx.lineWidth = 4; ctx.stroke();
            }
            ctx.restore(); ctx.restore();
        };
        animationFrameIdRef.current = requestAnimationFrame(animate);
    }, [isSessionActive, isThinking]);

    const handleStartSession = useCallback(async () => {
        if (!ai) return;
        setStatusText('Waking up Resilios...');
        setIsSessionActive(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = inputCtx;
            
            // Resume context if suspended (Browser policy)
            if (inputCtx.state === 'suspended') await inputCtx.resume();
            if (outputCtx.state === 'suspended') await outputCtx.resume();

            const micAnalyser = inputCtx.createAnalyser();
            micAnalyser.fftSize = 256;
            micAnalyserRef.current = micAnalyser;
            analyserRef.current = micAnalyser;

            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        setStatusText('I’m listening. What’s on your mind?');
                        const source = inputCtx.createMediaStreamSource(stream);
                        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;
                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputCtx.destination);
                        source.connect(micAnalyser);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                            setIsThinking(false);
                            const buffer = await decodeAudioData(decode(msg.serverContent.modelTurn.parts[0].inlineData.data), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = buffer;
                            const outAnalyser = outputCtx.createAnalyser();
                            outAnalyser.fftSize = 256;
                            source.connect(outAnalyser);
                            outAnalyser.connect(outputCtx.destination);
                            analyserRef.current = outAnalyser;
                            source.onended = () => {
                                sources.delete(source);
                                if (sources.size === 0) analyserRef.current = micAnalyser;
                            };
                            nextStartTime = Math.max(nextStartTime, outputCtx.currentTime);
                            source.start(nextStartTime);
                            nextStartTime += buffer.duration;
                            sources.add(source);
                        }
                        if (msg.serverContent?.interrupted) {
                            sources.forEach(s => s.stop()); sources.clear();
                            nextStartTime = 0; analyserRef.current = micAnalyser; setIsThinking(false);
                        }
                    },
                    onerror: () => handleStopSession(),
                    onclose: () => setIsSessionActive(false),
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
                    systemInstruction: LIVE_SYSTEM_PROMPT,
                    tools: [{ functionDeclarations: [displaySticker] }]
                }
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (err) {
            setStatusText('Microphone access is needed.');
            setIsSessionActive(false);
        }
    }, [ai]);

    const handleStopSession = useCallback(() => {
        sessionPromiseRef.current?.then(s => s.close());
        mediaStreamRef.current?.getTracks().forEach(t => t.stop());
        scriptProcessorRef.current?.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        setIsSessionActive(false); setIsThinking(false); setStatusText('Session Ended.'); setSticker(null); analyserRef.current = null;
    }, []);

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                    <canvas ref={canvasRef} className="w-full h-full drop-shadow-2xl" />
                    {sticker && STICKERS[sticker] && (
                        <div className="absolute top-0 right-0 w-24 h-24 animate-pop z-20">
                            <img src={STICKERS[sticker]} alt={sticker} className="relative w-full h-full drop-shadow-xl" />
                        </div>
                    )}
                </div>
                <div className="mt-10 text-center max-w-xs space-y-8 z-10">
                    <div className="space-y-2">
                        <p className={`text-[10px] font-black tracking-[0.2em] uppercase ${isSessionActive ? 'text-sky-500' : 'text-slate-400'}`}>
                            {isThinking ? 'Processing' : isSessionActive ? 'Active' : 'Offline'}
                        </p>
                        <p className="text-slate-800 text-sm font-bold leading-relaxed px-4">{statusText}</p>
                    </div>
                    {!isSessionActive ? (
                        <button onClick={handleStartSession} className="flex items-center gap-4 px-12 py-5 bg-sky-500 text-white rounded-3xl font-black shadow-2xl shadow-sky-200 hover:bg-sky-600 active:scale-95 transition-all">
                            <MicrophoneIcon /> Connect Live
                        </button>
                    ) : (
                        <button onClick={handleStopSession} className="flex items-center gap-4 px-12 py-5 bg-slate-900 text-white rounded-3xl font-black shadow-xl active:scale-95 transition-all">
                            <StopIcon /> End Session
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
