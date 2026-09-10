import React, { useState } from 'react';
import { User, Phone, Award, FileText, CheckCircle2, Edit3 } from 'lucide-react';
import type { Student, PerformanceTrend } from '../types';
import { TrendIndicatorBadge } from './TrendIndicatorBadge';

interface StudentProfileCardProps {
  student: Student;
  trend: PerformanceTrend;
  isAdmin: boolean;
  onEditStudent?: (student: Student) => void;
}

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({
  student,
  trend,
  isAdmin,
  onEditStudent,
}) => {
  const [imageError, setImageError] = useState(false);

  const initials = student.StudentName.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const totalAttempted = trend.attendedCount;
  const totalAbsent = trend.absentCount;
  const attendanceRate =
    trend.totalActivities > 0
      ? Math.round((totalAttempted / trend.totalActivities) * 100)
      : 100;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 mb-6 transition-all">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Left Column: Profile Photo & Key Metadata */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left shrink-0">
          <div className="relative group mb-3">
            {!imageError && student.PhotoURL ? (
              <img
                src={student.PhotoURL}
                alt={student.StudentName}
                onError={() => setImageError(true)}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md ring-1 ring-slate-200/80 bg-slate-100"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md ring-1 ring-slate-200/80">
                {initials || <User className="w-10 h-10" />}
              </div>
            )}
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active Student Status"></span>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
            <span>{student.Class}</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-600">{student.RegistrationNumber}</span>
          </div>
        </div>

        {/* Middle Column: Details & Description */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {student.StudentName}
                </h3>
                {isAdmin && onEditStudent && (
                  <button
                    onClick={() => onEditStudent(student)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Student Profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400 inline" />
                <span>Contact: {student.ContactNumber || 'N/A'}</span>
              </p>
            </div>

            {/* Performance Trend Badge */}
            <div className="self-start sm:self-center">
              <TrendIndicatorBadge direction={trend.direction} scoreChange={trend.scoreChange} />
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-xl p-3 sm:p-3.5 border border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>Student Profile & Remarks</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {student.Description || 'No student remarks provided.'}
            </p>
          </div>
        </div>

        {/* Right Column: Quick Stats Cards */}
        <div className="w-full md:w-56 shrink-0 grid grid-cols-2 md:grid-cols-1 gap-3 pt-2 md:pt-0">
          
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Score</span>
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-1">
              <span className="text-2xl font-extrabold text-blue-900 font-mono">
                {trend.averageScore > 0 ? `${trend.averageScore}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-blue-600 block mt-0.5">Overall Academic Performance</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wider">Attendance</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-1">
              <span className="text-2xl font-extrabold text-slate-800 font-mono">
                {attendanceRate}%
              </span>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                <span className="text-emerald-600 font-medium">{totalAttempted} Attended</span>
                {totalAbsent > 0 && (
                  <span className="text-rose-600 font-medium">• {totalAbsent} Absent</span>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
