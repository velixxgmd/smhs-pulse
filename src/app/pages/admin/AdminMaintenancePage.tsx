import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Trash2, RotateCcw, Database, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { electionService } from '../../services/electionService';
import { toast } from 'sonner';

interface Props {
  mode: 'demo' | 'live';
  onRestored?: () => void;
}

interface Action {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  danger: boolean;
  demoOnly?: boolean;
}

export function AdminMaintenancePage({ mode, onRestored }: Props) {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const actions: Action[] = [
    { id: 'reset-votes', icon: <RefreshCw size={20} />, title: 'Reset Votes Only', description: 'Delete all recorded votes while keeping candidates and voting codes intact.', color: '#FBBF24', danger: false },
    { id: 'reset-codes', icon: <RefreshCw size={20} />, title: 'Reset Codes (Mark All Unused)', description: 'Reset every voting code back to an unused state so they can be reused for testing.', color: '#22D3EE', danger: false },
    { id: 'clear-logs', icon: <Trash2 size={20} />, title: 'Clear Attempt Logs', description: 'Delete all failed login attempts, invalid code entries, and audit logs without affecting votes.', color: '#71717A', danger: false },
    { id: 'full-reset', icon: <RotateCcw size={20} />, title: 'Full Election Reset', description: 'Remove all votes, reset every code, clear logs, and prepare the platform for a completely new election.', color: '#EF4444', danger: true },
    ...(mode === 'demo' ? [{ id: 'restore-demo', icon: <Database size={20} />, title: 'Reset Demo Data', description: 'Restore all sample candidates, voting codes, graphs, and statistics exactly as they were when the project was first opened.', color: '#7C3AED', danger: false, demoOnly: true }] : []),
  ];

  const executeAction = async (id: string) => {
    setLoading(id);
    setConfirm(null);
    try {
      switch (id) {
        case 'reset-votes': await electionService.resetVotes(); toast.success('Votes reset successfully.'); break;
        case 'reset-codes': await electionService.resetCodesOnly(); toast.success('All codes marked unused.'); break;
        case 'clear-logs': await electionService.clearAttemptLogs(); toast.success('Attempt logs cleared.'); break;
        case 'full-reset': await electionService.fullReset(); toast.success('Full election reset complete.'); break;
        case 'restore-demo':
          await electionService.restoreDemoData();
          toast.success('Demo data restored to defaults.');
          onRestored?.();
          break;
      }
    } catch (e) {
      toast.error(`Operation failed: ${e}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Maintenance & Database</h1>
        <p className="text-sm" style={{ color: '#71717A' }}>Administrative tools for managing election data. Use with care.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {actions.map(action => (
          <motion.div key={action.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 card-hover"
            style={{ borderColor: action.danger ? 'rgba(239,68,68,0.1)' : undefined }}>
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 rounded-xl flex-shrink-0" style={{ background: `${action.color}15` }}>
                <div style={{ color: action.color }}>{action.icon}</div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{action.title}</h3>
                  {action.demoOnly && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.1)', color: '#A855F7', border: '1px solid rgba(124,58,237,0.2)' }}>Demo Only</span>
                  )}
                </div>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: '#71717A' }}>{action.description}</p>
              </div>
            </div>
            <button
              onClick={() => setConfirm(action.id)}
              disabled={loading !== null}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: action.danger ? 'rgba(239,68,68,0.1)' : `${action.color}15`,
                color: action.danger ? '#EF4444' : action.color,
                border: `1px solid ${action.danger ? 'rgba(239,68,68,0.25)' : `${action.color}25`}`,
                cursor: loading !== null ? 'not-allowed' : 'pointer',
                opacity: loading !== null ? 0.6 : 1,
              }}>
              {loading === action.id ? <><Loader2 size={14} className="animate-spin" />Processing...</> : <>{action.icon}{action.title}</>}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {confirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-3xl p-8 max-w-md w-full" role="dialog" aria-modal="true">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <AlertTriangle size={22} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Confirm Action</h3>
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>
                    {actions.find(a => a.id === confirm)?.description}
                    {confirm === 'full-reset' && <strong style={{ color: '#EF4444' }}> This action cannot be undone.</strong>}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirm(null)} className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#A1A1AA' }}>Cancel</button>
                <button onClick={() => executeAction(confirm)} className="flex-1 py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: confirm === 'full-reset' ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
                  <CheckCircle2 size={15} /> Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
