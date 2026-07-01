import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Archive, Trophy, Loader2, Trash2, Download, FileText, FileSpreadsheet, FileJson, X,
  ArrowLeft, Calendar, Vote, Users, Crown, ChevronRight, AlertTriangle
} from 'lucide-react';
import { electionService } from '../../services/electionService';
import { exportArchivePDF, exportArchiveXLSX, exportArchiveJSON } from '../../services/exportService';
import { useRefresh } from '../../context/RefreshContext';
import type { ArchivedElection } from '../../types';
import { toast } from 'sonner';

type ViewMode = 'list' | 'detail';
type ExportFormat = 'pdf' | 'xlsx' | 'json';

export function AdminArchivePage() {
  const { revision } = useRefresh();
  const [archives, setArchives] = useState<ArchivedElection[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedArchive, setSelectedArchive] = useState<ArchivedElection | null>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await electionService.getArchivedElections();
      setArchives(data);
    } catch (e) {
      toast.error('Failed to load archives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [revision]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await electionService.deleteArchivedElection(id);
      toast.success('Archive deleted successfully.');
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast.error('Unable to complete the requested operation. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async (archive: ArchivedElection, format: ExportFormat) => {
    setExporting(format);
    try {
      switch (format) {
        case 'pdf': exportArchivePDF(archive); break;
        case 'xlsx': exportArchiveXLSX(archive); break;
        case 'json': exportArchiveJSON(archive); break;
      }
      toast.success('Export completed successfully.');
    } catch (e) {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const viewArchive = (archive: ArchivedElection) => {
    setSelectedArchive(archive);
    setViewMode('detail');
  };

  if (viewMode === 'detail' && selectedArchive) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#A1A1AA' }}
          >
            <ArrowLeft size={16} /> Back to Archives
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">{selectedArchive.name}</h1>
          <p className="text-sm" style={{ color: '#71717A' }}>
            Election Year {selectedArchive.year} — Archived on {new Date(selectedArchive.archivedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Votes', value: selectedArchive.totalVotes, color: '#7C3AED' },
            { label: 'Total Students', value: selectedArchive.totalStudents, color: '#22D3EE' },
            { label: 'Turnout', value: `${selectedArchive.turnoutPercent}%`, color: '#22C55E' },
            { label: 'Positions', value: selectedArchive.results.length, color: '#FBBF24' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-6">
              <div className="text-3xl font-bold mb-1 tabular-nums" style={{ color: s.color }}>{s.value}</div>
              <div className="text-sm" style={{ color: '#71717A' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-5 mb-8">
          {selectedArchive.results.map((roleResult, i) => (
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
                            {isWinner ? <Crown size={16} style={{ color: '#FBBF24' }} /> : <Users size={16} style={{ color: '#7C3AED' }} />}
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
                          <div className="h-full rounded-full" style={{ width: `${maxVotes > 0 ? (c.vote_count / maxVotes) * 100 : 0}%`, background: isWinner ? '#FBBF24' : '#7C3AED' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* House Results */}
        {selectedArchive.houseResults && selectedArchive.houseResults.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-8">
            <h3 className="text-base font-semibold text-white mb-4">House Results</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedArchive.houseResults.map(h => (
                <div key={`${h.class}-${h.section}`} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-sm font-bold text-white mb-1">Class {h.class}{h.section}</div>
                  <div className="text-xs" style={{ color: '#71717A' }}>{h.voted}/{h.total} voted</div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${h.percent}%`, background: h.percent >= 80 ? '#22C55E' : h.percent >= 60 ? '#7C3AED' : '#FBBF24' }} />
                  </div>
                  <div className="text-xs mt-1 font-semibold" style={{ color: h.percent >= 80 ? '#22C55E' : h.percent >= 60 ? '#7C3AED' : '#FBBF24' }}>{h.percent}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Election Archive</h1>
        <p className="text-sm" style={{ color: '#71717A' }}>
          {archives.length} archived election{archives.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin" style={{ color: '#7C3AED' }} />
        </div>
      ) : archives.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center">
          <Archive size={48} className="mx-auto mb-4 opacity-30" style={{ color: '#71717A' }} />
          <h2 className="text-xl font-bold text-white mb-2">No archived elections yet</h2>
          <p className="max-w-md mx-auto text-sm" style={{ color: '#71717A' }}>
            Archived elections will appear here after they have been finalized and archived.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {archives.map((archive, i) => (
            <motion.div
              key={archive.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">{archive.name}</h3>
                  <p className="text-xs mt-1" style={{ color: '#71717A' }}>
                    <Calendar size={12} className="inline mr-1" />
                    Election {archive.year} — Archived {new Date(archive.archivedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                  {archive.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-lg font-bold text-white">{archive.totalVotes}</div>
                  <div className="text-xs" style={{ color: '#71717A' }}><Vote size={10} className="inline mr-1" />Votes</div>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-lg font-bold text-white">{archive.turnoutPercent}%</div>
                  <div className="text-xs" style={{ color: '#71717A' }}>Turnout</div>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-lg font-bold text-white">{archive.results.length}</div>
                  <div className="text-xs" style={{ color: '#71717A' }}>Positions</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#52525B' }}>Winning Candidates</div>
                <div className="flex flex-wrap gap-2">
                  {archive.results.slice(0, 3).map(r => (
                    <span key={r.role} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.15)' }}>
                      <Crown size={10} className="inline mr-1" />
                      {r.winner?.name}
                    </span>
                  ))}
                  {archive.results.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ color: '#71717A' }}>+{archive.results.length - 3} more</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => viewArchive(archive)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  style={{ background: 'rgba(124,58,237,0.1)', color: '#A855F7', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  <ChevronRight size={14} /> View
                </button>
                <button
                  onClick={() => setConfirmDelete(archive.id)}
                  className="py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Export buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {([
                  { format: 'pdf' as ExportFormat, icon: <FileText size={12} />, label: 'PDF' },
                  { format: 'xlsx' as ExportFormat, icon: <FileSpreadsheet size={12} />, label: 'Excel' },
                  { format: 'json' as ExportFormat, icon: <FileJson size={12} />, label: 'JSON' },
                ]).map(exp => (
                  <button
                    key={exp.format}
                    onClick={() => handleExport(archive, exp.format)}
                    disabled={exporting !== null}
                    className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      color: '#A1A1AA',
                      border: '1px solid rgba(255,255,255,0.06)',
                      opacity: exporting !== null && exporting !== exp.format ? 0.5 : 1,
                      cursor: exporting !== null ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {exporting === exp.format ? <Loader2 size={12} className="animate-spin" /> : exp.icon}
                    {exporting === exp.format ? 'Exporting...' : exp.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-3xl p-8 w-full max-w-md" role="dialog" aria-modal="true">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <AlertTriangle size={22} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Delete Archive</h3>
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>
                    This will permanently delete this archived election from the database. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#A1A1AA', opacity: deleting ? 0.6 : 1 }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete)} disabled={deleting}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', opacity: deleting ? 0.85 : 1 }}>
                  {deleting ? <><Loader2 size={15} className="animate-spin" />Deleting...</> : <><Trash2 size={15} />Delete</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
