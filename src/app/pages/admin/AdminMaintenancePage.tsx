import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Trash2, RotateCcw, Database, AlertTriangle, CheckCircle2, Loader2, X, Archive } from 'lucide-react';
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
  whatWillDelete?: string[];
  confirmationText?: boolean;
}

export function AdminMaintenancePage({ mode, onRestored }: Props) {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [dangerConfirmText, setDangerConfirmText] = useState('');

  const maintenanceActions: Action[] = [
    { id: 'reset-votes', icon: <RefreshCw size={20} />, title: 'Reset Votes Only', description: 'Delete all recorded votes while keeping candidates and voting codes intact.', color: '#FBBF24', danger: false },
    { id: 'reset-codes', icon: <RefreshCw size={20} />, title: 'Reset Codes (Mark All Unused)', description: 'Reset every voting code back to an unused state so they can be reused for testing.', color: '#22D3EE', danger: false },
    { id: 'clear-logs', icon: <Trash2 size={20} />, title: 'Clear Attempt Logs', description: 'Delete all failed login attempts, invalid code entries, and audit logs without affecting votes.', color: '#71717A', danger: false },
    { id: 'full-reset', icon: <RotateCcw size={20} />, title: 'Full Election Reset', description: 'Remove all votes, reset every code, clear logs, and prepare the platform for a completely new election.', color: '#EF4444', danger: true },
    ...(mode === 'demo' ? [{ id: 'restore-demo', icon: <Database size={20} />, title: 'Reset Demo Data', description: 'Restore all sample candidates, voting codes, graphs, and statistics exactly as they were when the project was first opened.', color: '#7C3AED', danger: false, demoOnly: true }] : []),
  ];

  const advancedActions: Action[] = [
    { id: 'delete-codes', icon: <Trash2 size={20} />, title: 'Delete All Voting Codes', description: 'Completely remove every generated voting code from the database. This is NOT a reset.', color: '#EF4444', danger: true, whatWillDelete: ['All voting codes'] },
    { id: 'delete-votes', icon: <Trash2 size={20} />, title: 'Delete All Votes', description: 'Delete every recorded vote, Vote ID, and timestamp. Candidates remain.', color: '#EF4444', danger: true, whatWillDelete: ['All votes', 'All Vote IDs', 'All timestamps'] },
    { id: 'delete-current-election', icon: <Trash2 size={20} />, title: 'Delete Current Election', description: 'Delete the currently active election, including all candidates, votes, and codes.', color: '#EF4444', danger: true, whatWillDelete: ['Current election', 'All candidates', 'All votes', 'All Vote IDs', 'All voting codes'] },
    { id: 'delete-archives', icon: <Archive size={20} />, title: 'Delete ALL Archived Elections', description: 'Delete every archived election. The current election will remain untouched.', color: '#EF4444', danger: true, whatWillDelete: ['All archived elections'] },
    { id: 'delete-everything', icon: <AlertTriangle size={20} />, title: 'Delete Everything', description: 'Danger Zone. This deletes everything including elections, votes, codes, logs, and settings.', color: '#EF4444', danger: true, confirmationText: true, whatWillDelete: ['Elections', 'Archived elections', 'Votes', 'Vote IDs', 'Candidates', 'Voting codes', 'Logs', 'Settings'] },
  ];

  const allActions = [...maintenanceActions, ...advancedActions];

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
        case 'delete-codes': await electionService.deleteAllVotingCodes(); toast.success('Voting codes deleted successfully.'); break;
        case 'delete-votes': await electionService.deleteAllVotes(); toast.success('Votes deleted successfully.'); break;
        case 'delete-current-election': await electionService.deleteCurrentElection(); toast.success('Current election deleted successfully.'); break;
        case 'delete-archives': await electionService.deleteAllArchivedElections(); toast.success('All archived elections deleted successfully.'); break;
        case 'delete-everything': await electionService.deleteEverything(); toast.success('Everything has been deleted.'); break;
      }
    } catch (e) {
      toast.error('Unable to complete the requested operation. Please try again.');
    } finally {
      setLoading(null);
      setDangerConfirmText('');
    }
  };

  const selectedAction = allActions.find(a => a.id === confirm);
  const canConfirmDelete = !selectedAction?.confirmationText || dangerConfirmText === 'DELETE EVERYTHING';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Maintenance & Database</h1>
        <p className="text-sm" style={{ color: '#71717A' }}>Administrative tools for managing election data. Use with care.</p>
      </div>

      {/* Maintenance Actions */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#52525B' }}>Maintenance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {maintenanceActions.map(action => (
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
      </div>

      {/* Advanced Database Management */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#52525B' }}>Advanced Database Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {advancedActions.map(action => (
            <motion.div key={action.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 card-hover"
              style={{ borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="flex items-start gap-4 mb-5">
                <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <div style={{ color: '#EF4444' }}>{action.icon}</div>
                </div>
                <div>
                  <h3 className="font-bold text-white">{action.title}</h3>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: '#71717A' }}>{action.description}</p>
                </div>
              </div>
              <button
                onClick={() => setConfirm(action.id)}
                disabled={loading !== null}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  color: '#EF4444',
                  border: '1px solid rgba(239,68,68,0.25)',
                  cursor: loading !== null ? 'not-allowed' : 'pointer',
                  opacity: loading !== null ? 0.6 : 1,
                }}>
                {loading === action.id ? <><Loader2 size={14} className="animate-spin" />Deleting...</> : <><Trash2 size={14} />{action.title}</>}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {confirm && selectedAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-3xl p-8 max-w-md w-full" role="dialog" aria-modal="true">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <AlertTriangle size={22} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Confirm {selectedAction.title}</h3>
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>
                    {selectedAction.description}
                    <strong style={{ color: '#EF4444' }}> This action cannot be undone.</strong>
                  </p>
                  {selectedAction.whatWillDelete && selectedAction.whatWillDelete.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#EF4444' }}>This will delete:</div>
                      <ul className="space-y-0.5">
                        {selectedAction.whatWillDelete.map(item => (
                          <li key={item} className="text-xs flex items-center gap-1.5" style={{ color: '#FCA5A5' }}>
                            <X size={10} /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {selectedAction.confirmationText && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>
                    Type <span style={{ color: '#EF4444' }}>DELETE EVERYTHING</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={dangerConfirmText}
                    onChange={e => setDangerConfirmText(e.target.value)}
                    placeholder="DELETE EVERYTHING"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setConfirm(null); setDangerConfirmText(''); }} className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#A1A1AA' }}>Cancel</button>
                <button onClick={() => executeAction(confirm)} disabled={loading !== null || !canConfirmDelete}
                  className="flex-1 py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', opacity: (loading !== null || !canConfirmDelete) ? 0.5 : 1, cursor: (loading !== null || !canConfirmDelete) ? 'not-allowed' : 'pointer' }}>
                  {loading === confirm ? <><Loader2 size={15} className="animate-spin" />Deleting...</> : <><Trash2 size={15} />Delete</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
