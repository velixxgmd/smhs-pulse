import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  LayoutDashboard, Users, Key, Download, Settings, Shield, LogOut,
  TrendingUp, Clock, AlertTriangle, Activity, Zap, Play, Pause, Square,
  RefreshCw, Database, ChevronRight, Loader2, X, Archive, HardDrive, BarChart3
} from 'lucide-react';
import { electionService } from '../../services/electionService';
import { useMode } from '../../context/ModeContext';
import { useAuth } from '../../context/AuthContext';
import { useRefresh } from '../../context/RefreshContext';
import type { TurnoutData, AttemptLog, Election, DatabaseOverview } from '../../types';
import { toast } from 'sonner';
import { AdminCandidatesPage } from './AdminCandidatesPage';
import { AdminCodesPage } from './AdminCodesPage';
import { AdminExportPage } from './AdminExportPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { AdminResultsPage } from './AdminResultsPage';
import { AdminAttemptLogsPage } from './AdminAttemptLogsPage';
import { AdminMaintenancePage } from './AdminMaintenancePage';
import { AdminArchivePage } from './AdminArchivePage';

type AdminTab = 'dashboard' | 'candidates' | 'codes' | 'export' | 'settings' | 'results' | 'logs' | 'archive' | 'maintenance';

interface Props {
  onClose: () => void;
}

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

export function AdminDashboardPage({ onClose }: Props) {
  const { mode, setMode } = useMode();
  const { revision } = useRefresh();
  const { logout } = useAuth();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [turnout, setTurnout] = useState<TurnoutData[]>([]);
  const [logs, setLogs] = useState<AttemptLog[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [stats, setStats] = useState({ totalCodes: 0, totalVoted: 0, remaining: 0, turnoutPercent: 0, lastVoteTime: '' });
  const [loading, setLoading] = useState(true);
  const [showModeModal, setShowModeModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<'live' | null>(null);
  const [showNewElectionModal, setShowNewElectionModal] = useState(false);
  const [startingNewElection, setStartingNewElection] = useState(false);
  const [newElectionName, setNewElectionName] = useState('');
  const [newElectionYear, setNewElectionYear] = useState('');
  const [newElectionBaseline, setNewElectionBaseline] = useState<{ name: string; year: number } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('smhs_admin_sidebar_collapsed') === '1');
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [dbOverview, setDbOverview] = useState<DatabaseOverview | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isCurrentArchived, setIsCurrentArchived] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, l, e, s, db, archives] = await Promise.all([
        electionService.getTurnout(),
        electionService.getRecentAttempts(10),
        electionService.getElection(),
        electionService.getTotalStats(),
        electionService.getDatabaseOverview().catch(() => null),
        electionService.getArchivedElections().catch(() => []),
      ]);
      setTurnout(t);
      setLogs(l);
      setElection(e);
      setStats(s as typeof stats);
      setDbOverview(db);
      setIsCurrentArchived(e ? archives.some((a: import('../../types').ArchivedElection) => a.electionId === e.id) : false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, revision]);

  useEffect(() => {
    if (tab === 'dashboard') loadData();
  }, [loadData, tab]);

  useEffect(() => {
    localStorage.setItem('smhs_admin_sidebar_collapsed', sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

const handleModeSwitch = async (newMode: "demo" | "live") => {
  if (newMode === mode) return;

  if (newMode === "live") {
    setPendingMode("live");
    setShowModeModal(true);
    return;
  }

  await electionService.updateElectionStatus(undefined, "demo");
  setMode("demo");
  await loadData();
};

const confirmLiveSwitch = async () => {
  await electionService.updateElectionStatus(undefined, "live");

  setMode("live");
  setShowModeModal(false);
  setPendingMode(null);

  await loadData();
};

  const handleStatusChange = async (status: import('../../types').ElectionStatus) => {
    await electionService.updateElectionStatus(status);
    await loadData();
  };

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'candidates', label: 'Candidates', icon: <Users size={16} /> },
    { id: 'codes', label: 'Generate Codes', icon: <Key size={16} /> },
    { id: 'export', label: 'Export Center', icon: <Download size={16} /> },
    { id: 'results', label: 'Results', icon: <TrendingUp size={16} /> },
    { id: 'archive', label: 'Election Archive', icon: <Archive size={16} /> },
    { id: 'logs', label: 'Security Logs', icon: <Shield size={16} /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Database size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  const statusColors: Record<string, string> = { LIVE: '#22C55E', UPCOMING: '#71717A', PAUSED: '#FBBF24', CLOSED: '#EF4444', ARCHIVED: '#52525B', RESULTS_PUBLISHED: '#22D3EE' };
  const statusLabel = election?.status;

  const openStartNewElection = () => {
    if (!election) return;
    const baseline = { name: election.name, year: election.year };
    setNewElectionBaseline(baseline);
    setNewElectionName(baseline.name);
    setNewElectionYear(String(new Date().getFullYear()));
    setShowNewElectionModal(true);
  };

  const confirmStartNewElection = async () => {
    if (!newElectionBaseline) return;

    const nameTrimmed = newElectionName.trim();
    const parsedYear = Number.parseInt(newElectionYear, 10);

    if (nameTrimmed.length === 0) return;
    if (!Number.isFinite(parsedYear)) return;

    const patch: { name?: string; year?: number } = {};
    if (nameTrimmed !== newElectionBaseline.name.trim()) patch.name = nameTrimmed;
    if (parsedYear !== newElectionBaseline.year) patch.year = parsedYear;

    setStartingNewElection(true);
    try {
      await electionService.startNewElection(patch);
      setShowNewElectionModal(false);
      await loadData();
    } finally {
      setStartingNewElection(false);
    }
  };

  const handleFinalizeElection = async () => {
    setFinalizing(true);
    try {
      const result = await electionService.finalizeElection();
      if (result.success) {
        toast.success('Election finalized. Voting code relationships have been permanently destroyed.');
        setShowFinalizeModal(false);
        await loadData();
      } else {
        toast.error(result.error || 'Finalization failed.');
      }
    } catch (e) {
      toast.error(`Finalization failed: ${e}`);
    } finally {
      setFinalizing(false);
    }
  };

  const handleArchiveElection = async () => {
    setArchiving(true);
    try {
      const result = await electionService.archiveElection();
      if (result.success) {
        toast.success('Election archived successfully.');
        setShowArchiveModal(false);
        await loadData();
      } else {
        toast.error(result.error || 'Archiving failed.');
      }
    } catch (e) {
      toast.error(`Archiving failed: ${e}`);
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex" style={{ background: '#09090B' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 84 : 256 }}
        transition={{ duration: 0.25 }}
        className="flex-shrink-0 flex flex-col h-full border-r"
        style={{ background: 'rgba(17,24,39,0.95)', borderColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
                <Zap size={14} className="text-white" />
              </div>
              <div
                className="min-w-0"
                style={{
                  opacity: sidebarCollapsed ? 0 : 1,
                  width: sidebarCollapsed ? 0 : 'auto',
                  overflow: 'hidden',
                  transition: 'opacity 200ms ease, width 200ms ease',
                }}>
                <div className="font-bold text-white text-sm truncate">Pulse by SMHS</div>
                <div className="text-xs" style={{ color: '#52525B' }}>Admin Console</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarCollapsed(v => !v)}
              className="p-2 rounded-xl transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#71717A' }}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              <ChevronRight
                size={16}
                style={{
                  transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 200ms ease',
                }}
              />
            </button>
          </div>
          {/* Mode badge */}
          <div
            className="flex gap-2"
            style={{
              opacity: sidebarCollapsed ? 0 : 1,
              height: sidebarCollapsed ? 0 : 'auto',
              overflow: 'hidden',
              transition: 'opacity 200ms ease, height 200ms ease',
            }}>
            {(['demo', 'live'] as const).map(m => (
              <button key={m} onClick={() => handleModeSwitch(m)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: mode === m ? (m === 'demo' ? 'rgba(251,191,36,0.15)' : 'rgba(34,197,94,0.15)') : 'rgba(255,255,255,0.04)',
                  color: mode === m ? (m === 'demo' ? '#FBBF24' : '#22C55E') : '#71717A',
                  border: `1px solid ${mode === m ? (m === 'demo' ? 'rgba(251,191,36,0.25)' : 'rgba(34,197,94,0.25)') : 'transparent'}`,
                }}>
                {m === 'demo' ? '🟡 Demo' : '🟢 Live'}
              </button>
            ))}
          </div>
        </div>

        {/* Election status */}
        {election && (
          <div
            className="px-4 py-3 border-b"
            style={{
              borderColor: 'rgba(255,255,255,0.06)',
              opacity: sidebarCollapsed ? 0 : 1,
              height: sidebarCollapsed ? 0 : 'auto',
              overflow: 'hidden',
              transition: 'opacity 200ms ease, height 200ms ease',
            }}>
            <div className="text-xs mb-1" style={{ color: '#52525B' }}>Active Election</div>
            <div className="text-sm font-semibold text-white truncate">{election.name} {election.year}</div>
            <div className="flex items-center gap-2 mt-1">
              {statusLabel && statusColors[statusLabel] ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[statusLabel] }} />
                  <span className="text-xs font-medium" style={{ color: statusColors[statusLabel] }}>{statusLabel}</span>
                </>
              ) : statusLabel ? (
                <span className="text-xs font-medium" style={{ color: '#EF4444' }}>INVALID STATUS</span>
              ) : (
                <span className="text-xs font-medium" style={{ color: '#EF4444' }}>MISSING STATUS</span>
              )}
              {election?.finalized && (
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>Finalized</span>
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left focus:outline-none focus:ring-1 focus:ring-purple-500"
              style={{
                background: tab === item.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: tab === item.id ? '#A855F7' : '#71717A',
                border: tab === item.id ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}>
              {item.icon}
              <span
                style={{
                  opacity: sidebarCollapsed ? 0 : 1,
                  width: sidebarCollapsed ? 0 : 'auto',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  transition: 'opacity 200ms ease, width 200ms ease',
                }}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button onClick={() => { logout(); onClose(); }}
            title={sidebarCollapsed ? 'Logout' : undefined}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
            style={{ color: '#71717A' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
            onMouseLeave={e => (e.currentTarget.style.color = '#71717A')}
          >
            <LogOut size={15} />
            <span
              style={{
                opacity: sidebarCollapsed ? 0 : 1,
                width: sidebarCollapsed ? 0 : 'auto',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                transition: 'opacity 200ms ease, width 200ms ease',
              }}>
              Logout
            </span>
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'dashboard' && (
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Good morning, Election Committee
                </h1>
                <p className="text-sm" style={{ color: '#71717A' }}>
                  SMHS Election Command Center — {election?.name} {election?.year}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={loadData} className="p-2 rounded-xl transition-colors" style={{ background: 'rgba(255,255,255,0.05)', color: '#71717A' }} aria-label="Refresh">
                  <RefreshCw size={16} />
                </button>
                {/* Election controls */}
                {election?.status === 'UPCOMING' && (
                  <button onClick={() => handleStatusChange('LIVE')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <Play size={14} /> Start Election
                  </button>
                )}
                {election?.status === 'LIVE' && (
                  <>
                    <button onClick={() => handleStatusChange('PAUSED')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }}>
                      <Pause size={14} /> Pause
                    </button>
                    <button onClick={() => handleStatusChange('CLOSED')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                      <Square size={14} /> End Election
                    </button>
                  </>
                )}
                {election?.status === 'PAUSED' && (
                  <>
                    <button onClick={() => handleStatusChange('LIVE')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>
                      <Play size={14} /> Resume
                    </button>
                    <button onClick={() => handleStatusChange('CLOSED')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                      <Square size={14} /> End Election
                    </button>
                  </>
                )}
                {election?.status === 'CLOSED' && (
                  <>
                    <button onClick={openStartNewElection} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>
                      <Play size={14} /> Start New Election
                    </button>
                    <button onClick={() => handleStatusChange('RESULTS_PUBLISHED')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(34,211,238,0.15)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.25)' }}>
                      <TrendingUp size={14} /> Publish Results
                    </button>
                    {!election?.finalized && (
                      <button onClick={() => setShowFinalizeModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <Shield size={14} /> Finalize Election
                      </button>
                    )}
                  </>
                )}
                {election?.status === 'RESULTS_PUBLISHED' && (
                  <>
                    <button onClick={openStartNewElection} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>
                      <Play size={14} /> Start New Election
                    </button>
                    {!election?.finalized && (
                      <button onClick={() => setShowFinalizeModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <Shield size={14} /> Finalize Election
                      </button>
                    )}
                    {election?.finalized && (
                      <button
                        onClick={() => { if (!isCurrentArchived) setShowArchiveModal(true); }}
                        disabled={isCurrentArchived}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: isCurrentArchived ? 'rgba(255,255,255,0.04)' : 'rgba(168,85,247,0.15)',
                          color: isCurrentArchived ? '#52525B' : '#A855F7',
                          border: `1px solid ${isCurrentArchived ? 'rgba(255,255,255,0.06)' : 'rgba(168,85,247,0.25)'}`,
                          cursor: isCurrentArchived ? 'not-allowed' : 'pointer',
                          opacity: isCurrentArchived ? 0.6 : 1,
                        }}
                        title={isCurrentArchived ? 'This election has already been archived.' : 'Archive Election'}
                      >
                        <Archive size={14} />
                        {isCurrentArchived ? 'Already Archived' : 'Archive Election'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { label: 'Codes Generated', value: stats.totalCodes, icon: <Key size={20} />, color: '#7C3AED' },
                { label: 'Votes Cast', value: stats.totalVoted, icon: <Activity size={20} />, color: '#22C55E' },
                { label: 'Turnout', value: `${stats.turnoutPercent}%`, icon: <TrendingUp size={20} />, color: '#22D3EE', isString: true },
                { label: 'Remaining', value: stats.remaining, icon: <Clock size={20} />, color: '#FBBF24' },
              ].map(card => (
                <motion.div key={card.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl" style={{ background: `${card.color}20` }}>
                      <div style={{ color: card.color }}>{card.icon}</div>
                    </div>
                    <ChevronRight size={14} style={{ color: '#3f3f46' }} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 tabular-nums">
                    {card.isString ? card.value : <AnimatedCounter target={card.value as number} />}
                  </div>
                  <div className="text-sm" style={{ color: '#71717A' }}>{card.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Database Overview */}
            {dbOverview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ background: 'rgba(34,211,238,0.15)' }}>
                      <Database size={18} style={{ color: '#22D3EE' }} />
                    </div>
                    <h3 className="font-bold text-white">Database Overview</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: dbOverview.status === 'Connected' ? '#22C55E' : '#EF4444' }} />
                    <span className="text-xs font-medium" style={{ color: dbOverview.status === 'Connected' ? '#22C55E' : '#EF4444' }}>{dbOverview.status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  {[
                    { label: 'Storage Used', value: dbOverview.storageUsed, icon: <HardDrive size={14} />, color: '#7C3AED' },
                    { label: 'Votes', value: dbOverview.totalVotes, icon: <BarChart3 size={14} />, color: '#22C55E' },
                    { label: 'Voting Codes', value: dbOverview.totalVotingCodes, icon: <Key size={14} />, color: '#A855F7' },
                    { label: 'Candidates', value: dbOverview.totalCandidates, icon: <Users size={14} />, color: '#FBBF24' },
                    { label: 'Archived', value: dbOverview.totalArchivedElections, icon: <Archive size={14} />, color: '#22D3EE' },
                    { label: 'Security Logs', value: dbOverview.totalSecurityLogs, icon: <Shield size={14} />, color: '#EF4444' },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div style={{ color: item.color }}>{item.icon}</div>
                        <span className="text-xs" style={{ color: '#71717A' }}>{item.label}</span>
                      </div>
                      <div className="text-lg font-bold text-white tabular-nums">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-right" style={{ color: '#52525B' }}>
                  Last Updated: {new Date(dbOverview.lastUpdated).toLocaleString()}
                </div>
              </motion.div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Turnout bar chart */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-6">Class Turnout Overview</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={turnout} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                    <XAxis dataKey={d => `${d.class}${d.section}`} tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={50} interval={0} />
                    <YAxis tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: '#1F2330', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#FAFAFA', fontSize: 12 }}
                      formatter={(v, n, props) => [`${props.payload.voted}/${props.payload.total} (${v}%)`, 'Turnout']}
                      labelFormatter={l => `Class ${l}`}
                    />
                    <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
                      {turnout.map((entry, i) => (
                        <Cell key={i} fill={entry.percent >= 80 ? '#22C55E' : entry.percent >= 60 ? '#7C3AED' : '#FBBF24'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Attempt logs */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-white">Security Log</h3>
                  <button onClick={() => setTab('logs')} className="text-xs" style={{ color: '#7C3AED' }}>View all →</button>
                </div>
                {logs.length === 0 ? (
                  <div className="text-center py-8" style={{ color: '#52525B' }}>
                    <Shield size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No blocked attempts logged.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.slice(0, 6).map(log => (
                      <div key={log.id} className="flex items-center gap-3 py-2 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <AlertTriangle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>{log.reason}</span>
                          {log.code && <span className="text-xs ml-2 font-mono" style={{ color: '#71717A' }}>{log.code}</span>}
                        </div>
                        <span className="text-xs" style={{ color: '#52525B' }}>{new Date(log.time).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Last vote time */}
            {stats.lastVoteTime && (
              <div className="glass rounded-2xl p-4 flex items-center gap-3">
                <Clock size={15} style={{ color: '#71717A' }} />
                <span className="text-sm" style={{ color: '#71717A' }}>
                  Last vote recorded at <strong style={{ color: '#A1A1AA' }}>{new Date(stats.lastVoteTime).toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {tab === 'candidates' && <AdminCandidatesPage />}
        {tab === 'codes' && <AdminCodesPage />}
        {tab === 'export' && <AdminExportPage />}
        {tab === 'results' && <AdminResultsPage />}
        {tab === 'logs' && <AdminAttemptLogsPage />}
        {tab === 'archive' && <AdminArchivePage />}
        {tab === 'maintenance' && <AdminMaintenancePage mode={mode} onRestored={loadData} />}
        {tab === 'settings' && <AdminSettingsPage />}
      </main>

      {/* Live mode warning modal */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-elevated rounded-2xl p-8 max-w-md w-full mx-4">
            <AlertTriangle size={36} style={{ color: '#FBBF24', marginBottom: 16 }} />
            <h3 className="text-xl font-bold text-white mb-2">Switch to Live Mode?</h3>
            <p className="text-sm mb-6" style={{ color: '#A1A1AA' }}>
              You are about to switch to <strong style={{ color: '#22C55E' }}>LIVE election mode</strong>. All operations will affect real election data in Supabase.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowModeModal(false)} className="flex-1 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#A1A1AA' }}>
                Cancel
              </button>
              <button onClick={confirmLiveSwitch} className="flex-1 py-3 rounded-xl font-semibold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                Confirm & Switch to Live
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showNewElectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-3xl p-8 w-full max-w-md" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Start New Election</h2>
                <button onClick={() => setShowNewElectionModal(false)} style={{ color: '#71717A' }} aria-label="Close"><X size={18} /></button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>Election Name</label>
                  <input
                    value={newElectionName}
                    onChange={e => setNewElectionName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>Election Year</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={newElectionYear}
                    onChange={e => setNewElectionYear(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowNewElectionModal(false)} disabled={startingNewElection} className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#A1A1AA', opacity: startingNewElection ? 0.6 : 1 }}>
                  Cancel
                </button>
                <button
                  onClick={confirmStartNewElection}
                  disabled={startingNewElection || newElectionName.trim().length === 0 || !Number.isFinite(Number.parseInt(newElectionYear, 10))}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', opacity: startingNewElection ? 0.85 : 1 }}>
                  {startingNewElection ? <><Loader2 size={15} className="animate-spin" />Starting...</> : <><Play size={15} />Start Election</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showFinalizeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-3xl p-8 w-full max-w-md" role="dialog" aria-modal="true">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <AlertTriangle size={22} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Finalize Election</h2>
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>
                    This will permanently destroy the relationship between Voting Codes and Vote IDs.
                    Anonymous vote records will remain intact.
                  </p>
                  <p className="text-sm mt-2 font-semibold" style={{ color: '#EF4444' }}>
                    This action CANNOT be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowFinalizeModal(false)} disabled={finalizing} className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#A1A1AA', opacity: finalizing ? 0.6 : 1 }}>
                  Cancel
                </button>
                <button onClick={handleFinalizeElection} disabled={finalizing}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', opacity: finalizing ? 0.85 : 1 }}>
                  {finalizing ? <><Loader2 size={15} className="animate-spin" />Finalizing...</> : <><Shield size={15} />Finalize Election</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showArchiveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-3xl p-8 w-full max-w-md" role="dialog" aria-modal="true">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(168,85,247,0.15)' }}>
                  <Archive size={22} style={{ color: '#A855F7' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Archive Election</h2>
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>
                    This will archive the election results, statistics, and winning candidates. 
                    Voting codes and student identities will NOT be preserved.
                  </p>
                  <p className="text-sm mt-2 font-semibold" style={{ color: '#EF4444' }}>
                    This action CANNOT be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowArchiveModal(false)} disabled={archiving} className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#A1A1AA', opacity: archiving ? 0.6 : 1 }}>
                  Cancel
                </button>
                <button onClick={handleArchiveElection} disabled={archiving}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)', opacity: archiving ? 0.85 : 1 }}>
                  {archiving ? <><Loader2 size={15} className="animate-spin" />Archiving...</> : <><Archive size={15} />Archive Election</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
