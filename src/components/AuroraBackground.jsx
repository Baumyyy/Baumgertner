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

    const nodes = [
      { x: 0.15, y: 0.2, vx: 0.0002, vy: 0.00015, radius: 0.35, color: [0, 255, 136] },
      { x: 0.85, y: 0.3, vx: -0.00015, vy: 0.0002, radius: 0.3, color: [0, 180, 120] },
      { x: 0.5, y: 0.75, vx: 0.00015, vy: -0.00015, radius: 0.25, color: [0, 100, 80] },
      { x: 0.3, y: 0.5, vx: -0.0002, vy: -0.0001, radius: 0.2, color: [0, 200, 100] },
    ];

    const animate = () => {
      time += 0.004;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node) => {
        node.x += node.vx + Math.sin(time * 0.4 + node.y * 4) * 0.00008;
        node.y += node.vy + Math.cos(time * 0.3 + node.x * 4) * 0.00008;

        if (node.x < -0.1 || node.x > 1.1) node.vx *= -1;
        if (node.y < -0.1 || node.y > 1.1) node.vy *= -1;

        const x = node.x * canvas.width;
        const y = node.y * canvas.height;
        const r = node.radius * canvas.width;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        const [cr, cg, cb] = node.color;
        gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.04)`);
        gradient.addColorStop(0.4, `rgba(${cr}, ${cg}, ${cb}, 0.015)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      if (Math.random() > 0.97) {
        for (let i = 0; i < 2; i++) {
          const nx = Math.random() * canvas.width;
          const ny = Math.random() * canvas.height;
          ctx.fillStyle = `rgba(0, 255, 136, ${Math.random() * 0.02})`;
          ctx.fillRect(nx, ny, 1, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    ctx.fillStyle = '#000000';
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
      <div className="bg-vignette"></div>
      <div className="bg-noise"></div>
      <div className="accent-line accent-line-1"></div>
      <div className="aurora-container">
        {children}
      </div>
    </div>
  );
};

export default AuroraBackground;