import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ClassStudentSelector } from './components/ClassStudentSelector';
import { StudentProfileCard } from './components/StudentProfileCard';
import { ActivityPerformanceList } from './components/ActivityPerformanceList';
import { PerformanceChart } from './components/PerformanceChart';
import { AdminModal } from './components/AdminModal';
import { DataImportExportModal } from './components/DataImportExportModal';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { LoginScreen } from './components/LoginScreen';

import { db } from './services/db';
import type { Student, Activity } from './types';
import { calculatePerformanceTrend } from './utils/analytics';
import { GraduationCap, Sparkles, BookOpen, AlertCircle, ShieldCheck } from 'lucide-react';

const AUTH_MODE_KEY = 'spp_auth_mode_v2';
const AUTH_STUDENT_ID_KEY = 'spp_auth_student_id_v2';

export function App() {
  // Database Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  // Authentication State
  const [authMode, setAuthMode] = useState<'unauthenticated' | 'student' | 'admin'>(() => {
    const saved = localStorage.getItem(AUTH_MODE_KEY);
    if (saved === 'student' || saved === 'admin') return saved;
    return 'unauthenticated';
  });

  const [loggedInStudentId, setLoggedInStudentId] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_STUDENT_ID_KEY);
  });
  
  // Selection & Search States (Used by Admin mode)
  const [selectedClass, setSelectedClass] = useState<string>('Class 7');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);

  // Refresh data from DB engine
  const refreshData = () => {
    const allStudents = db.getStudents();
    const allClasses = db.getClasses();
    setStudents(allStudents);
    setClasses(allClasses);
  };

  useEffect(() => {
    refreshData();
    // Silently pull latest cloud data on load to keep Phone & Desktop in sync
    db.syncFromCloudSilently().then((updated) => {
      if (updated) refreshData();
    });
  }, []);

  // Filter students based on selected class and search query (for Admin view)
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesClass =
        selectedClass === 'ALL' || student.Class === selectedClass;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        student.StudentName.toLowerCase().includes(q) ||
        student.RegistrationNumber.toLowerCase().includes(q) ||
        student.Class.toLowerCase().includes(q);

      return matchesClass && matchesSearch;
    });
  }, [students, selectedClass, searchQuery]);

  // Ensure selectedStudentId points to a valid student in Admin mode
  useEffect(() => {
    if (authMode === 'admin') {
      if (filteredStudents.length > 0) {
        const currentExists = filteredStudents.some((s) => s.StudentID === selectedStudentId);
        if (!currentExists) {
          setSelectedStudentId(filteredStudents[0].StudentID);
        }
      } else {
        setSelectedStudentId('');
      }
    }
  }, [filteredStudents, selectedStudentId, authMode]);

  // Student Login Handler (via Registration Number)
  const handleStudentLogin = (studentId: string) => {
    setAuthMode('student');
    setLoggedInStudentId(studentId);
    localStorage.setItem(AUTH_MODE_KEY, 'student');
    localStorage.setItem(AUTH_STUDENT_ID_KEY, studentId);
  };

  // Admin Login Handler
  const handleAdminLogin = () => {
    setAuthMode('admin');
    db.setAdminAuthenticated(true);
    localStorage.setItem(AUTH_MODE_KEY, 'admin');
    if (students.length > 0) {
      setSelectedStudentId(students[0].StudentID);
      setSelectedClass(students[0].Class);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setAuthMode('unauthenticated');
    setLoggedInStudentId(null);
    db.setAdminAuthenticated(false);
    localStorage.removeItem(AUTH_MODE_KEY);
    localStorage.removeItem(AUTH_STUDENT_ID_KEY);
  };

  // Handle Class change in Admin mode
  const handleSelectClass = (className: string) => {
    setSelectedClass(className);
    const newFiltered = students.filter(
      (s) => className === 'ALL' || s.Class === className
    );
    if (newFiltered.length > 0) {
      setSelectedStudentId(newFiltered[0].StudentID);
    } else {
      setSelectedStudentId('');
    }
  };

  // Determine active displayed student based on Auth mode
  const activeStudentId = authMode === 'student' ? loggedInStudentId : selectedStudentId;

  // Get active student object
  const currentStudent = useMemo(() => {
    return students.find((s) => s.StudentID === activeStudentId);
  }, [students, activeStudentId]);

  // Get activities for currently selected student
  const currentStudentActivities = useMemo<Activity[]>(() => {
    if (!activeStudentId) return [];
    return db.getActivitiesForStudent(activeStudentId);
  }, [activeStudentId, students]);

  // Calculate dynamic performance trend
  const currentTrend = useMemo(() => {
    return calculatePerformanceTrend(currentStudentActivities);
  }, [currentStudentActivities]);

  const handleResetSampleData = () => {
    if (confirm('Reset database to initial sample data for 5 students?')) {
      db.resetToSampleData();
      refreshData();
      if (authMode === 'student' && loggedInStudentId) {
        // keep student logged in if valid
      } else {
        setSelectedClass('Class 7');
      }
    }
  };

  // IF UNAUTHENTICATED -> SHOW LOGIN SCREEN
  if (authMode === 'unauthenticated') {
    return (
      <LoginScreen
        students={students}
        onStudentLogin={handleStudentLogin}
        onAdminLogin={handleAdminLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-100">
      
      {/* HEADER */}
      <Header
        authMode={authMode}
        studentName={currentStudent?.StudentName}
        registrationNumber={currentStudent?.RegistrationNumber}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onResetSampleData={handleResetSampleData}
        onDataRefreshed={refreshData}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner Announcement */}
        <div className="mb-6 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-200 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {authMode === 'student'
                  ? `Personal Academic Performance Portal`
                  : `Admin Student Management Dashboard`}
              </h2>
              <p className="text-xs text-blue-100/90 mt-0.5">
                {authMode === 'student'
                  ? `Logged in as ${currentStudent?.StudentName} (${currentStudent?.RegistrationNumber}). Viewing private academic progress.`
                  : `Administrative view. Manage all classes, student profiles, test scores, and performance trends.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 font-medium">
            {authMode === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Admin Full Access</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5 text-blue-200" />
                <span>Private Student View</span>
              </>
            )}
          </div>
        </div>

        {/* ADMIN MODE ONLY: CLASS & STUDENT DEPENDENT DROPDOWN SELECTOR */}
        {authMode === 'admin' && (
          <ClassStudentSelector
            classes={classes}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
            filteredStudents={filteredStudents}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* DASHBOARD CONTENT FOR SELECTED / LOGGED-IN STUDENT */}
        {currentStudent ? (
          <div className="space-y-6">
            
            {/* STUDENT PROFILE */}
            <StudentProfileCard
              student={currentStudent}
              trend={currentTrend}
              isAdmin={authMode === 'admin'}
              onEditStudent={() => setIsAdminModalOpen(true)}
            />

            {/* ACTIVITY PERFORMANCE */}
            <ActivityPerformanceList
              activities={currentStudentActivities}
              isAdmin={authMode === 'admin'}
              onAddActivity={() => setIsAdminModalOpen(true)}
              onEditActivity={() => setIsAdminModalOpen(true)}
              onDeleteActivity={(actId) => {
                if (confirm('Delete this activity record?')) {
                  db.deleteActivity(actId);
                  refreshData();
                }
              }}
            />

            {/* PERFORMANCE IMPROVEMENT GRAPH */}
            <PerformanceChart
              studentName={currentStudent.StudentName}
              activities={currentStudentActivities}
              trend={currentTrend}
            />

          </div>
        ) : (
          /* NO STUDENT SELECTED STATE */
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Student Profile Not Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Could not locate student profile information. Please log out and try logging in again.
            </p>
            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Return to Login Screen
            </button>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <div className="flex items-center justify-center space-x-2 font-semibold text-slate-700">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Student Performance Portal</span>
          </div>
          <p>© 2026 Tuition & Education Centre Management System. Data privacy protected.</p>
        </div>
      </footer>

      {/* ADMIN MANAGEMENT MODAL */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={authMode === 'admin'}
        onLoginSuccess={() => {
          setAuthMode('admin');
          refreshData();
        }}
        students={students}
        onDataChanged={refreshData}
        initialStudentId={activeStudentId || undefined}
      />

      {/* DATA IMPORT / EXPORT MODAL */}
      <DataImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onDataImported={refreshData}
      />

      {/* PWA MOBILE INSTALL BANNER */}
      <PwaInstallPrompt />

    </div>
  );
}

export default App;
