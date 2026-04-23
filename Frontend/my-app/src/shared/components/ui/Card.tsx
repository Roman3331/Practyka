import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
}

export const Card = ({
  children,
  blur = 'md',
  hoverable = false,
  className = '',
  ...props
}: CardProps) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-3xl',
  };

  return (
    <motion.div
      className={`
        glass-card rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden
        ${blurClasses[blur]}
        ${hoverable ? 'hover:border-indigo-500/30 hover:shadow-indigo-500/10 cursor-pointer transition-all duration-500' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};
