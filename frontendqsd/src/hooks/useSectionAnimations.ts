import { useEffect } from 'react';

const getPrefersReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const useSectionAnimations = (key: string) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const prefersReducedMotion = getPrefersReducedMotion();
    const sections = Array.from(document.querySelectorAll('section')) as HTMLElement[];

    if (!sections.length) {
      return;
    }

    const applyVisibleImmediately = () => {
      sections.forEach(section => {
        section.classList.add('section-animated', 'section-visible');
      });
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      applyVisibleImmediately();
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            element.classList.add('section-visible');
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    sections.forEach(section => {
      section.classList.add('section-animated');
      section.classList.remove('section-visible');
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, [key]);
};
