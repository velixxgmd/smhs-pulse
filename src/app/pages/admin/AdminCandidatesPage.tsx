import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, Loader2, User, AlertCircle } from 'lucide-react';
import { electionService } from '../../services/electionService';
import type { Candidate } from '../../types';
import { ELECTION_ROLES, ELIGIBILITY_RULES } from '../../lib/constants';

const emptyForm: Omit<Candidate, 'id' | 'votes'> = {
  name: '', class: '10', section: 'A', role: ELECTION_ROLES[0],
  photo_url: '', manifesto: '', order_index: 1, eligibility_notes: '',
};

export function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    try { setCandidates(await electionService.getCandidates()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setError(''); setShowForm(true); };
  const openEdit = (c: Candidate) => {
    setForm({ name: c.name, class: c.class, section: c.section, role: c.role, photo_url: c.photo_url || '', manifesto: c.manifesto || '', order_index: c.order_index, eligibility_notes: c.eligibility_notes || '' });
    setEditingId(c.id); setError(''); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      if (editingId) await electionService.updateCandidate(editingId, form);
      else await electionService.addCandidate(form);
      setShowForm(false); await load();
    } catch (e) { setError(`Save failed: ${e}`); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await electionService.deleteCandidate(id); await load(); }
    finally { setDeletingId(null); }
  };

  const roles = ['all', ...Array.from(new Set(ELECTION_ROLES))];
  const filtered = filterRole === 'all' ? candidates : candidates.filter(c => c.role === filterRole);
  const grouped = filtered.reduce((acc, c) => {
    if (!acc[c.role]) acc[c.role] = [];
    acc[c.role].push(c);
    return acc;
  }, {} as Record<string, Candidate[]>);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Candidate Management</h1>
          <p className="text-sm" style={{ color: '#71717A' }}>{candidates.length} candidates across {new Set(candidates.map(c => c.role)).size} positions</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
          <Plus size={16} /> Add Candidate
        </button>
      </div>

      {/* Role filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {roles.map(r => (
          <button key={r} onClick={() => setFilterRole(r)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filterRole === r ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
              color: filterRole === r ? '#A855F7' : '#71717A',
              border: `1px solid ${filterRole === r ? 'rgba(124,58,237,0.25)' : 'transparent'}`,
            }}>
            {r === 'all' ? 'All Positions' : r}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: '#7C3AED' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: '#52525B' }}>
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p>No candidates yet. Add your first candidate to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([role, roleCandidates]) => (
            <div key={role}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-white">{role}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.1)', color: '#A855F7', border: '1px solid rgba(124,58,237,0.2)' }}>
                  {ELIGIBILITY_RULES[role] || 'All classes'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {roleCandidates.sort((a, b) => a.order_index - b.order_index).map(c => (
                  <div key={c.id} className="glass rounded-2xl p-5 card-hover group">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(124,58,237,0.1)' }}>
                        {c.photo_url ? <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover rounded-xl" />
                          : <User size={20} style={{ color: '#7C3AED' }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{c.name}</h3>
                        <p className="text-xs" style={{ color: '#71717A' }}>Class {c.class}{c.section} · Order #{c.order_index}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#71717A' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#7C3AED')} onMouseLeave={e => (e.currentTarget.style.color = '#71717A')} aria-label="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="p-1.5 rounded-lg transition-colors" style={{ color: '#71717A' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')} onMouseLeave={e => (e.currentTarget.style.color = '#71717A')} aria-label="Delete">
                          {deletingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                    {c.manifesto && (
                      <p className="text-xs leading-relaxed" style={{ color: '#71717A' }}>
                        "{c.manifesto.length > 100 ? c.manifesto.slice(0, 100) + '…' : c.manifesto}"
                      </p>
                    )}
                    {c.eligibility_notes && (
                      <div className="mt-3 text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24' }}>
                        {c.eligibility_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-elevated rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Candidate' : 'Add Candidate'}</h2>
                <button onClick={() => setShowForm(false)} style={{ color: '#71717A' }} aria-label="Close"><X size={18} /></button>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'Student full name' },
                  { label: 'Photo URL', key: 'photo_url', placeholder: 'https://...' },
                  { label: 'Manifesto', key: 'manifesto', placeholder: 'Short campaign statement', multiline: true },
                  { label: 'Eligibility Notes', key: 'eligibility_notes', placeholder: 'Optional notes' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>{field.label}</label>
                    {field.multiline ? (
                      <textarea value={(form as Record<string, string>)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder} rows={3}
                        className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none resize-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    ) : (
                      <input type="text" value={(form as Record<string, string>)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    )}
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>Position</label>
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {ELECTION_ROLES.map(r => <option key={r} value={r} style={{ background: '#18181B' }}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>Class</label>
                    <select value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {['6','7','8','9','10'].map(c => <option key={c} value={c} style={{ background: '#18181B' }}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>Section</label>
                    <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {['A','B','C','D','E'].map(s => <option key={s} value={s} style={{ background: '#18181B' }}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>Order</label>
                    <input type="number" min={1} value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                </div>
              </div>

              {error && <div className="flex items-center gap-2 p-3 rounded-xl mt-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}><AlertCircle size={14} />{error}</div>}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#A1A1AA' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
                  {saving ? <><Loader2 size={15} className="animate-spin" />Saving...</> : <><Save size={15} />Save</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
