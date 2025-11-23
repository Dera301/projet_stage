import React from 'react';

const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!visible) return null;
  return (
    <button
      onClick={scrollTop}
      aria-label="Remonter en haut"
      className="fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center transition-colors"
    >
      ↑
    </button>
  );
};

export default ScrollToTopButton;


