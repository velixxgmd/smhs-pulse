import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ElectionMode, GraphicsQuality, DeviceMode } from '../types';
import { STORAGE_KEYS } from '../lib/constants';

interface ModeContextValue {
  mode: ElectionMode;
  setMode: (mode: ElectionMode) => void;
  graphicsQuality: GraphicsQuality;
  setGraphicsQuality: (q: GraphicsQuality) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (d: DeviceMode) => void;
  reducedMotion: boolean;
}

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ElectionMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.MODE) as ElectionMode) || 'demo';
  });
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

  const setMode = (m: ElectionMode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEYS.MODE, m);
  };

  const setGraphicsQuality = (q: GraphicsQuality) => {
    setGraphicsQualityState(q);
    localStorage.setItem(STORAGE_KEYS.GRAPHICS_QUALITY, q);
  };

  const setDeviceMode = (d: DeviceMode) => {
    setDeviceModeState(d);
    localStorage.setItem(STORAGE_KEYS.DEVICE_MODE, d);
  };

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
