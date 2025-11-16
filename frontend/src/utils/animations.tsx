import React, { PropsWithChildren } from 'react';
import { motion, useInView } from 'framer-motion';

export const FadeInOnScroll: React.FC<PropsWithChildren<{ delay?: number }>> = ({ children, delay = 0 }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
};
