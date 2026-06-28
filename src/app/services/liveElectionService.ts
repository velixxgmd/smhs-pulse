import { SERVER_BASE } from '../lib/constants';
import { publicAnonKey } from '/utils/supabase/info';
import type {
  Candidate, VotingCode, AttemptLog, TurnoutData, Election,
  CodeValidationResult, VotePayload, VoteResult, ElectionResults,
  BatchConfig, ElectionStatus
} from '../types';
import {
  hasSessionVoted,
  markSessionAsVoted
} from './securityService';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
});

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(`${SERVER_BASE}${path}`, { ...opts, headers: { ...headers(), ...(opts?.headers || {}) } });
  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error');
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

export const LiveElectionService = {
  async validateCode(code: string): Promise<CodeValidationResult> {
    if (hasSessionVoted()) return { valid: false, error: 'Vote already submitted in this session.' };
    try {
      const data = await api(`/validate-code`, { method: 'POST', body: JSON.stringify({ code }) });
      return data;
    } catch (e) {
      return { valid: false, error: `Network error: ${e}` };
    }
  },

  async submitVote(payload: VotePayload): Promise<VoteResult> {
    try {
      const data = await api(`/submit-vote`, { method: 'POST', body: JSON.stringify(payload) });
      if (data.success) { markSessionAsVoted(); }
      return data;
    } catch (e) {
      return { success: false, error: `Network error: ${e}` };
    }
  },

  async getCandidates(role?: string): Promise<Candidate[]> {
    const params = role ? `?role=${encodeURIComponent(role)}` : '';
    return api(`/candidates${params}`);
  },

  async addCandidate(data: Omit<Candidate, 'id' | 'votes'>): Promise<Candidate> {
    return api(`/candidates`, { method: 'POST', body: JSON.stringify(data) });
  },

  async updateCandidate(id: string, data: Partial<Candidate>): Promise<void> {
    await api(`/candidates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async deleteCandidate(id: string): Promise<void> {
    await api(`/candidates/${id}`, { method: 'DELETE' });
  },

  async getResults(): Promise<ElectionResults> {
    return api(`/results`);
  },

  async logAttempt(data: Omit<AttemptLog, 'id'>): Promise<void> {
    await api(`/log-attempt`, { method: 'POST', body: JSON.stringify(data) }).catch(() => {});
  },

  async generateCodes(batch: BatchConfig): Promise<VotingCode[]> {
    return api(`/generate-codes`, { method: 'POST', body: JSON.stringify(batch) });
  },

  async lookupCode(cls: string, section: string, roll: number): Promise<VotingCode | null> {
    try {
      return await api(`/lookup-code?class=${cls}&section=${section}&roll=${roll}`);
    } catch { return null; }
  },

  async getTurnout(): Promise<TurnoutData[]> {
    return api(`/turnout`);
  },

  async getRecentAttempts(limit: number): Promise<AttemptLog[]> {
    return api(`/attempt-logs?limit=${limit}`);
  },

  async exportCodes(): Promise<VotingCode[]> {
    return api(`/codes`);
  },

  async getAllCodes(): Promise<VotingCode[]> {
    return api(`/codes`);
  },

  async getElection(): Promise<Election> {
    return api(`/election`);
  },

  async updateElectionStatus(
    status?: ElectionStatus,
    mode?: "demo" | "live"
): Promise<void> {

    await api(`/election/status`, {
        method: "PUT",
        body: JSON.stringify({
            status,
            mode
        })
    });

},

  async verifyAdminPassword(password: string): Promise<boolean> {
    try {
      const data = await api(`/admin/verify`, { method: 'POST', body: JSON.stringify({ password }) });
      return data.valid;
    } catch { return false; }
  },

  async changeAdminPassword(oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await api(`/admin/change-password`, { method: 'POST', body: JSON.stringify({ oldPass, newPass }) });
    } catch (e) { return { success: false, error: String(e) }; }
  },

  async verifyRecoveryCode(code: string): Promise<boolean> {
    try {
      const data = await api(`/admin/verify-recovery`, { method: 'POST', body: JSON.stringify({ code }) });
      return data.valid;
    } catch { return false; }
  },

  async resetPasswordWithRecovery(code: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await api(`/admin/reset-password`, { method: 'POST', body: JSON.stringify({ code, newPass }) });
    } catch (e) { return { success: false, error: String(e) }; }
  },

  async resetVotes(): Promise<void> {
    await api(`/admin/reset-votes`, { method: 'POST' });
  },

  async resetCodesOnly(): Promise<void> {
    await api(`/admin/reset-codes`, { method: 'POST' });
  },

  async clearAttemptLogs(): Promise<void> {
    await api(`/admin/clear-logs`, { method: 'POST' });
  },

  async fullReset(): Promise<void> {
    await api(`/admin/full-reset`, { method: 'POST' });
  },

  async restoreDemoData(): Promise<void> {},

  async getTotalStats() {
    return api(`/stats`);
  },
};
