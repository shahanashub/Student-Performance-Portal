import React from 'react';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import type { TrendDirection } from '../types';

interface TrendIndicatorBadgeProps {
  direction: TrendDirection;
  scoreChange?: number;
  showDetails?: boolean;
}

export const TrendIndicatorBadge: React.FC<TrendIndicatorBadgeProps> = ({
  direction,
  scoreChange,
  showDetails = true,
}) => {
  switch (direction) {
    case 'Improving':
      return (
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Improving</span>
          {showDetails && scoreChange !== undefined && scoreChange > 0 && (
            <span className="font-mono text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
              +{scoreChange}%
            </span>
          )}
        </div>
      );

    case 'Decreasing':
      return (
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">
          <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          <span>Decreasing</span>
          {showDetails && scoreChange !== undefined && scoreChange < 0 && (
            <span className="font-mono text-[11px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full">
              {scoreChange}%
            </span>
          )}
        </div>
      );

    case 'Remaining Stable':
      return (
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
          <Minus className="w-3.5 h-3.5 text-blue-600" />
          <span>Remaining Stable</span>
        </div>
      );

    case 'Insufficient Data':
    default:
      return (
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-medium">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Insufficient Data</span>
        </div>
      );
  }
};
