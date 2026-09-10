import React from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import type { Activity, ActivityStatus } from '../types';
import { formatDate } from '../utils/analytics';

interface ActivityPerformanceListProps {
  activities: Activity[];
  isAdmin: boolean;
  onAddActivity?: () => void;
  onEditActivity?: (activity: Activity) => void;
  onDeleteActivity?: (activityId: string) => void;
}

export const ActivityPerformanceList: React.FC<ActivityPerformanceListProps> = ({
  activities,
  isAdmin,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}) => {
  const renderStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'Attended':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Attended</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Completed</span>
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Absent</span>
          </span>
        );
      case 'Not Completed':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Not Completed</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200/80 mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Activity Performance</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {activities.length} Recorded
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quizzes, Assignments, Unit Tests, and Projects (Unrecorded activities are automatically hidden)
          </p>
        </div>

        {isAdmin && onAddActivity && (
          <button
            onClick={onAddActivity}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity Record</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {activities.length === 0 ? (
        <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">No Recorded Activities</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            There are no recorded activity scores or attendance entries for this student yet.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {activities.map((act) => (
              <div
                key={act.ActivityID}
                className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{act.ActivityName}</h4>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(act.ActivityDate)}</span>
                    </p>
                  </div>
                  <div>{renderStatusBadge(act.Status)}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xs text-slate-500">Score:</span>
                    {act.Status === 'Absent' ? (
                      <span className="text-xs font-semibold text-rose-600 font-mono">
                        Absent (No Score)
                      </span>
                    ) : act.Score !== null && act.Score !== undefined ? (
                      <span className="text-base font-extrabold text-blue-900 font-mono">
                        {act.Score} <span className="text-xs font-normal text-slate-500">/ {act.MaxScore || 100}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not Graded</span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      {onEditActivity && (
                        <button
                          onClick={() => onEditActivity(act)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteActivity && (
                        <button
                          onClick={() => onDeleteActivity(act.ActivityID)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {act.Notes && (
                  <p className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-100 italic">
                    Note: {act.Notes}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Activity Name</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  {isAdmin && <th className="py-3 px-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {activities.map((act) => (
                  <tr key={act.ActivityID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div>{act.ActivityName}</div>
                      {act.Notes && (
                        <div className="text-[11px] font-normal text-slate-500 italic mt-0.5">
                          {act.Notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(act.ActivityDate)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{renderStatusBadge(act.Status)}</td>
                    <td className="py-3 px-4 text-right">
                      {act.Status === 'Absent' ? (
                        <span className="text-xs font-semibold text-rose-600 font-mono">
                          Absent
                        </span>
                      ) : act.Score !== null && act.Score !== undefined ? (
                        <span className="text-sm font-bold text-slate-900 font-mono">
                          {act.Score}{' '}
                          <span className="text-[11px] font-normal text-slate-500">
                            / {act.MaxScore || 100}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">—</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {onEditActivity && (
                            <button
                              onClick={() => onEditActivity(act)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Activity"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteActivity && (
                            <button
                              onClick={() => onDeleteActivity(act.ActivityID)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
};
