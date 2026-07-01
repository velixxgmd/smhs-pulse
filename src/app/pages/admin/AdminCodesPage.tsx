import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Search, Loader2, CheckCircle, XCircle, Plus, X, Lock, ArrowRight } from 'lucide-react';
import { electionService } from '../../services/electionService';
import { useRefresh } from '../../context/RefreshContext';
import type { VotingCode, VoteIdLookupResult, Election } from '../../types';
import { toast } from 'sonner';

export function AdminCodesPage() {
  const { revision } = useRefresh();
  const [codes, setCodes] = useState<VotingCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({ class: '10', section: 'A', max_roll: '' });
  const [generating, setGenerating] = useState(false);
  const [election, setElection] = useState<Election | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const classRef = useRef<HTMLSelectElement>(null);
  const sectionRef = useRef<HTMLSelectElement>(null);
  const maxRollRef = useRef<HTMLInputElement>(null);

  // Student lookup state
  const [lookupMethod, setLookupMethod] = useState<'student' | 'voteId'>('student');
  const [lookupClass, setLookupClass] = useState('');
  const [lookupSection, setLookupSection] = useState('');
  const [lookupRoll, setLookupRoll] = useState('');
  const [lookupResult, setLookupResult] = useState<VotingCode | null | 'not-found'>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Vote ID lookup state
  const [lookupVoteIdInput, setLookupVoteIdInput] = useState('');
  const [voteIdLookupResult, setVoteIdLookupResult] = useState<VoteIdLookupResult | null>(null);
  const [voteIdLookupLoading, setVoteIdLookupLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<'all' | 'unused' | 'used'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const [allCodes, elec] = await Promise.all([
        electionService.getAllCodes(),
        electionService.getElection(),
      ]);
      setCodes(allCodes);
      setElection(elec);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [revision]);

  const handleGenerate = async () => {
    setValidationError(null);
    if (!genForm.max_roll || genForm.max_roll.trim() === '') {
      setValidationError('Please enter the highest roll number.');
      return;
    }
    const maxRoll = parseInt(genForm.max_roll, 10);
    if (!Number.isFinite(maxRoll) || maxRoll < 1) {
      setValidationError('Please enter the highest roll number.');
      return;
    }
    setGenerating(true);
    try {
      const newCodes = await electionService.generateCodes({ class: genForm.class, section: genForm.section, max_roll: maxRoll });
      toast.success(`${newCodes.length} codes generated successfully!`);
      await load();
    } catch (e) { toast.error(`Failed: ${e}`); }
    finally { setGenerating(false); }
  };

  const handleNextSection = () => {
    const sections = ['A', 'B', 'C', 'D', 'E'];
    const currentIdx = sections.indexOf(genForm.section);
    if (currentIdx < sections.length - 1) {
      setGenForm(f => ({ ...f, section: sections[currentIdx + 1] }));
    }
  };

  const isLastSection = genForm.section === 'E';

  const handleQuickFill = (val: number) => {
    setGenForm(f => ({ ...f, max_roll: String(val) }));
    setValidationError(null);
  };

  const handleStudentLookup = async () => {
    if (!lookupClass || !lookupSection || !lookupRoll) return;
    setLookupLoading(true);
    try {
      const result = await electionService.lookupCode(lookupClass, lookupSection, parseInt(lookupRoll));
      setLookupResult(result || 'not-found');
    } finally { setLookupLoading(false); }
  };

  const handleVoteIdLookup = async () => {
    if (!lookupVoteIdInput.trim()) return;
    setVoteIdLookupLoading(true);
    try {
      const result = await electionService.lookupVoteId(lookupVoteIdInput.trim().toUpperCase());
      setVoteIdLookupResult(result);
    } catch {
      setVoteIdLookupResult({ found: false });
    } finally { setVoteIdLookupLoading(false); }
  };

  const filtered = codes.filter(c => filterStatus === 'all' || c.status === filterStatus);
  const sortedFiltered = [...filtered].sort((a, b) => {
    const classDiff = Number(a.class) - Number(b.class);
    if (classDiff !== 0) return classDiff;
    const sectionDiff = a.section.localeCompare(b.section);
    if (sectionDiff !== 0) return sectionDiff;
    return Number(a.roll_number) - Number(b.roll_number);
  });
  const usedCount = codes.filter(c => c.status === 'used').length;
  const unusedCount = codes.filter(c => c.status === 'unused').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Voting Codes</h1>
          <p className="text-sm" style={{ color: '#71717A' }}>{codes.length} total · {usedCount} used · {unusedCount} remaining</p>
        </div>
        <button onClick={() => setShowGenerate(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
          <Plus size={16} /> Generate Codes
        </button>
      </div>

      {/* Code Lookup */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="text-base font-semibold text-white mb-4">Code Lookup</h3>

        {/* Lookup Method Selector */}
        <div className="flex gap-4 mb-5">
          {([
            { value: 'student' as const, label: 'Student Information' },
            { value: 'voteId' as const, label: 'Vote ID' },
          ]).map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="lookupMethod"
                value={opt.value}
                checked={lookupMethod === opt.value}
                onChange={() => {
                  setLookupMethod(opt.value);
                  setLookupResult(null);
                  setVoteIdLookupResult(null);
                }}
                className="accent-purple-600"
              />
              <span className="text-sm" style={{ color: lookupMethod === opt.value ? '#A1A1AA' : '#71717A' }}>{opt.label}</span>
            </label>
          ))}
        </div>

        {lookupMethod === 'student' ? (
          <>
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#71717A' }}>Class</label>
                <select value={lookupClass} onChange={e => setLookupClass(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="" style={{ background: '#18181B' }}>Select</option>
                  {['6','7','8','9','10'].map(c => <option key={c} value={c} style={{ background: '#18181B' }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#71717A' }}>Section</label>
                <select value={lookupSection} onChange={e => setLookupSection(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="" style={{ background: '#18181B' }}>Select</option>
                  {['A','B','C','D','E'].map(s => <option key={s} value={s} style={{ background: '#18181B' }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#71717A' }}>Roll No</label>
                <input type="number" value={lookupRoll} onChange={e => setLookupRoll(e.target.value)} placeholder="1"
                  className="w-20 px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <button onClick={handleStudentLookup} disabled={lookupLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(124,58,237,0.15)', color: '#A855F7', border: '1px solid rgba(124,58,237,0.25)' }}>
                {lookupLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Lookup
              </button>
            </div>
            {lookupResult !== null && (
              <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {lookupResult === 'not-found' ? (
                  <p className="text-sm" style={{ color: '#EF4444' }}>No code found for this student.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>Class</span>
                      <span className="text-sm text-white font-medium">{lookupResult.class}</span>
                      <span className="text-xs" style={{ color: '#3f3f46' }}>→</span>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>Section</span>
                      <span className="text-sm text-white font-medium">{lookupResult.section}</span>
                      <span className="text-xs" style={{ color: '#3f3f46' }}>→</span>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>Roll</span>
                      <span className="text-sm text-white font-medium">{lookupResult.roll_number}</span>
                    </div>
                    <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>Assigned Voting Code</span>
                      <span className="font-mono font-bold text-lg" style={{ color: '#7C3AED' }}>{lookupResult.code}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full`}
                        style={{ background: lookupResult.status === 'used' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: lookupResult.status === 'used' ? '#EF4444' : '#22C55E' }}>
                        {lookupResult.status.toUpperCase()}
                      </span>
                    </div>
                    {lookupResult.status === 'used' && (
                      <>
                        <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>Vote ID</span>
                          {election?.finalized ? (
                            <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#71717A' }}>
                              <Lock size={12} />
                              Removed after Election Finalization
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-lg" style={{ color: '#22D3EE' }}>{lookupResult.voteId || '—'}</span>
                          )}
                          {!election?.finalized && lookupResult.voteId && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                              Recorded Successfully
                            </span>
                          )}
                        </div>
                        {lookupResult.used_at && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>Timestamp</span>
                            <span className="text-xs" style={{ color: '#71717A' }}>{new Date(lookupResult.used_at).toLocaleString()}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#71717A' }}>Vote ID</label>
                <input
                  type="text"
                  value={lookupVoteIdInput}
                  onChange={e => setLookupVoteIdInput(e.target.value)}
                  placeholder="VOTE-R4QM"
                  className="w-48 px-3 py-2.5 rounded-xl text-white text-sm font-mono focus:outline-none uppercase"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <button onClick={handleVoteIdLookup} disabled={voteIdLookupLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(124,58,237,0.15)', color: '#A855F7', border: '1px solid rgba(124,58,237,0.25)' }}>
                {voteIdLookupLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Lookup
              </button>
            </div>
            {voteIdLookupResult !== null && (
              <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {!voteIdLookupResult.found ? (
                  <p className="text-sm" style={{ color: '#EF4444' }}>Vote ID not found.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>Vote ID</span>
                      <span className="font-mono font-bold text-lg" style={{ color: '#22D3EE' }}>{voteIdLookupResult.voteId}</span>
                    </div>
                    <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>Status</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                        {voteIdLookupResult.status}
                      </span>
                    </div>
                    {voteIdLookupResult.timestamp && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>Timestamp</span>
                        <span className="text-xs" style={{ color: '#71717A' }}>{new Date(voteIdLookupResult.timestamp).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>Connected Voting Code</span>
                      {voteIdLookupResult.finalized ? (
                        <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#71717A' }}>
                          <Lock size={12} />
                          Permanently Removed
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-lg" style={{ color: '#7C3AED' }}>{voteIdLookupResult.connectedCode || '—'}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Code list */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex gap-2">
            {(['all', 'unused', 'used'] as const).map(f => (
              <button key={f} onClick={() => setFilterStatus(f)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: filterStatus === f ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)', color: filterStatus === f ? '#A855F7' : '#71717A' }}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? codes.length : codes.filter(c => c.status === f).length})
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {['Code', 'Class', 'Section', 'Roll', 'Status', 'Used At', 'Batch'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: '#7C3AED' }} /></td></tr>
              ) : sortedFiltered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm" style={{ color: '#52525B' }}>No codes found. Generate codes to get started.</td></tr>
              ) : (
                sortedFiltered.slice(0, 200).map(c => (
                  <tr key={c.id} className="border-b transition-colors" style={{ borderColor: 'rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-5 py-3 font-mono font-bold" style={{ color: '#A855F7' }}>{c.code}</td>
                    <td className="px-5 py-3 text-sm text-white">{c.class}</td>
                    <td className="px-5 py-3 text-sm text-white">{c.section}</td>
                    <td className="px-5 py-3 text-sm text-white">{c.roll_number}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: c.status === 'used' ? '#EF4444' : '#22C55E' }}>
                        {c.status === 'used' ? <XCircle size={12} /> : <CheckCircle size={12} />}
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: '#71717A' }}>{c.used_at ? new Date(c.used_at).toLocaleString() : '—'}</td>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: '#52525B' }}>{c.batch_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate modal */}
      <AnimatePresence>
        {showGenerate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-3xl p-8 w-full max-w-md" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Generate Voting Codes</h2>
                <button onClick={() => setShowGenerate(false)} style={{ color: '#71717A' }} aria-label="Close"><X size={18} /></button>
              </div>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>Class</label>
                    <select ref={classRef} value={genForm.class} onChange={e => setGenForm(f => ({ ...f, class: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {['6','7','8','9','10'].map(c => <option key={c} value={c} style={{ background: '#18181B' }}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>Section</label>
                    <select ref={sectionRef} value={genForm.section} onChange={e => setGenForm(f => ({ ...f, section: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {['A','B','C','D','E'].map(s => <option key={s} value={s} style={{ background: '#18181B' }}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>Highest Roll Number</label>
                  <input ref={maxRollRef} type="number" min={1} max={200} value={genForm.max_roll} onChange={e => { setGenForm(f => ({ ...f, max_roll: e.target.value })); setValidationError(null); }}
                    placeholder="Enter highest roll number"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  {validationError && (
                    <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>{validationError}</p>
                  )}
                  <div className="mt-2">
                    <span className="text-xs font-semibold uppercase tracking-wider mr-2" style={{ color: '#52525B' }}>Quick Fill</span>
                    {[30, 35, 40].map(val => (
                      <button key={val} onClick={() => handleQuickFill(val)}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium mr-1.5 transition-colors"
                        style={{ background: 'rgba(124,58,237,0.1)', color: '#A855F7', border: '1px solid rgba(124,58,237,0.2)' }}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={handleGenerate} disabled={generating} className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', opacity: generating ? 0.85 : 1 }}>
                  {generating ? <><Loader2 size={15} className="animate-spin" />Generating...</> : <><Key size={15} />Generate</>}
                </button>
                <button onClick={handleNextSection} disabled={isLastSection || generating}
                  className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: isLastSection ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                    color: isLastSection ? '#52525B' : '#A1A1AA',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: isLastSection ? 'not-allowed' : 'pointer',
                  }}>
                  <ArrowRight size={15} />
                  {isLastSection ? 'You have reached the last section for this class' : 'Generate Next Section'}
                </button>
                <button onClick={() => setShowGenerate(false)} className="w-full py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#A1A1AA' }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
