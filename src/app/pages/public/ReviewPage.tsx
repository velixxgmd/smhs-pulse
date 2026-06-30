import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, AlertTriangle, Loader2, User, CheckCircle2 } from 'lucide-react';
import { electionService } from '../../services/electionService';
import { useRefresh } from '../../context/RefreshContext';
import { generateDeviceHash, generateSessionId } from '../../services/securityService';
import type { VotingCode, Candidate } from '../../types';

interface Props {
  votingCode: VotingCode;
  selections: Record<string, string>;
  onBack: () => void;
  onSuccess: (voteId: string) => void;
}

export function ReviewPage({ votingCode, selections, onBack, onSuccess }: Props) {
  const { revision } = useRefresh();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [electionStatus, setElectionStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cs, e] = await Promise.all([
          electionService.getCandidates(),
          electionService.getElection(),
        ]);
        setCandidates(cs);
        setElectionStatus(e.status);
      } catch {
      }
    })();
  }, [revision]);

  const getCandidateById = (id: string) => candidates.find(c => c.id === id);

  const handleSubmit = async () => {
    if (electionStatus && electionStatus !== 'LIVE') {
      const msg =
        electionStatus === 'UPCOMING' ? 'Voting has not started yet.' :
        electionStatus === 'PAUSED' ? 'Voting is temporarily paused. Please wait for it to resume.' :
        'Voting is currently closed.';
      setError(msg);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await electionService.submitVote({
        code: votingCode.code,
        candidate_selections: selections,
        device_hash: generateDeviceHash(),
        session_id: generateSessionId(),
      });
      if (result.success) {
        onSuccess(result.voteId || '');
      } else {
        setError(result.error || 'Submission failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm mb-10 transition-colors duration-200"
          style={{ color: '#71717A' }}
        >
          <ArrowLeft size={16} />
          Edit Selections
        </button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Review Your Ballot</h1>
            <p className="text-sm" style={{ color: '#71717A' }}>
              One final check before submission. Your code expires forever after you vote.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {Object.entries(selections).map(([role, candidateId]) => {
              const candidate = getCandidateById(candidateId);
              return (
                <div key={role}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(124,58,237,0.15)' }}>
                    <User size={18} style={{ color: '#7C3AED' }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#7C3AED' }}>{role}</div>
                    <div className="text-white font-semibold">{candidate?.name || 'Unknown'}</div>
                    <div className="text-xs" style={{ color: '#71717A' }}>Class {candidate?.class}{candidate?.section}</div>
                  </div>
                  <CheckCircle2 size={18} style={{ color: '#22C55E' }} />
                </div>
              );
            })}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-xl mb-6"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <AlertTriangle size={16} style={{ color: '#FBBF24', marginTop: 2, flexShrink: 0 }} />
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              After submission, your voting code <strong style={{ color: '#FAFAFA' }}>expires permanently</strong> and cannot be reused. This action cannot be undone.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7C3AED, #A855F7)',
              boxShadow: loading ? 'none' : '0 0 24px rgba(124,58,237,0.35)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Saving vote...</> : 'Submit My Vote'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
