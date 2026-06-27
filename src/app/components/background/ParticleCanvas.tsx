import React, { useEffect, useRef } from 'react';
import { PARTICLE_COLORS } from '../../lib/constants';
import { useMode } from '../../context/ModeContext';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  opacity: number;
  layer: number; // 0 = bg, 1 = fg
  connections: number;
}

interface Shape {
  x: number; y: number;
  vx: number; vy: number;
  sides: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  opacity: number;
}

function getParticleCount(quality: string, isMobile: boolean) {
  const base = isMobile ? 40 : 80;
  const multipliers: Record<string, number> = { ultra: 1.5, high: 1.2, balanced: 1, performance: 0.6, minimal: 0.3 };
  return Math.floor(base * (multipliers[quality] ?? 1));
}

function getShapeCount(quality: string, isMobile: boolean) {
  if (quality === 'minimal') return 0;
  const base = isMobile ? 4 : 10;
  const multipliers: Record<string, number> = { ultra: 1.5, high: 1.2, balanced: 1, performance: 0.5, minimal: 0 };
  return Math.floor(base * (multipliers[quality] ?? 1));
}

function drawPolygon(ctx: CanvasRenderingContext2D, x: number, y: number, sides: number, size: number, rotation: number): void {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (i * 2 * Math.PI) / sides;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function mixColors(c1: string, c2: string, t: number): string {
  const parse = (hex: string) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const [r1, g1, b1] = parse(c1);
  const [r2, g2, b2] = parse(c2);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { graphicsQuality, deviceMode, reducedMotion } = useMode();
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (reducedMotion && graphicsQuality === 'minimal') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = deviceMode === 'mobile';
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const particleCount = getParticleCount(graphicsQuality, isMobile);
    const shapeCount = getShapeCount(graphicsQuality, isMobile);
    const proximity = graphicsQuality === 'minimal' ? 80 : graphicsQuality === 'performance' ? 100 : 150;
    const maxConnections = graphicsQuality === 'minimal' ? 1 : 3;
    const showShapes = graphicsQuality !== 'minimal';

    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const layer = Math.random() > 0.4 ? 0 : 1;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * (layer === 1 ? 0.6 : 0.3),
        vy: (Math.random() - 0.5) * (layer === 1 ? 0.6 : 0.3),
        size: layer === 1 ? 1.5 + Math.random() * 2 : 0.8 + Math.random() * 1.2,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        opacity: layer === 1 ? 0.5 + Math.random() * 0.4 : 0.2 + Math.random() * 0.3,
        layer,
        connections: 0,
      };
    });

    const shapes: Shape[] = showShapes ? Array.from({ length: shapeCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      sides: Math.floor(Math.random() * 6) + 3,
      size: 15 + Math.random() * 50,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.004,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      opacity: 0.04 + Math.random() * 0.08,
    })) : [];

    let lastTime = 0;

    function animate(timestamp: number) {
      const dt = Math.min(timestamp - lastTime, 50);
      lastTime = timestamp;
      ctx!.clearRect(0, 0, W, H);

      // Shapes
      shapes.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.rotSpeed;
        if (s.x < -s.size) s.x = W + s.size;
        if (s.x > W + s.size) s.x = -s.size;
        if (s.y < -s.size) s.y = H + s.size;
        if (s.y > H + s.size) s.y = -s.size;

        ctx!.save();
        drawPolygon(ctx!, s.x, s.y, s.sides, s.size, s.rotation);
        ctx!.fillStyle = s.color;
        ctx!.globalAlpha = s.opacity;
        ctx!.fill();
        ctx!.restore();
      });

      // Reset connection counters
      particles.forEach(p => p.connections = 0);

      // Constellation lines
      if (graphicsQuality !== 'minimal') {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            if (particles[i].connections >= maxConnections || particles[j].connections >= maxConnections) continue;
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < proximity) {
              const alpha = (1 - dist / proximity) * 0.15;
              const blended = mixColors(particles[i].color, particles[j].color, 0.4);
              ctx!.beginPath();
              ctx!.moveTo(particles[i].x, particles[i].y);
              ctx!.lineTo(particles[j].x, particles[j].y);
              ctx!.strokeStyle = blended;
              ctx!.globalAlpha = alpha;
              ctx!.lineWidth = 1.5 + (1 - dist / proximity);
              ctx!.stroke();
              ctx!.globalAlpha = 1;
              particles[i].connections++;
              particles[j].connections++;
            }
          }
        }
      }

      // Particles
      particles.forEach(p => {
        p.x += p.vx + Math.sin(timestamp * 0.0003 + p.y * 0.01) * 0.1;
        p.y += p.vy + Math.cos(timestamp * 0.0002 + p.x * 0.01) * 0.1;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = p.opacity;
        if (graphicsQuality !== 'performance' && graphicsQuality !== 'minimal') {
          ctx!.shadowBlur = 10 + p.size * 3;
          ctx!.shadowColor = p.color;
        }
        ctx!.fill();
        ctx!.shadowBlur = 0;
        ctx!.globalAlpha = 1;
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    const handleVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animRef.current);
      else animRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [graphicsQuality, deviceMode, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
