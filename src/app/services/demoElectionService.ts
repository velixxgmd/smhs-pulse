import { STORAGE_KEYS, ADMIN_PASSWORD_DEFAULT } from '../lib/constants';
import { DEMO_CANDIDATES, generateDemoCodes, DEMO_ELECTION } from '../data/demoData';
import type {
  Candidate, VotingCode, AttemptLog, TurnoutData, Election,
  CodeValidationResult, VotePayload, VoteResult, ElectionResults,
  BatchConfig, ElectionStatus, VotingLayout, VoteIdLookupResult
} from '../types';
import {
  generateDeviceHash,
  logAttemptLocally,
  getLocalAttempts,
  clearLocalAttempts
} from "./securityService";

const DEMO_REVISION_KEY = 'smhs_demo_revision';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const p1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const p2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${p1}-${p2}`;
}

function generateVoteId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const votes = getVotes();
  const existingIds = new Set(votes.map(v => v.voteId || v.id));
  for (let attempt = 0; attempt < 1000; attempt++) {
    const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const voteId = `VOTE-${suffix}`;
    if (!existingIds.has(voteId)) return voteId;
  }
  throw new Error('Could not generate unique Vote ID');
}

function getRevision(): string {
  return localStorage.getItem(DEMO_REVISION_KEY) || '0';
}

function bumpRevision(): void {
  localStorage.setItem(DEMO_REVISION_KEY, Date.now().toString());
}

function getCodes(): VotingCode[] {
  const stored = localStorage.getItem(STORAGE_KEYS.DEMO_CODES);
  if (!stored) {
    const codes = generateDemoCodes();
    localStorage.setItem(STORAGE_KEYS.DEMO_CODES, JSON.stringify(codes));
    bumpRevision();
    return codes;
  }
  return JSON.parse(stored);
}

function saveCodes(codes: VotingCode[]): void {
    localStorage.setItem(
        STORAGE_KEYS.DEMO_CODES,
        JSON.stringify(codes)
    );
    bumpRevision();
}

function getCandidates(): Candidate[] {
  const stored = localStorage.getItem('smhs_demo_candidates');
  if (!stored) {
    localStorage.setItem('smhs_demo_candidates', JSON.stringify(DEMO_CANDIDATES));
    return DEMO_CANDIDATES;
  }
  return JSON.parse(stored);
}

function saveCandidates(candidates: Candidate[]): void {
  localStorage.setItem('smhs_demo_candidates', JSON.stringify(candidates));
  bumpRevision();
}

function getVotes(): Array<VotePayload & { id: string; voteId: string; voted_at: string }> {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMO_VOTES) || '[]');
}

function saveVotes(votes: Array<VotePayload & { id: string; voteId: string; voted_at: string }>): void {
  localStorage.setItem(STORAGE_KEYS.DEMO_VOTES, JSON.stringify(votes));
}

function getElection(): Election {
  const stored = localStorage.getItem(STORAGE_KEYS.DEMO_ELECTION);
  let election: Election;
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.DEMO_ELECTION, JSON.stringify(DEMO_ELECTION));
    election = DEMO_ELECTION;
  } else {
    election = JSON.parse(stored);
  }
  if (typeof election.finalized !== 'boolean') {
    election.finalized = false;
    localStorage.setItem(STORAGE_KEYS.DEMO_ELECTION, JSON.stringify(election));
  }
  return election;
}

function saveElection(e: Election): void {
  localStorage.setItem(STORAGE_KEYS.DEMO_ELECTION, JSON.stringify(e));
  bumpRevision();
}

function getAdminConfig() {
  const stored = localStorage.getItem(STORAGE_KEYS.DEMO_ADMIN);
  if (!stored) {
    const cfg = { password: ADMIN_PASSWORD_DEFAULT, recovery: 'SMHS-RECOVERY-2026' };
    localStorage.setItem(STORAGE_KEYS.DEMO_ADMIN, JSON.stringify(cfg));
    return cfg;
  }
  return JSON.parse(stored);
}

export const DemoElectionService = {
  async getRevision(): Promise<string> {
    return getRevision();
  },

  async validateCode(code: string): Promise<CodeValidationResult> {
      const codes = getCodes();
    await new Promise(r => setTimeout(r, 400));
    const found = codes.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!found) {
      logAttemptLocally({ code, time: new Date().toISOString(), reason: 'INVALID', device_hash: generateDeviceHash() });
      return { valid: false, error: 'Invalid voting code. Please check and try again.' };
    }
    if (found.status === 'used') {
      logAttemptLocally({ code, time: new Date().toISOString(), reason: 'USED_CODE', device_hash: generateDeviceHash() });
      return { valid: false, error: 'This code has already been used.' };
    }
    return { valid: true, code: found };
  },

  async submitVote(data: VotePayload): Promise<VoteResult> {
    await new Promise(r => setTimeout(r, 800));
    const codes = getCodes();
    const idx = codes.findIndex(c => c.code.toUpperCase() === data.code.toUpperCase());
    if (idx === -1 || codes[idx].status === 'used') {
      return { success: false, error: 'Code is invalid or already used.' };
    }
    codes[idx].status = 'used';
    codes[idx].used_at = new Date().toISOString();

    const candidates = getCandidates();
    Object.values(data.candidate_selections).forEach(candId => {
      const ci = candidates.findIndex(c => c.id === candId);
      if (ci !== -1) candidates[ci].votes++;
    });
    saveCandidates(candidates);

    const voteId = generateVoteId();
    const votes = getVotes();
    votes.push({ ...data, id: voteId, voteId, voted_at: new Date().toISOString() });
    saveVotes(votes);

    codes[idx].voteId = voteId;
    saveCodes(codes);
    return { success: true, voteId };
  },

  async getCandidates(role?: string): Promise<Candidate[]> {
    await new Promise(r => setTimeout(r, 200));
    const candidates = getCandidates();
    if (role) return candidates.filter(c => c.role === role).sort((a, b) => a.order_index - b.order_index);
    return candidates.sort((a, b) => a.order_index - b.order_index);
  },

  async addCandidate(data: Omit<Candidate, 'id' | 'votes'>): Promise<Candidate> {
    const candidates = getCandidates();
    const newCandidate: Candidate = { ...data, id: Math.random().toString(36).substring(2), votes: 0 };
    candidates.push(newCandidate);
    saveCandidates(candidates);
    return newCandidate;
  },

  async updateCandidate(id: string, data: Partial<Candidate>): Promise<void> {
    const candidates = getCandidates();
    const idx = candidates.findIndex(c => c.id === id);
    if (idx !== -1) {
      candidates[idx] = { ...candidates[idx], ...data };
      saveCandidates(candidates);
    }
  },

  async deleteCandidate(id: string): Promise<void> {
    const candidates = getCandidates().filter(c => c.id !== id);
    saveCandidates(candidates);
  },

  async getResults(): Promise<ElectionResults> {
    await new Promise(r => setTimeout(r, 300));
    const election = getElection();
    const candidates = getCandidates();
    const turnout = await this.getTurnout();
    const totalVoted = turnout.reduce((s, t) => s + t.voted, 0);
    const totalStudents = turnout.reduce((s, t) => s + t.total, 0);

    const roles = [...new Set(candidates.map(c => c.role))];
    const results = roles.map(role => {
      const roleCands = candidates.filter(c => c.role === role).sort((a, b) => b.votes - a.votes);
      return {
        role,
        winner: roleCands[0],
        candidates: roleCands.map(c => ({ ...c, vote_count: c.votes })),
      };
    });

    return {
      status: election.status,
      results,
      total_votes: totalVoted,
      total_students: totalStudents,
      turnout_percent: totalStudents > 0 ? Math.round((totalVoted / totalStudents) * 100) : 0,
    };
  },

  async logAttempt(data: Omit<import('../types').AttemptLog, 'id'>): Promise<void> {
    logAttemptLocally(data);
  },

  async generateCodes(batch: BatchConfig): Promise<VotingCode[]> {
    await new Promise(r => setTimeout(r, 600));
    const codes = getCodes();
    const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;
    const newCodes: VotingCode[] = [];
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let roll = 1; roll <= batch.max_roll; roll++) {
      const p1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const p2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      newCodes.push({
        id: Math.random().toString(36).substring(2),
        code: `${p1}-${p2}`,
        class: batch.class,
        section: batch.section,
        roll_number: roll,
        status: 'unused',
        generated_at: new Date().toISOString(),
        batch_id: batchId,
        generated_by: 'Admin',
      });
    }
    saveCodes([...codes, ...newCodes]);
    return newCodes;
  },

  async lookupCode(cls: string, section: string, roll: number): Promise<VotingCode | null> {
    const codes = getCodes();
    return codes.find(c => c.class === cls && c.section === section && c.roll_number === roll) || null;
  },

  async lookupVoteId(voteId: string): Promise<VoteIdLookupResult> {
    await new Promise(r => setTimeout(r, 400));
    const votes = getVotes();
    const vote = votes.find(v => v.voteId === voteId);
    if (!vote) return { found: false };
    const election = getElection();
    const isFinalized = election.finalized === true;
    let connectedCode: string | null = null;
    if (!isFinalized) {
      const codes = getCodes();
      const code = codes.find(c => c.voteId === voteId);
      if (code) connectedCode = code.code;
    }
    return {
      found: true,
      voteId: vote.voteId,
      status: 'Recorded Successfully',
      timestamp: vote.voted_at,
      connectedCode,
      finalized: isFinalized,
    };
  },

  async getTurnout(): Promise<TurnoutData[]> {
    await new Promise(r => setTimeout(r, 200));
    const codes = getCodes();

    const map = new Map<string, { voted: number; total: number }>();
    codes.forEach(c => {
      const key = `${c.class}-${c.section}`;
      const entry = map.get(key) || { voted: 0, total: 0 };
      entry.total++;
      if (c.status === 'used') entry.voted++;
      map.set(key, entry);
    });

    return Array.from(map.entries()).map(([key, val]) => {
      const [cls, sec] = key.split('-');
      return { class: cls, section: sec, voted: val.voted, total: val.total, percent: val.total > 0 ? Math.round((val.voted / val.total) * 100) : 0 };
    }).sort((a, b) => a.class.localeCompare(b.class) || a.section.localeCompare(b.section));
  },

  async getRecentAttempts(limit: number): Promise<AttemptLog[]> {
    return getLocalAttempts(limit);
  },

  async exportCodes(): Promise<VotingCode[]> {
    return getCodes();
  },

  async getAllCodes(): Promise<VotingCode[]> {
    return getCodes();
  },

  async getElection(): Promise<Election> {
    return getElection();
  },

  async updateElectionStatus(
  status?: ElectionStatus,
  mode?: "demo" | "live"
): Promise<void> {

  const election = getElection();

  if (status) {
    election.status = status;
  }

  if (mode) {
    election.mode = mode;
  }

  saveElection(election);
},

  async updateVotingLayout(layout: VotingLayout): Promise<void> {
    const election = getElection();
    election.voting_layout = layout;
    saveElection(election);
  },

  async startNewElection(patch: { name?: string; year?: number }): Promise<void> {
    const election = getElection();
    election.status = "LIVE";
    election.finalized = false;
    delete election.finalized_at;

    if (typeof patch.name === "string") {
      const nextName = patch.name.trim();
      if (nextName.length > 0) election.name = nextName;
    }

    if (typeof patch.year === "number" && Number.isFinite(patch.year)) {
      election.year = patch.year;
    }

    saveElection(election);
  },

  async verifyAdminPassword(password: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 300));
    const cfg = getAdminConfig();
    return cfg.password === password;
  },

  async changeAdminPassword(oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    const cfg = getAdminConfig();
    if (cfg.password !== oldPass) return { success: false, error: 'Current password is incorrect.' };
    cfg.password = newPass;
    localStorage.setItem(STORAGE_KEYS.DEMO_ADMIN, JSON.stringify(cfg));
    bumpRevision();
    return { success: true };
  },

  async verifyRecoveryCode(code: string): Promise<boolean> {
    const cfg = getAdminConfig();
    return cfg.recovery === code;
  },

  async resetPasswordWithRecovery(code: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    const valid = await this.verifyRecoveryCode(code);
    if (!valid) return { success: false, error: 'Invalid recovery code.' };
    const cfg = getAdminConfig();
    cfg.password = newPass;
    localStorage.setItem(STORAGE_KEYS.DEMO_ADMIN, JSON.stringify(cfg));
    bumpRevision();
    return { success: true };
  },

  async resetVotes(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.DEMO_VOTES);
    const candidates = getCandidates().map(c => ({ ...c, votes: 0 }));
    saveCandidates(candidates);
    const codes = getCodes().map(c => ({ ...c, status: 'unused' as const, used_at: undefined, voteId: undefined }));
    saveCodes(codes);
    localStorage.removeItem(STORAGE_KEYS.DEVICE_VOTES);
  },

  async resetCodesOnly(): Promise<void> {
    const codes = getCodes().map(c => ({ ...c, status: 'unused' as const, used_at: undefined, voteId: undefined }));
    saveCodes(codes);
  },

  async finalizeElection(): Promise<{ success: boolean; error?: string }> {
    const election = getElection();
    if (election.finalized) return { success: false, error: 'Election already finalized.' };
    const codes = getCodes().map(c => {
      if (c.voteId) {
        const { voteId: _, ...rest } = c;
        return rest as VotingCode;
      }
      return c;
    });
    saveCodes(codes);
    election.finalized = true;
    election.finalized_at = new Date().toISOString();
    saveElection(election);
    return { success: true };
  },

  async clearAttemptLogs(): Promise<void> {
    clearLocalAttempts();
  },

  async restoreDemoData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.DEMO_CODES);
    localStorage.removeItem(STORAGE_KEYS.DEMO_VOTES);
    localStorage.removeItem(STORAGE_KEYS.DEMO_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.DEVICE_VOTES);
    localStorage.removeItem("smhs_demo_candidates");
    localStorage.removeItem(STORAGE_KEYS.DEMO_ELECTION);
    sessionStorage.removeItem("vote_submitted");

    localStorage.setItem(
        STORAGE_KEYS.DEMO_ELECTION,
        JSON.stringify(DEMO_ELECTION)
    );

    saveCandidates(DEMO_CANDIDATES);
    saveCodes(generateDemoCodes());
},

  async getTotalStats() {
    const codes = getCodes();
    const turnout = await this.getTurnout();
    const totalVoted = codes.filter(c => c.status === 'used').length;
    const totalCodes = codes.length;
    const remaining = totalCodes - totalVoted;
    const lastUsed = codes.filter(c => c.used_at).sort((a, b) => new Date(b.used_at!).getTime() - new Date(a.used_at!).getTime())[0];
    return {
      totalCodes,
      totalVoted,
      remaining,
      turnoutPercent: totalCodes > 0 ? Math.round((totalVoted / totalCodes) * 100) : 0,
      lastVoteTime: lastUsed?.used_at,
    };
  },
};
