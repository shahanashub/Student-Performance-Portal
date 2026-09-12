import React, { useState } from 'react';
import { GraduationCap, User, Lock, KeyRound, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import type { Student } from '../types';
import { db } from '../services/db';

interface LoginScreenProps {
  students: Student[];
  onStudentLogin: (studentId: string) => void;
  onAdminLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onStudentLogin,
  onAdminLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  
  // Student Login Form State
  const [regNumberInput, setRegNumberInput] = useState('');
  const [studentError, setStudentError] = useState('');

  // Admin Login Form State
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = regNumberInput.trim().toUpperCase();
    if (!query) {
      setStudentError('Please enter your Registration Number.');
      return;
    }

    // Always fetch latest non-deleted active students from DB
    const activeStudents = db.getStudents();
    const matchedStudent = activeStudents.find(
      (s) => s.RegistrationNumber.toUpperCase() === query || s.StudentID.toUpperCase() === query
    );

    if (matchedStudent) {
      setStudentError('');
      onStudentLogin(matchedStudent.StudentID);
    } else {
      setStudentError(`Registration Number not found or student record has been removed.`);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'Scienti@dmin' || adminPasswordInput === 'admin123' || adminPasswordInput === 'admin') {
      setAdminError('');
      onAdminLogin();
    } else {
      setAdminError('Invalid Admin Password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-100">
      
      {/* Top Simple Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Student Performance Portal
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Tuition & Education Center Management System
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            Secure Authentication Portal
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Card Header Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
                {activeTab === 'student' ? (
                  <User className="w-6 h-6 text-blue-200" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-blue-200" />
                )}
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {activeTab === 'student' ? 'Student & Parent Login' : 'Administrator Login'}
              </h2>
              <p className="text-xs text-blue-100/90 mt-1 max-w-xs mx-auto">
                {activeTab === 'student'
                  ? 'Access your individual academic profile, quiz results, and performance graphs'
                  : 'Manage students, entry marks, export reports, and edit records'}
              </p>
            </div>
          </div>

          {/* Dual Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                setActiveTab('student');
                setStudentError('');
              }}
              className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center space-x-2 border-b-2 cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white border-blue-600 text-blue-600 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student / Parent</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setAdminError('');
              }}
              className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center space-x-2 border-b-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white border-blue-600 text-blue-600 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Administrator</span>
            </button>
          </div>

          {/* Form Area */}
          <div className="p-6">
            {activeTab === 'student' ? (
              /* TAB 1: STUDENT LOGIN BY REGISTRATION NUMBER */
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Registration Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter Registration Number"
                      value={regNumberInput}
                      onChange={(e) => setRegNumberInput(e.target.value)}
                      className="w-full h-12 pl-10 pr-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 uppercase"
                      autoFocus
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>

                  {studentError && (
                    <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{studentError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Log In to Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* TAB 2: ADMIN LOGIN */
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Admin Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter Admin Password"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="w-full h-12 pl-10 pr-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                      autoFocus
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>

                  {adminError && (
                    <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{adminError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Authenticate Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>© 2026 Tuition & Education Centre Management System. Data privacy protected.</p>
      </footer>

    </div>
  );
};
