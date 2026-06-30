export type ElectionMode = 'demo' | 'live';

export type House = 'Shakthi' | 'Shanthi' | 'Jothi' | 'Pragathi';

export type ElectionStatus = 'UPCOMING' | 'LIVE' | 'PAUSED' | 'CLOSED' | 'ARCHIVED' | 'RESULTS_PUBLISHED';

export type VotingLayout = 'multi' | 'single';

export type CodeStatus = 'unused' | 'used';

export type AttemptReason = 'USED_CODE' | 'DUPLICATE_DEVICE' | 'INVALID' | 'SESSION_REPLAY';

export type ExportFormat = 'csv' | 'xlsx' | 'txt' | 'pdf';

export type GraphicsQuality = 'ultra' | 'high' | 'balanced' | 'performance' | 'minimal';

export type DeviceMode = 'desktop' | 'mobile';

export interface Candidate {
  id: string;
  name: string;
  class: string;
  section: string;
  role: string;
  photo_url?: string;
  manifesto?: string;
  votes: number;
  order_index: number;
  eligibility_notes?: string;
}

export interface VotingCode {
  id: string;
  code: string;
  class: string;
  section: string;
  roll_number: number;
  status: CodeStatus;
  used_at?: string;
  generated_at: string;
  batch_id: string;
  generated_by?: string;
}

export interface Vote {
  id: string;
  code_id: string;
  candidate_selections: Record<string, string>; // role -> candidateId
  voted_at: string;
  device_hash?: string;
  session_id?: string;
}

export interface AttemptLog {
  id: string;
  code?: string;
  time: string;
  reason: AttemptReason;
  device_hash?: string;
  ip_address?: string;
  details?: Record<string, unknown>;
}

export interface AdminConfig {
  id: number;
  password_hash: string;
  recovery_hash: string;
  last_changed?: string;
  election_status: ElectionStatus;
  system_mode: ElectionMode;
}

export interface Election {
  id: string;
  name: string;
  year: number;
  status: ElectionStatus;
  mode?: ElectionMode;
  voting_layout?: VotingLayout;
  created_at: string;
  ended_at?: string;
  total_votes?: number;
  turnout_percent?: number;
}

export interface BatchConfig {
  class: string;
  section: string;
  max_roll: number;
}

export interface TurnoutData {
  class: string;
  section: string;
  voted: number;
  total: number;
  percent: number;
}

export interface CodeValidationResult {
  valid: boolean;
  code?: VotingCode;
  error?: string;
}

export interface VotePayload {
  code: string;
  candidate_selections: Record<string, string>;
  device_hash: string;
  session_id: string;
}

export interface VoteResult {
  success: boolean;
  error?: string;
}

export interface ElectionResults {
  status: ElectionStatus;
  results: RoleResult[];
  total_votes: number;
  total_students: number;
  turnout_percent: number;
}

export interface RoleResult {
  role: string;
  winner: Candidate;
  candidates: Array<Candidate & { vote_count: number }>;
}
