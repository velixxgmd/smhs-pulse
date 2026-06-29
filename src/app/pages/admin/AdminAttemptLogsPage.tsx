import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { electionService } from '../../services/electionService';
import { useRefresh } from '../../context/RefreshContext';
import type { AttemptLog } from '../../types';

const REASON_COLORS: Record<string, string> = {
  USED_CODE: '#EF4444',
  DUPLICATE_DEVICE: '#FBBF24',
  INVALID: '#EF4444',
  SESSION_REPLAY: '#A855F7',
};

export function AdminAttemptLogsPage() {
  const { revision } = useRefresh();
  const [logs, setLogs] = useState<AttemptLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  const load = async () => {
    setLoading(true);
    try { setLogs(await electionService.getRecentAttempts(limit)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [limit, revision]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Security Logs</h1>
          <p className="text-sm" style={{ color: '#71717A' }}>All blocked voting attempts and security events.</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', color: '#71717A' }} aria-label="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {['Time', 'Reason', 'Code', 'Device Hash', 'Details'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#52525B' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: '#7C3AED' }} /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <Shield size={36} className="mx-auto mb-3 opacity-20" style={{ color: '#71717A' }} />
                  <p className="text-sm" style={{ color: '#52525B' }}>No security incidents logged. The election is running clean.</p>
                </td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-5 py-3 text-xs" style={{ color: '#71717A' }}>{new Date(log.time).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: REASON_COLORS[log.reason] || '#EF4444' }}>
                        <AlertTriangle size={11} />{log.reason}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: '#A855F7' }}>{log.code || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: '#52525B' }}>{log.device_hash?.substring(0, 12) || '—'}…</td>
                    <td className="px-5 py-3 text-xs" style={{ color: '#71717A' }}>{log.details ? JSON.stringify(log.details).substring(0, 50) : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {logs.length >= limit && (
          <div className="px-5 py-4 border-t flex justify-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button onClick={() => setLimit(l => l + 50)} className="text-sm" style={{ color: '#7C3AED' }}>Load more</button>
          </div>
        )}
      </div>
    </div>
  );
}
