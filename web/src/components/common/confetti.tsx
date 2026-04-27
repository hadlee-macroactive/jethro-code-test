'use client';

import { useEffect, useRef } from 'react';

interface ConfettiProps {
  count?: number;
  duration?: number;
}

export function Confetti({ count = 50, duration = 3000 }: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = ['#FF6B35', '#F39C12', '#3498DB', '#2ECC71', '#9B59B6', '#E74C3C'];

    Array.from({ length: count }, () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 rounded-full';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = '50%';
      particle.style.top = '0';
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;

      const angle = Math.random() * Math.PI;
      const velocity = 5 + Math.random() * 10;
      const tx = Math.cos(angle) * velocity * 50;
      const ty = Math.sin(angle) * velocity * 50 + Math.random() * 100;

      particle.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      container.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random() * 720}deg)`;
        particle.style.opacity = '0';
      });

      setTimeout(() => {
        particle.remove();
      }, duration);
    });

    return () => {
      container.innerHTML = '';
    };
  }, [count, duration]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />;
}
