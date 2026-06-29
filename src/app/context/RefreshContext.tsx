import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { electionService } from '../services/electionService';

type RefreshContextValue = {
  revision: string;
};

const RefreshContext = createContext<RefreshContextValue | null>(null);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [revision, setRevision] = useState('0');
  const lastSeenRef = useRef('0');

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const next = await electionService.getRevision();
        if (cancelled) return;
        if (typeof next === 'string' && next !== lastSeenRef.current) {
          lastSeenRef.current = next;
          setRevision(next);
        }
      } catch {
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const value = useMemo(() => ({ revision }), [revision]);

  return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>;
}

export function useRefresh() {
  const ctx = useContext(RefreshContext);
  if (!ctx) throw new Error('useRefresh must be used inside RefreshProvider');
  return ctx;
}
