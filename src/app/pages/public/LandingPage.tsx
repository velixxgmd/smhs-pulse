import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronRight, Lock, Eye, EyeOff, Settings } from 'lucide-react';

interface Props {
  onStartVoting: () => void;
  onAdminAccess: () => void;
}

export function LandingPage({ onStartVoting, onAdminAccess }: Props) {
  const [gearClicks, setGearClicks] = useState(0);

  const handleGearClick = () => {
    const next = gearClicks + 1;
    setGearClicks(next);
    if (next >= 1) { onAdminAccess(); setGearClicks(0); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-8 py-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
            <div className="w-3 h-3 rounded-full bg-white opacity-90" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide">PULSE</span>
          <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
            style={{ borderColor: 'rgba(124,58,237,0.4)', color: '#A855F7', background: 'rgba(124,58,237,0.1)' }}>
            by SMHS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: '#71717A' }}>St. Martins High School</span>
          <button
            onClick={handleGearClick}
            className="p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
            style={{ color: '#3f3f46', '--tw-ring-color': '#7C3AED' } as React.CSSProperties}
            aria-label="Admin access"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-10"
            style={{
              borderColor: 'rgba(124,58,237,0.3)',
              background: 'rgba(124,58,237,0.08)',
              color: '#A855F7',
            }}
          >
            <Shield size={13} />
            <span className="text-xs font-semibold tracking-widest uppercase">Official Student Election Platform</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(48px, 7vw, 80px)', color: '#FAFAFA', letterSpacing: '-0.02em' }}
          >
            Your Voice.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #7C3AED, #A855F7, #22D3EE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Your Vote.
            </span>
            <br />Your Future.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg mb-3"
            style={{ color: '#A1A1AA', maxWidth: 520, margin: '0 auto 12px' }}
          >
            Secure, anonymous student elections for St. Martins High School.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-center gap-6 text-sm mb-14"
            style={{ color: '#71717A' }}
          >
            <span>Secure</span>
            <span style={{ color: '#3f3f46' }}>•</span>
            <span>Anonymous</span>
            <span style={{ color: '#3f3f46' }}>•</span>
            <span>One Vote Per Student</span>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onStartVoting}
              className="group flex items-center gap-3 px-10 py-4 rounded-xl font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                boxShadow: '0 0 32px rgba(124,58,237,0.4)',
                fontSize: 17,
                '--tw-ring-color': '#7C3AED',
                '--tw-ring-offset-color': '#09090B',
              } as React.CSSProperties}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 48px rgba(124,58,237,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 32px rgba(124,58,237,0.4)')}
            >
              Start Voting
              <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-2 text-xs"
            style={{ color: '#52525B' }}
          >
            <Lock size={11} />
            <span>Your ballot is completely anonymous. Codes are single-use and expire permanently after voting.</span>
          </motion.div>

          {/* Glass hero card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-20 glass rounded-3xl p-8 max-w-2xl mx-auto"
          >
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'One Code', sub: 'Per student', color: '#7C3AED' },
                { label: 'Anonymous', sub: 'Ballot system', color: '#22D3EE' },
                { label: 'Official', sub: 'SMHS certified', color: '#FBBF24' },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: item.color }}>{item.label}</div>
                  <div className="text-xs" style={{ color: '#71717A' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs" style={{ color: '#3f3f46' }}>
        © {new Date().getFullYear()} Pulse by SMHS — St. Martins High School Election Platform
      </footer>
    </div>
  );
}
