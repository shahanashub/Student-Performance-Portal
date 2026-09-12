import React, { useState } from 'react';
import { GraduationCap, LogOut, Download, PlusCircle, RefreshCw, UserCheck, ShieldCheck, Cloud, CloudCheck, Loader2 } from 'lucide-react';
import { db } from '../services/db';

interface HeaderProps {
  authMode: 'unauthenticated' | 'student' | 'admin';
  studentName?: string;
  registrationNumber?: string;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenImportExport: () => void;
  onResetSampleData: () => void;
  onDataRefreshed?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  authMode,
  studentName,
  registrationNumber,
  onLogout,
  onOpenAdmin,
  onOpenImportExport,
  onResetSampleData,
  onDataRefreshed,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    try {
      if (authMode === 'admin') {
        // Admin pushes local data to cloud
        const ok = await db.syncToCloud();
        setSyncStatus(ok ? 'success' : 'error');
      } else {
        // Student / User pulls latest data from cloud
        const ok = await db.syncFromCloudSilently();
        setSyncStatus(ok ? 'success' : 'idle');
        if (onDataRefreshed) onDataRefreshed();
      }
    } catch {
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Logo & Portal Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                Student Performance Portal
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Tuition & Education Center Management System
              </p>
            </div>
          </div>

          {/* User Auth Status Badge & Controls */}
          <div className="flex items-center justify-between sm:justify-end space-x-2.5">
            
            {/* Student Auth Badge */}
            {authMode === 'student' && studentName && (
              <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="text-xs leading-tight">
                  <span className="font-bold text-blue-900 block">{studentName}</span>
                  <span className="text-[10px] text-blue-600 font-mono">{registrationNumber}</span>
                </div>
              </div>
            )}

            {/* Admin Auth Badge */}
            {authMode === 'admin' && (
              <div className="flex items-center space-x-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold">Admin Mode</span>
              </div>
            )}

            {/* Cloud Sync Button */}
            <button
              onClick={handleCloudSync}
              disabled={isSyncing}
              title="Sync Data Across Devices (Phone & PC)"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors cursor-pointer min-h-[40px] disabled:opacity-50"
            >
              {isSyncing ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              ) : syncStatus === 'success' ? (
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span className="hidden md:inline">
                {isSyncing ? 'Syncing...' : syncStatus === 'success' ? 'Synced!' : 'Cloud Sync'}
              </span>
            </button>

            {/* Admin Panel Button */}
            {authMode === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[40px]"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            )}

            {/* CSV Import/Export */}
            {authMode === 'admin' && (
              <button
                onClick={onOpenImportExport}
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition-colors cursor-pointer min-h-[40px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Import / Export CSV</span>
                <span className="md:hidden">CSV</span>
              </button>
            )}

            {/* Reset Demo Data */}
            <button
              onClick={onResetSampleData}
              title="Reset Database to Default Sample Data"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer min-h-[40px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            {/* Logout Button */}
            {authMode !== 'unauthenticated' && (
              <button
                onClick={onLogout}
                title="Logout Session"
                className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors cursor-pointer min-h-[40px]"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Logout</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
