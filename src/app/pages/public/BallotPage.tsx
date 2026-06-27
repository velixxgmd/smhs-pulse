import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2, User, Loader2 } from 'lucide-react';
import { electionService } from '../../services/electionService';
import type { Candidate, VotingCode } from '../../types';

interface Props {
  votingCode: VotingCode;
  onBack: () => void;
  onReview: (selections: Record<string, string>) => void;
}

export function BallotPage({ votingCode, onBack, onReview }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [roleIdx, setRoleIdx] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await electionService.getCandidates();
        setCandidates(all);
        const uniqueRoles = [...new Set(all.map(c => c.role))];
        setRoles(uniqueRoles);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentRole = roles[roleIdx];
  const currentCandidates = candidates.filter(c => c.role === currentRole).sort((a, b) => a.order_index - b.order_index);
  const isLastRole = roleIdx === roles.length - 1;
  const selectedForRole = selections[currentRole];
  const allSelected = roles.every(r => selections[r]);

  const handleSelect = (candidateId: string) => {
    setSelections(prev => ({ ...prev, [currentRole]: candidateId }));
  };

  const handleNext = () => {
    if (!selectedForRole) return;
    if (isLastRole) {
      onReview(selections);
    } else {
      setRoleIdx(i => i + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin" style={{ color: '#7C3AED' }} />
          <p style={{ color: '#71717A' }}>Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col py-10 px-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={roleIdx === 0 ? onBack : () => setRoleIdx(i => i - 1)}
            className="flex items-center gap-2 text-sm transition-colors duration-200"
            style={{ color: '#71717A' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#A1A1AA')}
            onMouseLeave={e => (e.currentTarget.style.color = '#71717A')}
          >
            <ArrowLeft size={16} />
            {roleIdx === 0 ? 'Back' : 'Previous'}
          </button>
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#7C3AED' }}>
              Position {roleIdx + 1} of {roles.length}
            </div>
            <div className="flex items-center gap-1.5">
              {roles.map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-300"
                  style={{
                    width: i === roleIdx ? 24 : 8,
                    height: 8,
                    background: i < roleIdx ? '#22C55E' : i === roleIdx ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                  }} />
              ))}
            </div>
          </div>
          <div className="text-xs" style={{ color: '#52525B' }}>
            {Object.keys(selections).length}/{roles.length} selected
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentRole}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-2 text-center">{currentRole}</h2>
            <p className="text-center text-sm mb-10" style={{ color: '#71717A' }}>
              Select one candidate for this position
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {currentCandidates.map(candidate => {
                const isSelected = selectedForRole === candidate.id;
                return (
                  <motion.button
                    key={candidate.id}
                    onClick={() => handleSelect(candidate.id)}
                    className="relative text-left rounded-2xl p-6 transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(24,24,27,0.7)',
                      border: isSelected ? '1.5px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: isSelected ? '0 0 24px rgba(124,58,237,0.3)' : 'none',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                      '--tw-ring-color': '#7C3AED',
                    } as React.CSSProperties}
                    whileHover={{ y: -3 }}
                    aria-pressed={isSelected}
                    role="radio"
                    aria-checked={isSelected}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle2 size={20} style={{ color: '#7C3AED' }} />
                      </div>
                    )}
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.1))' }}>
                      {candidate.photo_url ? (
                        <img src={candidate.photo_url} alt={candidate.name}
                          className="w-full h-full object-cover" />
                      ) : (
                        <User size={28} style={{ color: '#7C3AED' }} />
                      )}
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">{candidate.name}</h3>
                    <p className="text-xs mb-3" style={{ color: '#71717A' }}>
                      Class {candidate.class}{candidate.section}
                    </p>
                    {candidate.manifesto && (
                      <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>
                        "{candidate.manifesto.length > 100 ? candidate.manifesto.slice(0, 100) + '…' : candidate.manifesto}"
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {currentCandidates.length === 0 && (
              <div className="text-center py-20" style={{ color: '#52525B' }}>
                <User size={40} className="mx-auto mb-4 opacity-30" />
                <p>No candidates added for this position yet.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            disabled={!selectedForRole}
            className="flex items-center gap-3 px-10 py-4 rounded-xl font-semibold text-white transition-all duration-200 focus:outline-none"
            style={{
              background: selectedForRole ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : 'rgba(255,255,255,0.05)',
              boxShadow: selectedForRole ? '0 0 24px rgba(124,58,237,0.35)' : 'none',
              color: selectedForRole ? '#fff' : '#3f3f46',
              cursor: selectedForRole ? 'pointer' : 'not-allowed',
            }}
          >
            {isLastRole ? 'Review Ballot' : 'Next Position'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
