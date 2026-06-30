import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Loader2, AlertCircle } from 'lucide-react';
import { electionService } from '../../services/electionService';
import { useRefresh } from '../../context/RefreshContext';
import type { VotingCode } from '../../types';

interface Props {
  onBack: () => void;
  onCodeValidated: (code: VotingCode) => void;
}

export function CodeEntryPage({ onBack, onCodeValidated }: Props) {
  const { revision } = useRefresh();
  const [parts, setParts] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [electionStatus, setElectionStatus] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const e = await electionService.getElection();
        setElectionStatus(e.status);
      } catch {
      }
    })();
  }, [revision]);

  const getFullCode = () => {
  return parts.join('').toUpperCase();
};
  const handleChange = (idx: number, val: string) => {
    const char = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    const next = [...parts];
    next[idx] = char;
    setParts(next);
    setError('');
   if (char && idx < 3) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !parts[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
  e.preventDefault();

  const text = e.clipboardData
    .getData('text')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 4);

  const next = Array(4).fill('');

  [...text].forEach((c, i) => {
    next[i] = c;
  });

  setParts(next);

  const focusIdx = Math.min(text.length, 3);
  inputRefs.current[focusIdx]?.focus();
};

  const handleSubmit = async () => {
    if (electionStatus && electionStatus !== 'LIVE') {
      const msg =
        electionStatus === 'UPCOMING' ? 'Voting has not started yet.' :
        electionStatus === 'PAUSED' ? 'Voting is temporarily paused. Please wait for it to resume.' :
        'Voting is currently closed.';
      setError(msg);
      return;
    }

    const code = getFullCode();
    if (parts.filter(Boolean).length < 4) {
      setError('Please enter your complete 4-character voting code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await electionService.validateCode(code);
      if (result.valid && result.code) {
        onCodeValidated(result.code);
      } else {
        setError(result.error || "Invalid code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="flex items-center gap-2 text-sm mb-10 transition-colors duration-200 focus:outline-none"
          style={{ color: '#71717A' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#A1A1AA')}
          onMouseLeave={e => (e.currentTarget.style.color = '#71717A')}
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
          Back to Home
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-10"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <Shield style={{ color: '#7C3AED' }} size={26} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Enter Your Voting Code</h1>
            <p className="text-sm" style={{ color: '#71717A' }}>
              Enter the code provided to you by your teacher.
            </p>
          </div>

          {/* Code Input */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-2" onPaste={handlePaste}>
              {parts.map((val, idx) => (
                <React.Fragment key={idx}>
                  <input
                    ref={el => { inputRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={val}
                    onChange={e => handleChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border transition-all duration-200 focus:outline-none"
                    style={{
                      background: val ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                      borderColor: error ? '#EF4444' : val ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                      color: '#FAFAFA',
                      boxShadow: val ? '0 0 12px rgba(124,58,237,0.3)' : 'none',
                    }}
                    aria-label={`Code character ${idx + 1}`}
                    autoComplete="off"
                  />
                </React.Fragment>
              ))}
            </div>
            <p className="text-center text-xs mt-3" style={{ color: '#52525B' }}>Example: A7KF</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl p-3 mb-6 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
            >
              <AlertCircle size={15} />
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none"
            style={{
              background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7C3AED, #A855F7)',
              boxShadow: loading ? 'none' : '0 0 24px rgba(124,58,237,0.35)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            aria-busy={loading}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying code...</> : 'Continue to Ballot'}
          </button>

          {/* Trust lines */}
          <div className="mt-8 space-y-2">
            {['One vote per code.', 'Your ballot is anonymous.', 'This code expires after use.'].map(t => (
              <div key={t} className="flex items-center gap-2 text-xs" style={{ color: '#52525B' }}>
                <div className="w-1 h-1 rounded-full" style={{ background: '#7C3AED' }} />
                {t}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
