
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, footer, className }) => {
  return (
    <div className={`bg-slate-800 shadow-2xl rounded-xl overflow-hidden ${className}`}>
      {title && (
        <header className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-sky-400">{title}</h2>
        </header>
      )}
      <div className="p-4 md:p-6">
        {children}
      </div>
      {footer && (
        <footer className="p-4 bg-slate-800/50 border-t border-slate-700">
          {footer}
        </footer>
      )}
    </div>
  );
};

export default Card;
