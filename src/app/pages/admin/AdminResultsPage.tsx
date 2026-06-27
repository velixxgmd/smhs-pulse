import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Lock, Loader2, User, Crown } from 'lucide-react';
import { electionService } from '../../services/electionService';
import type { ElectionResults, Election } from '../../types';

export function AdminResultsPage() {
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [r, e] = await Promise.all([electionService.getResults(), electionService.getElection()]);
        setResults(r); setElection(e);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full py-24"><Loader2 size={32} className="animate-spin" style={{ color: '#7C3AED' }} /></div>;

  const isLive = election?.status === 'LIVE' || election?.status === 'UPCOMING' || election?.status === 'PAUSED';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Election Results</h1>
        <p className="text-sm" style={{ color: '#71717A' }}>
          {election?.name} {election?.year}
          {isLive && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>Results hidden while voting is active</span>}
        </p>
      </div>

      {isLive ? (
        <div className="glass rounded-3xl p-16 text-center">
          <Lock size={48} className="mx-auto mb-4 opacity-30" style={{ color: '#71717A' }} />
          <h2 className="text-xl font-bold text-white mb-2">Results Not Available Yet</h2>
          <p className="max-w-md mx-auto text-sm" style={{ color: '#71717A' }}>
            Election results are hidden while voting is active. End the election from the Dashboard to reveal results.
          </p>
        </div>
      ) : results ? (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Total Votes', value: results.total_votes, color: '#7C3AED' },
              { label: 'Total Students', value: results.total_students, color: '#22D3EE' },
              { label: 'Turnout', value: `${results.turnout_percent}%`, color: '#22C55E' },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold mb-1 tabular-nums" style={{ color: s.color }}>{s.value}</div>
                <div className="text-sm" style={{ color: '#71717A' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Results per role */}
          <div className="space-y-5">
            {results.results.map((roleResult, i) => (
              <motion.div key={roleResult.role} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <Trophy size={16} style={{ color: '#FBBF24' }} />
                  <h3 className="font-semibold text-white">{roleResult.role}</h3>
                </div>
                <div className="p-6">
                  <div className="flex gap-4 flex-wrap">
                    {roleResult.candidates.map((c, ci) => {
                      const maxVotes = roleResult.candidates[0]?.vote_count || 1;
                      const isWinner = ci === 0;
                      return (
                        <div key={c.id} className="flex-1 min-w-48 p-4 rounded-2xl" style={{
                          background: isWinner ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isWinner ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}`,
                        }}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isWinner ? 'rgba(251,191,36,0.15)' : 'rgba(124,58,237,0.1)' }}>
                              {isWinner ? <Crown size={16} style={{ color: '#FBBF24' }} /> : <User size={16} style={{ color: '#7C3AED' }} />}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm">{c.name}</div>
                              <div className="text-xs" style={{ color: '#71717A' }}>Class {c.class}{c.section}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold" style={{ color: isWinner ? '#FBBF24' : '#71717A' }}>{c.vote_count} votes</span>
                            <span className="text-xs" style={{ color: '#52525B' }}>{maxVotes > 0 ? Math.round((c.vote_count / maxVotes) * 100) : 0}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${maxVotes > 0 ? (c.vote_count / maxVotes) * 100 : 0}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                              className="h-full rounded-full" style={{ background: isWinner ? '#FBBF24' : '#7C3AED' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
