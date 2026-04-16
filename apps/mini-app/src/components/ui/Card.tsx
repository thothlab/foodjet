import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: boolean;
}

export function Card({ children, className = '', onClick, padding = true }: CardProps) {
  const baseStyles = 'bg-tg-bg rounded-2xl shadow-sm border border-black/5';
  const clickableStyles = onClick ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150' : '';
  const paddingStyles = padding ? 'p-4' : '';

  return (
    <div
      className={`${baseStyles} ${clickableStyles} ${paddingStyles} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
