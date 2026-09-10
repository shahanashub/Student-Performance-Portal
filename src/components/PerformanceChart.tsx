import React from 'react';
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import type { Activity, PerformanceTrend } from '../types';
import { formatDate } from '../utils/analytics';
import { TrendIndicatorBadge } from './TrendIndicatorBadge';
import { LineChart as ChartIcon, Sparkles } from 'lucide-react';

interface PerformanceChartProps {
  studentName: string;
  activities: Activity[];
  trend: PerformanceTrend;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  studentName,
  activities,
  trend,
}) => {
  const chartData = activities
    .map((act, index) => {
      const dateLabel = formatDate(act.ActivityDate);
      const isAbsent = act.Status === 'Absent';
      const scoreValue = isAbsent ? 0 : act.Score !== null ? Number(act.Score) : null;

      return {
        id: act.ActivityID,
        attempt: index + 1,
        name: act.ActivityName,
        date: dateLabel,
        rawDate: act.ActivityDate,
        score: scoreValue,
        status: act.Status,
        isAbsent,
        formattedScore: isAbsent ? 'Absent (0)' : scoreValue !== null ? `${scoreValue}%` : 'N/A',
      };
    })
    .filter((item) => item.score !== null);

  const getTrendRecommendation = () => {
    switch (trend.direction) {
      case 'Improving':
        return 'Outstanding trajectory! Keep up the consistent study routine and maintain momentum.';
      case 'Decreasing':
        return 'Performance drop detected. We recommend targeted review sessions in recent weak topics.';
      case 'Remaining Stable':
        return 'Consistent performance level. Focus on advanced problem solving to reach the next tier.';
      case 'Insufficient Data':
      default:
        return 'More activity evaluations are needed to establish an accurate performance trajectory.';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200/80 mb-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ChartIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Performance Improvement Graph
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological academic score trajectory for <span className="font-semibold text-slate-700">{studentName}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <TrendIndicatorBadge direction={trend.direction} scoreChange={trend.scoreChange} />
        </div>
      </div>

      {chartData.length < 1 ? (
        <div className="text-center py-14 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <ChartIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Chart Data Available</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Need at least one recorded activity score to plot the performance improvement graph.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100 rounded-xl p-3.5 flex items-start space-x-3">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-blue-900">Academic Trajectory Analysis: </span>
              <span className="text-blue-800">{getTrendRecommendation()}</span>
            </div>
          </div>

          <div className="w-full h-72 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 20, left: -15, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  dy={8}
                />

                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  unit="%"
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl text-xs space-y-1 border border-slate-800 min-w-[160px]">
                          <div className="font-bold text-blue-300">{data.name}</div>
                          <div className="text-slate-400 text-[11px]">{data.date}</div>
                          <div className="pt-1 flex items-center justify-between font-mono">
                            <span className="text-slate-300">Score:</span>
                            <span
                              className={`font-bold text-sm ${
                                data.isAbsent ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {data.formattedScore}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1">
                            Status: <span className="font-medium text-slate-200">{data.status}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <ReferenceLine
                  y={75}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Target Benchmark (75%)',
                    fill: '#94a3b8',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="none"
                  fill="url(#scoreGradient)"
                />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: '#2563eb',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#1d4ed8',
                    stroke: '#ffffff',
                    strokeWidth: 3,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

    </div>
  );
};
