import React, { ReactNode } from 'react';
import { ParticleCanvas } from '../background/ParticleCanvas';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div className={`relative min-h-screen overflow-x-hidden ${className}`}
      style={{ background: '#09090B' }}>
      {/* Glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            top: '-10%', left: '-5%',
            animation: 'glow-move-1 30s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)',
            bottom: '-5%', right: '5%',
            animation: 'glow-move-2 38s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)',
            top: '40%', right: '20%',
            animation: 'glow-move-3 25s ease-in-out infinite',
          }}
        />
      </div>
      <ParticleCanvas />
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
