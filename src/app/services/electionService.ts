import { DemoElectionService } from './demoElectionService';
import { LiveElectionService } from './liveElectionService';
import type { ElectionMode } from '../types';

let CURRENT_MODE: ElectionMode = "demo";

export function setCurrentMode(mode: ElectionMode) {
    CURRENT_MODE = mode;
}

function getMode() {
    return CURRENT_MODE;
}

type ServiceType = typeof DemoElectionService;

function getService(): ServiceType {
    return getMode() === "demo"
        ? DemoElectionService
        : (LiveElectionService as unknown as ServiceType);
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
