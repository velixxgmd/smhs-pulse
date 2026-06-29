import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ElectionMode, GraphicsQuality, DeviceMode } from '../types';
import { STORAGE_KEYS } from '../lib/constants';
import { electionService } from "../services/electionService";
import { setCurrentMode } from "../services/electionService";
import { SERVER_BASE } from "../lib/constants";

interface ModeContextValue {
  mode: ElectionMode;
  setMode: (mode: ElectionMode) => Promise<void>;
  graphicsQuality: GraphicsQuality;
  setGraphicsQuality: (q: GraphicsQuality) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (d: DeviceMode) => void;
  reducedMotion: boolean;
}

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ElectionMode>("demo");
  const [graphicsQuality, setGraphicsQualityState] = useState<GraphicsQuality>(() => {
    return (localStorage.getItem(STORAGE_KEYS.GRAPHICS_QUALITY) as GraphicsQuality) || 'balanced';
  });
  const [deviceMode, setDeviceModeState] = useState<DeviceMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICE_MODE) as DeviceMode;
    if (stored) return stored;
    return /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  });
  const [reducedMotion] = useState(() =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.GRAPHICS_QUALITY && e.newValue) {
        setGraphicsQualityState(e.newValue as GraphicsQuality);
      }
      if (e.key === STORAGE_KEYS.DEVICE_MODE && e.newValue) {
        setDeviceModeState(e.newValue as DeviceMode);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setMode = async (m: ElectionMode) => {

    setModeState(m);

    setCurrentMode(m);

    await electionService.updateElectionStatus(
        undefined,
        m
    );

};

  const setGraphicsQuality = (q: GraphicsQuality) => {
    setGraphicsQualityState(q);
    localStorage.setItem(STORAGE_KEYS.GRAPHICS_QUALITY, q);
  };

  const setDeviceMode = (d: DeviceMode) => {
    setDeviceModeState(d);
    localStorage.setItem(STORAGE_KEYS.DEVICE_MODE, d);
  };

useEffect(() => {

    const syncMode = async () => {

        try {

            const res = await fetch(
    `${SERVER_BASE}/election`
);

const election = await res.json();

            if (election.mode) {
               setModeState(election.mode);
               setCurrentMode(election.mode);
            }
        } catch (e) {
        }

    };

    syncMode();

    const interval = setInterval(syncMode, 3000);

    return () => clearInterval(interval);

}, []);

  return (
    <ModeContext.Provider value={{ mode, setMode, graphicsQuality, setGraphicsQuality, deviceMode, setDeviceMode, reducedMotion }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used inside ModeProvider');
  return ctx;
}
