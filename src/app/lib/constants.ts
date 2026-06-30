export const ADMIN_PASSWORD_DEFAULT = 'admin123';
export const STORAGE_KEYS = {
  MODE: 'smhs_mode',
  DEMO_VOTES: 'smhs_demo_votes',
  DEMO_ATTEMPTS: 'smhs_demo_attempts',
  DEMO_ADMIN: 'smhs_demo_admin',
  DEMO_CODES: 'smhs_demo_codes',
  DEMO_ELECTION: 'smhs_demo_election',
  DEVICE_VOTES: 'smhs_demo_device_votes',
  GRAPHICS_QUALITY: 'smhs_graphics_quality',
  DEVICE_MODE: 'smhs_device_mode',
} as const;

export const BRAND_COLORS = {
  bg: '#09090B',
  surface: '#111827',
  card: '#18181B',
  elevated: '#1F2330',
  border: 'rgba(255,255,255,0.08)',
  purple: '#7C3AED',
  violet: '#A855F7',
  cyan: '#22D3EE',
  green: '#22C55E',
  gold: '#FBBF24',
  red: '#EF4444',
  textMain: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
} as const;

export const PARTICLE_COLORS = [
  '#7C3AED',
  '#A855F7',
  '#22D3EE',
  '#FBBF24',
] as const;

export const ELECTION_ROLES = [
  'Head Boy',
  'Head Girl',
  'Deputy Head Boy',
  'Deputy Head Girl',
  'Sports Captain',
  'Deputy Sports Captain',
  'Cultural Secretary',
  'Deputy Cultural Secretary',
  'Discipline Secretary',
  'Deputy Discipline Secretary',
  'Literary Captain',
  'Deputy Literary Captain',
  'Pragathi House Captain',
  'Deputy Pragathi House Captain',
  'Sakthi House Captain',
  'Deputy Sakthi House Captain',
  'Shanthi House Captain',
  'Deputy Shanthi House Captain',
  'Jothi House Captain',
  'Deputy Jothi House Captain',
] as const;

export const ELIGIBILITY_RULES: Record<string, string> = {
  'Head Boy': 'Class 10 candidates only',
  'Head Girl': 'Class 10 candidates only',
  'Deputy Head Boy': 'Class 9 candidates only',
  'Deputy Head Girl': 'Class 9 candidates only',
  'Sports Captain': 'Class 10 candidates only',
  'Deputy Sports Captain': 'Class 9 candidates only',
  'Cultural Secretary': 'Class 10 candidates only',
  'Deputy Cultural Secretary': 'Class 9 candidates only',
  'Discipline Secretary': 'Class 10 candidates only',
  'Deputy Discipline Secretary': 'Class 9 candidates only',
  'Literary Captain': 'Class 10 candidates only',
  'Deputy Literary Captain': 'Class 9 candidates only',
  'Pragathi House Captain': 'Class 10 candidates only',
  'Deputy Pragathi House Captain': 'Class 9 candidates only',
  'Sakthi House Captain': 'Class 10 candidates only',
  'Deputy Sakthi House Captain': 'Class 9 candidates only',
  'Shanthi House Captain': 'Class 10 candidates only',
  'Deputy Shanthi House Captain': 'Class 9 candidates only',
  'Jothi House Captain': 'Class 10 candidates only',
  'Deputy Jothi House Captain': 'Class 9 candidates only',
};

export const SECTIONS = ['A', 'B', 'C', 'D', 'E'] as const;

export const HOUSES = [
  { name: 'Shakthi', color: '#EF4444', emoji: '🟥', altName: 'Sakthi' },
  { name: 'Shanthi', color: '#3B82F6', emoji: '🟦' },
  { name: 'Jothi', color: '#EAB308', emoji: '🟨' },
  { name: 'Pragathi', color: '#22C55E', emoji: '🟩' },
] as const;

export const SERVER_BASE = `https://emxxkvjhmdimmpdzxyez.supabase.co/functions/v1/make-server-c9775fa5`;
