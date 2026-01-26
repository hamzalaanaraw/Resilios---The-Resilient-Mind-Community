
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
    
    // Character state refs for smooth procedural animation
    const blinkRef = useRef({ lastBlink: 0, isBlinking: false });
    const breathRef = useRef(0);
    const mouthRef = useRef(0);
    const eyePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
    const limbRef = useRef({ lArm: 0, rArm: 0, lLeg: 0, rLeg: 0 });
    const headTiltRef = useRef({ current: 0, target: 0 });
    const thinkingPulseRef = useRef(0);
    const lastVoiceTimeRef = useRef(Date.now());

    useEffect(() => {
        drawCharacter();
        return () => {
            sessionPromiseRef.current?.then(session => session.close());
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
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

            // Responsive Canvas Sizing
            const { width, height } = canvas.getBoundingClientRect();
            if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                canvas.width = width * dpr;
                canvas.height = height * dpr;
            }

            // --- 1. Audio Analysis ---
            let audioVolume = 0;
            if (analyserRef.current) {
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);
                const sum = dataArray.slice(0, 15).reduce((a, b) => a + b, 0);
                audioVolume = sum / 15 / 255;
            }

            // User Voice detection
            let userVolume = 0;
            if (micAnalyserRef.current) {
                const micData = new Uint8Array(micAnalyserRef.current.frequencyBinCount);
                micAnalyserRef.current.getByteFrequencyData(micData);
                const micSum = micData.slice(0, 15).reduce((a, b) => a + b, 0);
                userVolume = micSum / 15 / 255;
                if (userVolume > 0.05) {
                    lastVoiceTimeRef.current = time;
                }
            }

            // --- 2. Smoothing & Procedural Logic ---
            mouthRef.current = mouthRef.current * 0.5 + audioVolume * 0.8;
            if (mouthRef.current < 0.01) mouthRef.current = 0;

            if (!blinkRef.current.isBlinking && time - blinkRef.current.lastBlink > Math.random() * 5000 + 3000) {
                blinkRef.current.isBlinking = true;
                blinkRef.current.lastBlink = time;
            }
            if (blinkRef.current.isBlinking && time - blinkRef.current.lastBlink > 140) {
                blinkRef.current.isBlinking = false;
            }

            thinkingPulseRef.current = isThinking ? (Math.sin(time / 200) * 0.5 + 0.5) : 0;
            breathRef.current = Math.sin(time / 1400) * 5;
            
            if (isThinking) {
                headTiltRef.current.target = 0.12; 
            } else if (userVolume > 0.05) {
                headTiltRef.current.target = -0.08; 
            } else {
                headTiltRef.current.target = Math.sin(time / 3000) * 0.03; 
            }
            headTiltRef.current.current += (headTiltRef.current.target - headTiltRef.current.current) * 0.08;

            const timeSinceVoice = time - lastVoiceTimeRef.current;
            if (timeSinceVoice > 5000) {
                 if (Math.random() < 0.008) {
                    eyePosRef.current.targetX = (Math.random() - 0.5) * 18;
                    eyePosRef.current.targetY = (Math.random() - 0.5) * 12;
                }
            } else {
                eyePosRef.current.targetX = 0;
                eyePosRef.current.targetY = -3;
            }
            eyePosRef.current.x += (eyePosRef.current.targetX - eyePosRef.current.x) * 0.1;
            eyePosRef.current.y += (eyePosRef.current.targetY - eyePosRef.current.y) * 0.1;

            limbRef.current.lArm = Math.sin(time / 2000) * 10;
            limbRef.current.rArm = Math.cos(time / 2200) * 12;

            // --- 3. Rendering ---
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr, dpr);

            const cx = width / 2;
            const cy = height / 2 + 50;

            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            // Floor Shadow
            ctx.beginPath();
            ctx.ellipse(cx, cy + 140, 60, 15, 0, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fill();

            // Legs
            ctx.lineWidth = 35;
            ctx.strokeStyle = '#B2EBF2';
            ctx.beginPath(); ctx.moveTo(cx - 30, cy + 80); ctx.lineTo(cx - 45, cy + 160); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx + 30, cy + 80); ctx.lineTo(cx + 45, cy + 160); ctx.stroke();

            // Arms
            ctx.beginPath();
            ctx.moveTo(cx - 55, cy + 40);
            ctx.quadraticCurveTo(cx - 90 + limbRef.current.lArm, cy + 60, cx - 100 + limbRef.current.lArm, cy + 110);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 55, cy + 40);
            ctx.quadraticCurveTo(cx + 90 + limbRef.current.rArm, cy + 60, cx + 100 + limbRef.current.rArm, cy + 110);
            ctx.stroke();

            // Body
            ctx.beginPath();
            ctx.moveTo(cx - 60, cy + 20);
            ctx.quadraticCurveTo(cx, cy + 15 + breathRef.current, cx + 60, cy + 20);
            ctx.lineTo(cx + 60, cy + 120);
            ctx.quadraticCurveTo(cx, cy + 140, cx - 60, cy + 120);
            ctx.closePath();
            ctx.fillStyle = '#B2EBF2';
            ctx.fill();
            ctx.strokeStyle = '#263238';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Head (Tiltable Group)
            ctx.save();
            ctx.translate(cx, cy - 25);
            ctx.rotate(headTiltRef.current.current);
            ctx.translate(-cx, -(cy - 25));

            // Head Bowl
            ctx.beginPath();
            ctx.moveTo(cx - 105, cy - 80);
            ctx.lineTo(cx + 105, cy - 80);
            ctx.quadraticCurveTo(cx + 105, cy + 30, cx, cy + 30);
            ctx.quadraticCurveTo(cx - 105, cy + 30, cx - 105, cy - 80);
            ctx.closePath();
            const bowlGrad = ctx.createLinearGradient(cx - 100, cy - 80, cx + 100, cy + 30);
            bowlGrad.addColorStop(0, '#80DEEA');
            bowlGrad.addColorStop(1, '#4DD0E1');
            ctx.fillStyle = bowlGrad;
            ctx.fill();
            ctx.stroke();

            // Brain
            const brainY = cy - 95 + breathRef.current * 0.5;
            ctx.save();
            if (isThinking) {
                ctx.shadowBlur = 25 + thinkingPulseRef.current * 20;
                ctx.shadowColor = '#D81B60';
            } else if (mouthRef.current > 0.05) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#D81B60';
            }
            ctx.beginPath();
            ctx.arc(cx, brainY, 95, Math.PI, 0);
            ctx.fillStyle = '#F48FB1';
            ctx.fill();
            ctx.strokeStyle = '#263238';
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();

            // Eyes
            const eyeY = cy - 35;
            const eyeXOff = 45;
            const blinkH = blinkRef.current.isBlinking ? 2 : 25;
            ctx.fillStyle = 'black';
            ctx.beginPath(); ctx.ellipse(cx - eyeXOff, eyeY, 18, blinkH, 0, 0, 2 * Math.PI); ctx.fill();
            ctx.beginPath(); ctx.ellipse(cx + eyeXOff, eyeY, 18, blinkH, 0, 0, 2 * Math.PI); ctx.fill();
            if (!blinkRef.current.isBlinking) {
                ctx.fillStyle = 'white';
                ctx.beginPath(); ctx.arc(cx - eyeXOff + eyePosRef.current.x, eyeY - 8 + eyePosRef.current.y, 6, 0, 2 * Math.PI); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + eyeXOff + eyePosRef.current.x, eyeY - 8 + eyePosRef.current.y, 6, 0, 2 * Math.PI); ctx.fill();
            }

            // Mouth
            const mouthY = cy + 5;
            if (mouthRef.current > 0.05) {
                const mWidth = 20 + mouthRef.current * 22;
                const mHeight = mouthRef.current * 38;
                ctx.beginPath();
                ctx.ellipse(cx, mouthY, mWidth, mHeight, 0, 0, 2 * Math.PI);
                ctx.fillStyle = '#37474F';
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.beginPath();
                if (isThinking) {
                    ctx.moveTo(cx - 15, mouthY + 5);
                    ctx.lineTo(cx + 15, mouthY + 5);
                } else {
                    ctx.moveTo(cx - 20, mouthY);
                    ctx.quadraticCurveTo(cx, mouthY + 12, cx + 20, mouthY);
                }
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            ctx.restore();
            ctx.restore();
        };

        animationFrameIdRef.current = requestAnimationFrame(animate);
    }, [isSessionActive, isThinking]);

    const handleStartSession = useCallback(async () => {
        if (!ai) return;

        setStatusText('Waking up Resilios...');
        setIsSessionActive(true);
        conversationRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = inputCtx;

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
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then(session => {
                                let vol = 0;
                                for(let i=0; i<inputData.length; i++) vol += Math.abs(inputData[i]);
                                if (vol > 15) setIsThinking(true); 
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputCtx.destination);
                        source.connect(micAnalyser);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                            setIsThinking(false);
                            const base64 = msg.serverContent.modelTurn.parts[0].inlineData.data;
                            nextStartTime = Math.max(nextStartTime, outputCtx.currentTime);
                            const buffer = await decodeAudioData(decode(base64), outputCtx, 24000, 1);
                            
                            const source = outputCtx.createBufferSource();
                            source.buffer = buffer;
                            
                            const outAnalyser = outputCtx.createAnalyser();
                            outAnalyser.fftSize = 256;
                            source.connect(outAnalyser);
                            outAnalyser.connect(outputCtx.destination);
                            
                            analyserRef.current = outAnalyser;

                            source.onended = () => {
                                sources.delete(source);
                                if (sources.size === 0) {
                                    analyserRef.current = micAnalyser;
                                }
                            };
                            
                            source.start(nextStartTime);
                            nextStartTime += buffer.duration;
                            sources.add(source);
                        }

                        if (msg.serverContent?.interrupted) {
                            sources.forEach(s => s.stop());
                            sources.clear();
                            nextStartTime = 0;
                            analyserRef.current = micAnalyser;
                            setIsThinking(false);
                        }

                        if (msg.toolCall) {
                            msg.toolCall.functionCalls.forEach(fc => {
                                if (fc.name === 'displaySticker') {
                                    setSticker((fc.args as any).stickerName);
                                    sessionPromise.then(s => s.sendToolResponse({
                                        functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }
                                    }));
                                }
                            });
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
            console.error(err);
            setStatusText('Microphone access is needed.');
            setIsSessionActive(false);
        }
    }, [ai]);

    const handleStopSession = useCallback(() => {
        sessionPromiseRef.current?.then(s => s.close());
        mediaStreamRef.current?.getTracks().forEach(t => t.stop());
        scriptProcessorRef.current?.disconnect();
        setIsSessionActive(false);
        setIsThinking(false);
        setStatusText('Session Ended.');
        setSticker(null);
        analyserRef.current = null;
    }, []);

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                
                {/* Character Container */}
                <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                    <canvas 
                        ref={canvasRef} 
                        className="w-full h-full drop-shadow-2xl"
                    />
                    
                    {sticker && STICKERS[sticker] && (
                        <div className="absolute top-0 right-0 w-24 h-24 animate-pop z-20">
                            <div className="absolute -inset-4 bg-white/30 blur-xl rounded-full" />
                            <img src={STICKERS[sticker]} alt={sticker} className="relative w-full h-full drop-shadow-xl" />
                        </div>
                    )}
                </div>

                {/* Feedback Area */}
                <div className="mt-10 text-center max-w-xs space-y-8 z-10">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                             <p className={`text-[10px] font-black tracking-[0.2em] uppercase transition-all ${isSessionActive ? 'text-sky-500' : 'text-slate-400'}`}>
                                {isThinking ? 'Processing' : isSessionActive ? 'Active' : 'Offline'}
                            </p>
                            {isSessionActive && <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>}
                        </div>
                        <p className="text-slate-800 text-sm font-bold leading-relaxed px-4">
                            {statusText}
                        </p>
                    </div>
                    
                    {!isSessionActive ? (
                        <button 
                            onClick={handleStartSession}
                            className="group flex items-center gap-4 px-12 py-5 bg-sky-500 text-white rounded-3xl font-black shadow-2xl shadow-sky-200 hover:bg-sky-600 hover:-translate-y-1 active:scale-95 transition-all"
                        >
                            <div className="p-3 bg-white/20 rounded-2xl group-hover:rotate-12 transition-transform">
                                <MicrophoneIcon />
                            </div>
                            Connect Live
                        </button>
                    ) : (
                        <button 
                            onClick={handleStopSession}
                            className="flex items-center gap-4 px-12 py-5 bg-slate-900 text-white rounded-3xl font-black shadow-xl active:scale-95 transition-all"
                        >
                            <StopIcon />
                            End Conversation
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="h-32 bg-gradient-to-t from-white to-transparent absolute bottom-0 w-full pointer-events-none" />
        </div>
    );
};
