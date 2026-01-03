import React, { useEffect, useRef } from 'react';
import { Palette } from '../types';

interface BackgroundProps {
  palette: Palette;
  isHovered?: boolean;
  particleColor?: string;
}

const Background: React.FC<BackgroundProps> = ({ palette, isHovered = false, particleColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHoveredRef = useRef(isHovered);
  const speedMultiplier = useRef(1);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      baseSize: number;
      speedX: number;
      speedY: number;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseSize = Math.random() * 2 + 0.5;
        this.size = this.baseSize;
        this.speedX = (Math.random() * 0.3 - 0.15);
        this.speedY = (Math.random() * 0.3 - 0.15);
      }

      update(width: number, height: number, multiplier: number) {
        this.x += this.speedX * multiplier;
        this.y += this.speedY * multiplier;

        const targetSize = multiplier > 1.5 ? this.baseSize * 1.5 : this.baseSize;
        this.size += (targetSize - this.size) * 0.05;

        if (this.x > width) this.x = 0;
        else if (this.x < 0) this.x = width;

        if (this.y > height) this.y = 0;
        else if (this.y < 0) this.y = height;
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = particleColor || palette.particle;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
      }
    }

    const init = () => {
      particles = [];
      // Adjust density based on screen size
      const area = canvas.width * canvas.height;
      const particleCount = Math.floor(area / 15000);
      for (let i = 0; i < Math.min(particleCount, 120); i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const targetMultiplier = isHoveredRef.current ? 4.5 : 1.0;
      speedMultiplier.current += (targetMultiplier - speedMultiplier.current) * 0.03;

      particles.forEach(p => {
        p.update(canvas.width, canvas.height, speedMultiplier.current);
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      // Support for High DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      
      // Pass the visible CSS dimensions for particle boundaries
      init();
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [palette, particleColor]);

  return (
    <>
      <div 
        className="fixed inset-0 z-[-2] transition-all duration-[2000ms] ease-in-out"
        style={{ background: palette.gradient, backgroundSize: '200% 200%', animation: 'gradientMove 20s ease infinite' }}
      />
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-[-1] transition-opacity duration-1000"
      />
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
};

export default Background;