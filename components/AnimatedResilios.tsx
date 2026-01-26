
import React, { useRef, useEffect, useCallback } from 'react';

export type ResiliosEmotion = 'idle' | 'listening' | 'thinking' | 'supportive' | 'worried';

interface AnimatedResiliosProps {
  emotion?: ResiliosEmotion;
  isTalking?: boolean;
  className?: string;
  size?: number;
}

export const AnimatedResilios: React.FC<AnimatedResiliosProps> = ({ 
  emotion = 'idle', 
  isTalking = false, 
  className = "",
  size = 200 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
  // Animation state refs
  const stateRef = useRef({
    blink: { last: 0, active: false },
    breath: 0,
    mouth: 0,
    eyePos: { x: 0, y: 0, tx: 0, ty: 0 },
    tilt: { current: 0, target: 0 },
    limbs: { lArm: 0, rArm: 0 },
    pulse: 0
  });

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const s = size * dpr;
    if (canvas.width !== s || canvas.height !== s) {
      canvas.width = s;
      canvas.height = s;
    }

    const state = stateRef.current;

    // --- 1. Update Procedural Logic ---
    
    // Blinking
    if (!state.blink.active && time - state.blink.last > Math.random() * 4000 + 3000) {
      state.blink.active = true;
      state.blink.last = time;
    }
    if (state.blink.active && time - state.blink.last > 120) {
      state.blink.active = false;
    }

    // Breathing
    state.breath = Math.sin(time / 1400) * 4;
    state.pulse = (Math.sin(time / 400) * 0.5 + 0.5);

    // Emotion Logic
    switch (emotion) {
      case 'listening':
        state.tilt.target = -0.06;
        state.eyePos.tx = 0;
        state.eyePos.ty = 0;
        break;
      case 'thinking':
        state.tilt.target = 0.08;
        if (Math.random() < 0.02) {
          state.eyePos.tx = (Math.random() - 0.5) * 10;
          state.eyePos.ty = -8;
        }
        break;
      case 'supportive':
        state.tilt.target = Math.sin(time / 1000) * 0.03;
        state.eyePos.tx = 0;
        state.eyePos.ty = 0;
        break;
      default: // idle
        state.tilt.target = Math.sin(time / 3000) * 0.02;
        if (Math.random() < 0.01) {
          state.eyePos.tx = (Math.random() - 0.5) * 15;
          state.eyePos.ty = (Math.random() - 0.5) * 10;
        }
    }

    state.tilt.current += (state.tilt.target - state.tilt.current) * 0.05;
    state.eyePos.x += (state.eyePos.tx - state.eyePos.x) * 0.08;
    state.eyePos.y += (state.eyePos.ty - state.eyePos.y) * 0.08;
    state.limbs.lArm = Math.sin(time / 2000) * 6;
    state.limbs.rArm = Math.cos(time / 2200) * 8;
    
    // Mouth sync
    const targetMouth = isTalking ? (Math.sin(time / 100) * 0.5 + 0.5) : 0;
    state.mouth += (targetMouth - state.mouth) * 0.3;

    // --- 2. Rendering ---
    ctx.clearRect(0, 0, s, s);
    ctx.save();
    ctx.scale(dpr * (size / 300), dpr * (size / 300)); // Internal scale based on 300px target

    const cx = 150;
    const cy = 180;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy + 85, 50, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fill();

    // Legs
    ctx.lineWidth = 30;
    ctx.strokeStyle = '#B2EBF2';
    ctx.beginPath(); ctx.moveTo(cx - 30, cy + 30); ctx.lineTo(cx - 40, cy + 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 30, cy + 30); ctx.lineTo(cx + 40, cy + 90); ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(cx - 50, cy - 20);
    ctx.quadraticCurveTo(cx - 80 + state.limbs.lArm, cy, cx - 90 + state.limbs.lArm, cy + 40);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 50, cy - 20);
    ctx.quadraticCurveTo(cx + 80 + state.limbs.rArm, cy, cx + 90 + state.limbs.rArm, cy + 40);
    ctx.stroke();

    // Torso
    ctx.beginPath();
    ctx.moveTo(cx - 55, cy - 40);
    ctx.quadraticCurveTo(cx, cy - 45 + state.breath, cx + 55, cy - 40);
    ctx.lineTo(cx + 50, cy + 40);
    ctx.quadraticCurveTo(cx, cy + 50, cx - 50, cy + 40);
    ctx.closePath();
    ctx.fillStyle = '#B2EBF2';
    ctx.fill();
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Head Group (Tiltable)
    ctx.save();
    ctx.translate(cx, cy - 60);
    ctx.rotate(state.tilt.current);
    ctx.translate(-cx, -(cy - 60));

    // Head Bowl
    ctx.beginPath();
    ctx.moveTo(cx - 95, cy - 110);
    ctx.lineTo(cx + 95, cy - 110);
    ctx.quadraticCurveTo(cx + 95, cy - 10, cx, cy - 10);
    ctx.quadraticCurveTo(cx - 95, cy - 10, cx - 95, cy - 110);
    ctx.closePath();
    const grad = ctx.createLinearGradient(cx - 50, cy - 110, cx + 50, cy);
    grad.addColorStop(0, '#80DEEA');
    grad.addColorStop(1, '#4DD0E1');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.stroke();

    // Brain
    const brainY = cy - 120 + state.breath * 0.4;
    ctx.save();
    if (emotion === 'thinking') {
      ctx.shadowBlur = 15 + state.pulse * 15;
      ctx.shadowColor = '#D81B60';
    } else if (isTalking) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#D81B60';
    }
    ctx.beginPath();
    ctx.arc(cx, brainY, 85, Math.PI, 0);
    ctx.fillStyle = '#F48FB1';
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Eyes
    const eyeY = cy - 65;
    const eyeX = 40;
    const blinkH = state.blink.active ? 2 : 22;
    ctx.fillStyle = 'black';
    ctx.beginPath(); ctx.ellipse(cx - eyeX, eyeY, 16, blinkH, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + eyeX, eyeY, 16, blinkH, 0, 0, Math.PI * 2); ctx.fill();
    if (!state.blink.active) {
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(cx - eyeX + state.eyePos.x, eyeY - 6 + state.eyePos.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + eyeX + state.eyePos.x, eyeY - 6 + state.eyePos.y, 5, 0, Math.PI * 2); ctx.fill();
    }

    // Mouth
    const mY = cy - 25;
    ctx.lineWidth = 4;
    if (state.mouth > 0.1) {
      ctx.beginPath();
      ctx.ellipse(cx, mY, 15, state.mouth * 20, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#37474F';
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      if (emotion === 'supportive') {
        ctx.moveTo(cx - 20, mY - 5);
        ctx.quadraticCurveTo(cx, mY + 12, cx + 20, mY - 5);
      } else if (emotion === 'listening') {
        ctx.ellipse(cx, mY + 2, 6, 4, 0, 0, Math.PI * 2);
      } else {
        ctx.moveTo(cx - 15, mY);
        ctx.quadraticCurveTo(cx, mY + 8, cx + 15, mY);
      }
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();

    animationFrameIdRef.current = requestAnimationFrame(draw);
  }, [emotion, isTalking, size]);

  useEffect(() => {
    animationFrameIdRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [draw]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`mx-auto drop-shadow-xl transition-transform duration-500 ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
