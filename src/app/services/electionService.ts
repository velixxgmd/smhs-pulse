import { STORAGE_KEYS } from '../lib/constants';
import { DemoElectionService } from './demoElectionService';
import { LiveElectionService } from './liveElectionService';
import type { ElectionMode } from '../types';

function getMode(): ElectionMode {
  return (localStorage.getItem(STORAGE_KEYS.MODE) as ElectionMode) || 'demo';
}

type ServiceType = typeof DemoElectionService;

function getService(): ServiceType {
  return getMode() === 'demo' ? DemoElectionService : (LiveElectionService as unknown as ServiceType);
}

export const electionService: ServiceType = new Proxy({} as ServiceType, {
  get(_target, prop: string) {
    const svc = getService();
    const fn = (svc as Record<string, unknown>)[prop];
    if (typeof fn === 'function') {
      return (...args: unknown[]) => fn.apply(svc, args);
    }
    return fn;
  },
});
