"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Fades and slides its children in once they scroll into view.
 * With reduced motion on, the content simply renders in place.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 0.55,
  y = 18,
  once = true,
  amount = 0.2,
  ...props
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration: reduce ? 0 : duration,
        delay: reduce ? 0 : delay,
        ease: EASE,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Parent for a group of <StaggerItem>s. The children appear one after another
 * when the group scrolls into view.
 */
export function Stagger({
  children,
  className = "",
  stagger = 0.08,
  delay = 0,
  once = true,
  amount = 0.15,
  ...props
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduce ? 0 : stagger,
            delayChildren: reduce ? 0 : delay,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** One child of <Stagger>. It takes its timing from the parent. */
export function StaggerItem({
  children,
  className = "",
  y = 18,
  duration = 0.5,
  ...props
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: EASE },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
