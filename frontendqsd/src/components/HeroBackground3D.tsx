import React from 'react';

const LazyScene = React.lazy(() => import('./HeroBackground3DInner'));

const HeroBackground3D: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <React.Suspense fallback={null}>
      <LazyScene />
    </React.Suspense>
  );
};

export default HeroBackground3D;
