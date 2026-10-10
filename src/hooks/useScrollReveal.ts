import { useEffect, useRef, useState, CSSProperties } from 'react';
import { getScrollDirection, initScrollDirectionListener, ScrollDirection } from './useScrollDirection';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const {
    threshold = 0.18,
    rootMargin = '0px 0px -40px 0px',
    triggerOnce = false, // Repeating animations in both directions
  } = options;

  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState<ScrollDirection>('down');

  useEffect(() => {
    initScrollDirectionListener();

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Element entered the viewport - capture active scroll direction
          const currentDir = getScrollDirection();
          setDirection(currentDir);
          setIsVisible(true);

          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else {
          // Element left the viewport - reset state so it replays upon re-entry
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible, direction };
}

/**
 * Helper to compute directional entrance CSS styles
 * Scrolling down: enters from below (+distance)
 * Scrolling up: enters from above (-distance)
 */
export function getDirectionalRevealStyle(
  isVisible: boolean,
  direction: ScrollDirection,
  delayMs = 0,
  distance = 28
): CSSProperties {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const effDistance = isMobile ? Math.min(distance, 16) : distance;
  const yOffset = direction === 'down' ? effDistance : -effDistance;

  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${yOffset}px, 0)`,
    transition: isVisible
      ? `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`
      : 'opacity 0.25s ease-out, transform 0.25s ease-out',
    willChange: 'opacity, transform',
  };
}
