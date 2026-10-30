'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface FlyingBoxProps {
  title: string;
  content: string;
  recommendation?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  triggerIcon?: 'info' | 'help' | 'none';
  children?: React.ReactNode;
}

export const FlyingBox: React.FC<FlyingBoxProps> = ({
  title,
  content,
  recommendation,
  position = 'top',
  triggerIcon = 'info',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent'
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      {children ? (
        children
      ) : (
        <button
          type="button"
          aria-label={title}
          className="text-[#9FA4B8] hover:text-[#6B70F0] transition-colors focus:outline-none"
        >
          {triggerIcon === 'help' ? (
            <HelpCircle className="w-3.5 h-3.5" />
          ) : (
            <Info className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Explanatory Flying Box Popover */}
      {isVisible && (
        <div
          className={`absolute z-50 w-64 p-3.5 glass-panel-elevated text-white rounded-xl shadow-2xl border border-white/[0.14] pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${positionClasses[position]}`}
          style={{ minWidth: '230px', maxWidth: '320px' }}
        >
          {/* Header */}
          <div className="flex items-center space-x-2 pb-1.5 border-b border-white/[0.08] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D36] shadow-[0_0_6px_#FF4D36]" />
            <span className="text-xs font-heading font-bold tracking-tight text-white">{title}</span>
          </div>

          {/* Plain English Beginner Explanation */}
          <p className="text-xs text-[#9FA4B8] leading-relaxed font-sans">
            {content}
          </p>

          {/* Optional Pro Recommendation */}
          {recommendation && (
            <div className="mt-2.5 pt-2 border-t border-white/[0.08] text-[11px] text-[#33C287] font-mono">
              <span className="font-bold text-[#27A376]">★ Tip: </span>
              {recommendation}
            </div>
          )}

          {/* Triangle arrow */}
          <div className={`absolute border-4 w-0 h-0 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};
