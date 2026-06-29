import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Save, Loader2, CheckCircle2, AlertCircle, Monitor, Smartphone } from 'lucide-react';
import { electionService } from '../../services/electionService';
import { useMode } from '../../context/ModeContext';
import { useRefresh } from '../../context/RefreshContext';
import { toast } from 'sonner';
import type { GraphicsQuality, DeviceMode, VotingLayout } from '../../types';

export function AdminSettingsPage() {
  const { graphicsQuality, setGraphicsQuality, deviceMode, setDeviceMode } = useMode();
  const { revision } = useRefresh();
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passError, setPassError] = useState('');
  const [votingLayout, setVotingLayout] = useState<VotingLayout>('multi');

  useEffect(() => {
    (async () => {
      try {
        const e = await electionService.getElection();
        setVotingLayout(e.voting_layout === 'single' ? 'single' : 'multi');
      } catch {
      }
    })();
  }, [revision]);

  const handleChangePassword = async () => {
    if (!oldPass || !newPass) { setPassError('All fields are required.'); return; }
    if (newPass.length < 6) { setPassError('New password must be at least 6 characters.'); return; }
    if (newPass !== confirmPass) { setPassError('Passwords do not match.'); return; }
    setSaving(true); setPassError('');
    try {
      const result = await electionService.changeAdminPassword(oldPass, newPass);
      if (result.success) {
        toast.success('Password updated successfully.');
        setOldPass(''); setNewPass(''); setConfirmPass('');
      } else {
        setPassError(result.error || 'Password change failed.');
      }
    } catch { setPassError('Network error.'); }
    finally { setSaving(false); }
  };

  const qualityOptions: { value: GraphicsQuality; label: string; desc: string; color: string }[] = [
    { value: 'ultra', label: '🟢 Ultra', desc: 'Maximum particles, constellations, glows and effects.', color: '#22C55E' },
    { value: 'high', label: '🔵 High', desc: 'Slightly reduced effects while maintaining premium visuals.', color: '#22D3EE' },
    { value: 'balanced', label: '🟡 Balanced', desc: 'Balanced quality and performance. Recommended default.', color: '#FBBF24' },
    { value: 'performance', label: '🟠 Performance', desc: 'Reduced particles and simplified animations.', color: '#F97316' },
    { value: 'minimal', label: '⚫ Minimal', desc: 'Essential UI only with very lightweight animations.', color: '#71717A' },
  ];

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm" style={{ color: '#71717A' }}>Manage admin preferences and security settings.</p>
      </div>

      {/* Password change */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-5">Change Admin Password</h2>
        <div className="space-y-4">
          {[
            { label: 'Current Password', val: oldPass, set: setOldPass, show: showOld, toggle: () => setShowOld(v => !v) },
            { label: 'New Password', val: newPass, set: setNewPass, show: showNew, toggle: () => setShowNew(v => !v) },
            { label: 'Confirm New Password', val: confirmPass, set: setConfirmPass, show: showNew, toggle: () => {} },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717A' }}>{field.label}</label>
              <div className="relative">
                <input type={field.show ? 'text' : 'password'} value={field.val} onChange={e => { field.set(e.target.value); setPassError(''); }}
                  className="w-full px-4 py-3 rounded-xl text-white pr-11 focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                {i < 2 && (
                  <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#71717A' }}>
                    {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {passError && <div className="flex items-center gap-2 p-3 rounded-xl mt-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}><AlertCircle size={14} />{passError}</div>}
        <button onClick={handleChangePassword} disabled={saving} className="mt-5 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? <><Loader2 size={15} className="animate-spin" />Saving...</> : <><Save size={15} />Update Password</>}
        </button>
      </div>

      {/* Graphics quality */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-2">Graphics Quality</h2>
        <p className="text-sm mb-5" style={{ color: '#71717A' }}>Adjust visual effects performance. Remembered across sessions.</p>
        <div className="space-y-2">
          {qualityOptions.map(opt => (
            <button key={opt.value} onClick={() => setGraphicsQuality(opt.value)}
              className="w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all"
              style={{
                background: graphicsQuality === opt.value ? `${opt.color}10` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${graphicsQuality === opt.value ? `${opt.color}25` : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color: graphicsQuality === opt.value ? opt.color : '#A1A1AA' }}>{opt.label}</div>
                <div className="text-xs" style={{ color: '#52525B' }}>{opt.desc}</div>
              </div>
              {graphicsQuality === opt.value && <CheckCircle2 size={16} style={{ color: opt.color }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Device mode */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-2">Device Mode</h2>
        <p className="text-sm mb-5" style={{ color: '#71717A' }}>Switch between full desktop experience and mobile-optimized performance mode.</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'desktop' as DeviceMode, label: 'Desktop Mode', icon: <Monitor size={18} />, desc: 'Full effects and premium experience' },
            { value: 'mobile' as DeviceMode, label: 'Mobile Performance', icon: <Smartphone size={18} />, desc: 'Reduced effects for smoother performance' },
          ]).map(opt => (
            <button key={opt.value} onClick={() => setDeviceMode(opt.value)}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background: deviceMode === opt.value ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${deviceMode === opt.value ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div style={{ color: deviceMode === opt.value ? '#A855F7' : '#71717A' }} className="mb-2">{opt.icon}</div>
              <div className="text-sm font-semibold" style={{ color: deviceMode === opt.value ? '#A855F7' : '#A1A1AA' }}>{opt.label}</div>
              <div className="text-xs mt-0.5" style={{ color: '#52525B' }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Voting layout */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="text-base font-semibold text-white mb-2">Voting Layout</h2>
        <p className="text-sm mb-5" style={{ color: '#71717A' }}>Choose how the ballot is displayed to voters. Updates automatically across open tabs.</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'multi' as VotingLayout, label: 'Multi Step', desc: 'Current ballot experience (recommended)' },
            { value: 'single' as VotingLayout, label: 'Single Page', desc: 'All positions displayed on one page' },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={async () => {
                setVotingLayout(opt.value);
                try {
                  await electionService.updateVotingLayout(opt.value);
                  toast.success('Voting layout updated.');
                } catch (e) {
                  toast.error(`Update failed: ${e}`);
                }
              }}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background: votingLayout === opt.value ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${votingLayout === opt.value ? 'rgba(34,211,238,0.25)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div className="text-sm font-semibold" style={{ color: votingLayout === opt.value ? '#22D3EE' : '#A1A1AA' }}>{opt.label}</div>
              <div className="text-xs mt-0.5" style={{ color: '#52525B' }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
