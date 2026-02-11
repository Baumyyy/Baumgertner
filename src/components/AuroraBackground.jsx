import React, { useEffect, useRef } from 'react';
import './AuroraBackground.css';

const AuroraBackground = ({ children }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Mesh gradient nodes
    const nodes = [
      { x: 0.1, y: 0.2, vx: 0.0003, vy: 0.0002, radius: 0.4, color: [0, 255, 136] },
      { x: 0.8, y: 0.3, vx: -0.0002, vy: 0.0003, radius: 0.35, color: [0, 100, 255] },
      { x: 0.5, y: 0.8, vx: 0.0002, vy: -0.0002, radius: 0.3, color: [100, 0, 255] },
      { x: 0.3, y: 0.6, vx: -0.0003, vy: -0.0001, radius: 0.25, color: [0, 200, 180] },
    ];

    const animate = () => {
      time += 0.005;
      ctx.fillStyle = 'rgba(5, 8, 18, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node) => {
        // Organic movement
        node.x += node.vx + Math.sin(time * 0.5 + node.y * 5) * 0.0001;
        node.y += node.vy + Math.cos(time * 0.3 + node.x * 5) * 0.0001;

        // Bounce
        if (node.x < -0.1 || node.x > 1.1) node.vx *= -1;
        if (node.y < -0.1 || node.y > 1.1) node.vy *= -1;

        // Draw gradient orb
        const x = node.x * canvas.width;
        const y = node.y * canvas.height;
        const r = node.radius * canvas.width;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        const [cr, cg, cb] = node.color;
        gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.08)`);
        gradient.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, 0.03)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Subtle noise texture
      if (Math.random() > 0.97) {
        for (let i = 0; i < 3; i++) {
          const nx = Math.random() * canvas.width;
          const ny = Math.random() * canvas.height;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.03})`;
          ctx.fillRect(nx, ny, 1, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    // Initial fill
    ctx.fillStyle = '#050812';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="bg-container" ref={containerRef}>
      <canvas ref={canvasRef} className="bg-canvas" />
      
      {/* Grid overlay */}
      <div className="bg-grid"></div>
      
      {/* Radial vignette */}
      <div className="bg-vignette"></div>
      
      {/* Noise texture */}
      <div className="bg-noise"></div>

      {/* Horizontal accent lines */}
      <div className="accent-line accent-line-1"></div>
      <div className="accent-line accent-line-2"></div>

      {/* Content */}
      <div className="aurora-container" ref={(el) => {
        if (el && containerRef.current) {
          containerRef.current._scrollEl = el;
        }
      }}>
        {children}
      </div>
    </div>
  );
};

export default AuroraBackground;