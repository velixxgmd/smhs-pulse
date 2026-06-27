import { STORAGE_KEYS } from '../lib/constants';
import type { AttemptLog } from '../types';

export function generateDeviceHash(): string {
  const data = [
    navigator.userAgent,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
  ].join('|');
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function hasDeviceVoted(): boolean {
  const deviceHash = generateDeviceHash();
  const voted = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEVICE_VOTES) || '[]') as string[];
  return voted.includes(deviceHash);
}

export function markDeviceAsVoted(): void {
  const deviceHash = generateDeviceHash();
  const voted = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEVICE_VOTES) || '[]') as string[];
  if (!voted.includes(deviceHash)) {
    voted.push(deviceHash);
    localStorage.setItem(STORAGE_KEYS.DEVICE_VOTES, JSON.stringify(voted));
  }
}

export function hasSessionVoted(): boolean {
  return sessionStorage.getItem('vote_submitted') === 'true';
}

export function markSessionAsVoted(): void {
  sessionStorage.setItem('vote_submitted', 'true');
}

export function logAttemptLocally(data: Omit<AttemptLog, 'id'>): void {
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMO_ATTEMPTS) || '[]') as AttemptLog[];
  logs.unshift({ ...data, id: Math.random().toString(36).substring(2) });
  if (logs.length > 500) logs.pop();
  localStorage.setItem(STORAGE_KEYS.DEMO_ATTEMPTS, JSON.stringify(logs));
}

export function getLocalAttempts(limit = 50): AttemptLog[] {
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMO_ATTEMPTS) || '[]') as AttemptLog[];
  return logs.slice(0, limit);
}

export function clearLocalAttempts(): void {
  localStorage.removeItem(STORAGE_KEYS.DEMO_ATTEMPTS);
}
