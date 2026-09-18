import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<"div"> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden',
          hoverable && 'active:scale-[0.98] transition-transform duration-200 cursor-pointer',
          className
        )}
        {...(props as any)}
      />
    );
  }
);

Card.displayName = 'Card';

export { Card };
