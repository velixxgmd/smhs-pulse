import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, EyeOff, X, Loader2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { electionService } from '../../services/electionService';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onClose: () => void;
  onAuthenticated: () => void;
}

type FlowState = 'login' | 'forgot' | 'recovery-verify' | 'new-password' | 'success';

export function AdminLoginPage({ onClose, onAuthenticated }: Props) {
  const { setAdminAuthenticated } = useAuth();
  const [flow, setFlow] = useState<FlowState>('login');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async () => {
    if (!password) { setError('Please enter the admin password.'); return; }
    setLoading(true); setError('');
    try {
      const ok = await electionService.verifyAdminPassword(password);
      if (ok) {
        setAdminAuthenticated(true);
        onAuthenticated();
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleRecoveryVerify = async () => {
    if (!recoveryCode) { setError('Please enter your recovery code.'); return; }
    setLoading(true); setError('');
    try {
      const ok = await electionService.verifyRecoveryCode(recoveryCode);
      if (ok) { setFlow('new-password'); setError(''); }
      else setError('Invalid recovery code. Please try again.');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const result = await electionService.resetPasswordWithRecovery(recoveryCode, newPassword);
      if (result.success) setFlow('success');
      else setError(result.error || 'Reset failed.');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="glass-elevated rounded-3xl p-8 w-full max-w-md relative"
        style={{ boxShadow: '0 0 60px rgba(124,58,237,0.2)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Admin login"
      >
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-lg transition-colors" style={{ color: '#71717A' }} aria-label="Close">
          <X size={18} />
        </button>

        <AnimatePresence mode="wait">
          {flow === 'login' && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <Lock size={22} style={{ color: '#7C3AED' }} />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Admin Access</h2>
                <p className="text-sm" style={{ color: '#71717A' }}>SMHS Election Command Center</p>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#71717A' }}>Admin Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-3 rounded-xl text-white pr-11 focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${error ? '#EF4444' : 'rgba(255,255,255,0.1)'}`,
                    }}
                    placeholder="Enter password"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#71717A' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
                  <AlertCircle size={14} />{error}
                </div>
              )}

              <button onClick={handleLogin} disabled={loading} className="w-full py-3.5 rounded-xl font-semibold text-white mb-4 flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', boxShadow: '0 0 20px rgba(124,58,237,0.3)', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : 'Sign In'}
              </button>

              <button onClick={() => { setFlow('forgot'); setError(''); }} className="w-full text-center text-sm transition-colors" style={{ color: '#71717A' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#A1A1AA')} onMouseLeave={e => (e.currentTarget.style.color = '#71717A')}>
                Forgot password?
              </button>
            </motion.div>
          )}

          {flow === 'forgot' && (
            <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={() => setFlow('login')} className="flex items-center gap-1 text-sm mb-6" style={{ color: '#71717A' }}>
                <ArrowLeft size={14} /> Back
              </button>
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-white mb-1">Recovery Code</h2>
                <p className="text-sm" style={{ color: '#71717A' }}>Enter the recovery code shown during setup.</p>
                <p className="text-xs mt-2 px-2 py-1 rounded-lg inline-block" style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
                  Demo recovery code: SMHS-RECOVERY-2026
                </p>
              </div>
              <input type="text" value={recoveryCode} onChange={e => { setRecoveryCode(e.target.value.toUpperCase()); setError(''); }}
                className="w-full px-4 py-3 rounded-xl text-white focus:outline-none mb-4 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace' }}
                placeholder="XXXX-XXXX-XXXX" autoFocus />
              {error && <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}><AlertCircle size={14} />{error}</div>}
              <button onClick={handleRecoveryVerify} disabled={loading} className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" />Verifying...</> : 'Verify Recovery Code'}
              </button>
            </motion.div>
          )}

          {flow === 'new-password' && (
            <motion.div key="new-password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-white mb-1">Set New Password</h2>
                <p className="text-sm" style={{ color: '#71717A' }}>Create a strong new admin password.</p>
              </div>
              <div className="space-y-3 mb-4">
                <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(''); }} placeholder="New password" className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              {error && <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}><AlertCircle size={14} />{error}</div>}
              <button onClick={handleResetPassword} disabled={loading} className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" />Saving...</> : 'Save New Password'}
              </button>
            </motion.div>
          )}

          {flow === 'success' && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
              <ShieldCheck size={48} style={{ color: '#22C55E', margin: '0 auto 16px' }} />
              <h2 className="text-xl font-bold text-white mb-2">Password Updated</h2>
              <p className="text-sm mb-6" style={{ color: '#71717A' }}>Your admin password has been reset successfully.</p>
              <button onClick={() => setFlow('login')} className="px-8 py-3 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
                Sign In
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
