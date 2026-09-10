import React from 'react';
import { Filter, User, Search, BookOpen } from 'lucide-react';
import type { Student } from '../types';

interface ClassStudentSelectorProps {
  classes: string[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  filteredStudents: Student[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ClassStudentSelector: React.FC<ClassStudentSelectorProps> = ({
  classes,
  selectedClass,
  onSelectClass,
  filteredStudents,
  selectedStudentId,
  onSelectStudent,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200/80 mb-6">
      <div className="flex flex-col gap-4">
        
        {/* Title / Section Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              Student Selector & Filter
            </h2>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
            {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'} Available
          </span>
        </div>

        {/* Grid for Dropdowns & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. SELECT CLASS */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Select Class</span>
            </label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => onSelectClass(e.target.value)}
                className="w-full h-12 pl-3.5 pr-10 bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all cursor-pointer"
              >
                <option value="ALL">All Classes (View All)</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. SELECT STUDENT (DEPENDENT DROPDOWN) */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Select Student</span>
            </label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => onSelectStudent(e.target.value)}
                disabled={filteredStudents.length === 0}
                className="w-full h-12 pl-3.5 pr-10 bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {filteredStudents.length === 0 ? (
                  <option value="">No Students Found</option>
                ) : (
                  filteredStudents.map((stu) => (
                    <option key={stu.StudentID} value={stu.StudentID}>
                      {stu.StudentName} ({stu.Class} - {stu.RegistrationNumber})
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 3. SEARCH FILTER */}
          <div className="flex flex-col space-y-1.5 sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Search Student Name / Reg No</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type name or reg number..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-12 pl-10 pr-3.5 bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-3.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
