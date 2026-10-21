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
          className="text-gray-400 hover:text-zerodha-blue transition-colors focus:outline-none"
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
          className={`absolute z-50 w-64 p-3 bg-slate-900 text-white rounded-md shadow-xl border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${positionClasses[position]}`}
          style={{ minWidth: '220px', maxWidth: '300px' }}
        >
          {/* Header */}
          <div className="flex items-center space-x-1.5 pb-1 border-b border-slate-800 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zerodha-blue" />
            <span className="text-[11px] font-semibold tracking-tight text-slate-100">{title}</span>
          </div>

          {/* Plain English Beginner Explanation */}
          <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
            {content}
          </p>

          {/* Optional Pro Recommendation */}
          {recommendation && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-emerald-400 font-mono">
              <span className="font-semibold text-emerald-300">★ Tip: </span>
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
