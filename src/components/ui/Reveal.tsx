import { motion, type HTMLMotionProps } from 'framer-motion';

type RevealProps = HTMLMotionProps<'div'> & { delay?: number; y?: number };

/** Fades + lifts its children into view the first time they scroll on screen. */
export function Reveal({ delay = 0, y = 24, children, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.8, 0.24, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
