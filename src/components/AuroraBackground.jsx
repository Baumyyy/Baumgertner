import { useEffect, useRef, useState } from 'react';
import './AuroraBackground.css';

const AuroraBackground = ({ children }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = ()  => { mouse.x = -9999;    mouse.y = -9999;    };
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    const isMobile   = window.innerWidth < 768;
    const COUNT      = isMobile ? 28 : 85;
    const LINK_DIST  = isMobile ? 110 : 160;
    const PUSH_DIST  = 130;
    const PUSH_FORCE = 0.55;

    const pts = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      r:  0.8 + Math.random() * 1.4,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pts.forEach((p) => {
        const dx   = p.x - mouse.x;
        const dy   = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < PUSH_DIST && dist > 0) {
          const f = ((PUSH_DIST - dist) / PUSH_DIST) * PUSH_FORCE;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }

        p.vx *= 0.992;
        p.vy *= 0.992;
        p.x  += p.vx;
        p.y  += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const glow = Math.max(0, 1 - dist / (PUSH_DIST * 1.5));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + glow * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${0.45 + glow * 0.45})`;
        ctx.fill();
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx   = pts[i].x - pts[j].x;
          const dy   = pts[i].y - pts[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DIST) continue;

          const alpha = (1 - dist / LINK_DIST) * 0.28;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize',     resize);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => setShowScrollTop(container.scrollTop > 400);
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="bg-layer" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <canvas ref={canvasRef} className="bg-canvas" />
      </div>
      <div className="aurora-container" ref={containerRef}>
        {children}
      </div>
      <button
        className={'scroll-top-btn' + (showScrollTop ? ' visible' : '')}
        onClick={() => containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <i className="fas fa-chevron-up"></i>
      </button>
    </>
  );
};

export default AuroraBackground;
