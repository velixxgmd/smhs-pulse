import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Shield, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  onDone: () => void;
}

export function SuccessPage({ onDone }: Props) {
  const hasRun = useRef(false);
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const colors = ['#7C3AED', '#A855F7', '#22D3EE', '#FBBF24', '#22C55E'];
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      gravity: 0.8,
      scalar: 0.9,
    });
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [onDone]);

  const handleReturnNow = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onDone();
  };

  const refNum = Math.random().toString(36).substring(2, 10).toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
            border: '2px solid rgba(34,197,94,0.4)',
            boxShadow: '0 0 48px rgba(34,197,94,0.3)',
          }}
        >
          <CheckCircle2 size={48} style={{ color: '#22C55E' }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Vote Submitted Successfully
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 mb-8 space-y-4"
        >
          <p className="text-sm" style={{ color: '#A1A1AA' }}>
            Your ballot has been securely recorded. Your voting code has now expired permanently.
          </p>
          <div className="border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs mb-1" style={{ color: '#52525B' }}>Reference Number</p>
            <p className="font-mono font-bold text-lg" style={{ color: '#7C3AED' }}>{refNum}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          {[
            'Vote submitted successfully.',
            'Your voting code has now expired.',
            'Thank you for participating.',
          ].map(t => (
            <div key={t} className="flex items-center justify-center gap-2 text-sm" style={{ color: '#71717A' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
              {t}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-4 rounded-xl"
          style={{
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.3)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: '#A1A1AA' }}>
            Returning to the home page in <span className="font-bold" style={{ color: '#7C3AED' }}>{countdown}</span> seconds...
          </p>
        </motion.div>

        <div className="mt-10 space-y-6">
  <button
    onClick={handleReturnNow}
    className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
    style={{
      background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
      boxShadow: '0 0 24px rgba(124,58,237,0.35)',
    }}
  >
    <Home size={18} />
    Return to Home Now
  </button>

  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.7 }}
    className="flex items-center justify-center gap-2 text-xs"
    style={{ color: '#3f3f46' }}
  >
    <Shield size={11} />
    <span>Pulse by SMHS — Official Student Election Platform</span>
     </motion.div>
    </div>
   </motion.div>
  </div>
  );
}