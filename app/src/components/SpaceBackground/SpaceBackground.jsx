import { useEffect, useRef } from 'react';

/**
 * SpaceBackground — Canvas animated Milky Way starfield.
 * Renders behind all content via position:fixed, z-index:0, pointer-events:none
 */
export default function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const size = { w: 0, h: 0 };

    const resize = () => {
      size.w = canvas.width  = window.innerWidth;
      size.h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // --- Star field ---
    const makeStars = (n, opts = {}) =>
      Array.from({ length: n }, () => ({
        x:       Math.random(),
        y:       Math.random(),
        r:       (opts.minR ?? 0.3) + Math.random() * (opts.maxR ?? 1.5),
        alpha:   (opts.minA ?? 0.3) + Math.random() * (opts.maxA ?? 0.6),
        phase:   Math.random() * Math.PI * 2,
        speed:   0.004 + Math.random() * 0.016,
        warm:    Math.random() > 0.78,            // slight warm tint for variety
      }));

    const stars  = makeStars(380, { minR: 0.2, maxR: 1.6, minA: 0.25, maxA: 0.65 });
    const giants = makeStars(14,  { minR: 1.8, maxR: 3.0, minA: 0.7,  maxA: 0.95 });

    // --- Nebula band (diagonal Milky Way) ---
    // Each cloud defined in normalised coords + semi-major axis rx/ry in normalised units
    const clouds = [
      // main band — left-bottom to right-top
      { x: 0.08, y: 0.78, rx: 0.38, ry: 0.10, angle: -0.48, c: [25, 12, 80],  a: 0.14 },
      { x: 0.30, y: 0.60, rx: 0.40, ry: 0.12, angle: -0.42, c: [45, 20, 110], a: 0.18 },
      { x: 0.50, y: 0.48, rx: 0.45, ry: 0.13, angle: -0.38, c: [55, 25, 100], a: 0.15 },
      { x: 0.70, y: 0.35, rx: 0.40, ry: 0.11, angle: -0.35, c: [40, 18, 90],  a: 0.13 },
      { x: 0.90, y: 0.22, rx: 0.30, ry: 0.10, angle: -0.32, c: [30, 12, 75],  a: 0.12 },
      // warm dusty core (brown/orange hue through the band centre)
      { x: 0.35, y: 0.55, rx: 0.20, ry: 0.07, angle: -0.42, c: [110, 45, 15], a: 0.07 },
      { x: 0.55, y: 0.44, rx: 0.18, ry: 0.07, angle: -0.38, c: [100, 38, 12], a: 0.06 },
      // large diffuse outer glow
      { x: 0.50, y: 0.50, rx: 0.70, ry: 0.25, angle: -0.40, c: [15, 6,  55],  a: 0.06 },
    ];

    let t = 0;

    const draw = () => {
      t += 0.016;
      const { w, h } = size;

      // Deep space base
      ctx.fillStyle = '#01000c';
      ctx.fillRect(0, 0, w, h);

      // Nebula clouds
      clouds.forEach(c => {
        ctx.save();
        ctx.translate(c.x * w, c.y * h);
        ctx.rotate(c.angle);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, c.rx * w);
        g.addColorStop(0,   `rgba(${c.c.join(',')},${c.a})`);
        g.addColorStop(0.5, `rgba(${c.c.join(',')},${c.a * 0.45})`);
        g.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, 0, c.rx * w, c.ry * h, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Small stars
      stars.forEach(s => {
        const tw    = Math.sin(t * s.speed * 60 + s.phase) * 0.28;
        const alpha = Math.max(0.05, s.alpha + tw);
        const x = s.x * w, y = s.y * h;
        const col = s.warm ? `rgba(240,230,210,${alpha})` : `rgba(210,215,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      });

      // Giant blue stars — with glow halo
      giants.forEach(s => {
        const tw    = Math.sin(t * s.speed * 60 + s.phase) * 0.2;
        const alpha = Math.max(0.5, s.alpha + tw);
        const x = s.x * w, y = s.y * h;

        // Halo
        const g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 6);
        g.addColorStop(0, `rgba(170,185,255,${alpha * 0.5})`);
        g.addColorStop(1, 'rgba(80,90,200,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, s.r * 6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,230,255,${alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
