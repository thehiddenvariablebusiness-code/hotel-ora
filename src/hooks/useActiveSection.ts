import { useState, useEffect } from 'react';

export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || 'home');

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollPosition = window.scrollY + 180; // Offset for navbar and visual center
        let current = sectionIds[0] || 'home';

        for (const id of sectionIds) {
          const element = document.getElementById(id);
          if (element) {
            const top = element.offsetTop;
            const height = element.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              current = id;
              break;
            }
          }
        }

        setActiveSection(current);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds]);

  return activeSection;
}
