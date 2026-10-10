import { useState, useEffect } from 'react';

export type ScrollDirection = 'down' | 'up';

let currentDirection: ScrollDirection = 'down';
let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
let initialized = false;
const listeners = new Set<(dir: ScrollDirection) => void>();

export function initScrollDirectionListener() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  lastScrollY = window.scrollY;

  let ticking = false;

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const diff = scrollY - lastScrollY;
          if (Math.abs(diff) >= 3) {
            const newDir: ScrollDirection = diff > 0 ? 'down' : 'up';
            if (newDir !== currentDirection) {
              currentDirection = newDir;
              listeners.forEach((fn) => fn(newDir));
            }
            lastScrollY = scrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
}

export function getScrollDirection(): ScrollDirection {
  return currentDirection;
}

export function useScrollDirection(): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>(currentDirection);

  useEffect(() => {
    initScrollDirectionListener();

    const handler = (newDir: ScrollDirection) => {
      setDirection(newDir);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return direction;
}
