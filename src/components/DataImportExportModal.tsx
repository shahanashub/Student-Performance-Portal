import React, { useState } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../services/db';
import {
  exportToCSV,
  parseCSVFile,
  downloadSampleStudentsCSV,
  downloadSampleActivitiesCSV,
} from '../services/csvParser';
import type { Student, Activity } from '../types';

interface DataImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
}

export const DataImportExportModal: React.FC<DataImportExportModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
}) => {
  if (!isOpen) return null;

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleExportStudents = () => {
    const students = db.getStudents();
    exportToCSV(students as unknown as Record<string, unknown>[], 'students_export');
  };

  const handleExportActivities = () => {
    const activities = db.getActivities();
    exportToCSV(activities as unknown as Record<string, unknown>[], 'activities_export');
  };

  const handleStudentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedStudents = await parseCSVFile<Student>(file);
      if (parsedStudents.length === 0) {
        setImportStatus({ type: 'error', message: 'The uploaded file is empty or invalid.' });
        return;
      }
      const res = db.bulkImport(parsedStudents, []);
      setImportStatus({
        type: 'success',
        message: `Successfully imported ${res.addedStudents} student record(s)!`,
      });
      onDataImported();
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Failed to parse CSV file. Please check column headers.',
      });
    }
  };

  const handleActivityFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedActivities = await parseCSVFile<Activity>(file);
      if (parsedActivities.length === 0) {
        setImportStatus({ type: 'error', message: 'The uploaded file is empty or invalid.' });
        return;
      }
      const res = db.bulkImport([], parsedActivities);
      setImportStatus({
        type: 'success',
        message: `Successfully imported ${res.addedActivities} activity record(s)!`,
      });
      onDataImported();
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Failed to parse CSV file. Please check column headers.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-lg font-bold">Data Import & Export Center</h3>
              <p className="text-xs text-slate-400">
                CSV, Excel & Google Sheets compatibility engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {importStatus.type && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export Database to CSV</span>
            </h4>
            <p className="text-xs text-slate-600">
              Download complete database snapshots to Excel or Google Sheets.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleExportStudents}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Export Students (.CSV)
              </button>
              <button
                onClick={handleExportActivities}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Export Activities (.CSV)
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Bulk Import Data from CSV / Excel</span>
            </h4>
            <p className="text-xs text-slate-600">
              Upload populated CSV files to expand student roster or bulk import exam marks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-colors text-center">
                <Upload className="w-5 h-5 text-blue-600 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Import Students CSV</span>
                <span className="text-[10px] text-slate-400">Select file</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleStudentFileUpload}
                  className="hidden"
                />
              </label>

              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-colors text-center">
                <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Import Activities CSV</span>
                <span className="text-[10px] text-slate-400">Select file</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleActivityFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Download CSV Header Templates:</span>
            <div className="flex space-x-2">
              <button
                onClick={downloadSampleStudentsCSV}
                className="text-blue-600 hover:underline cursor-pointer font-medium"
              >
                Students Template
              </button>
              <span>•</span>
              <button
                onClick={downloadSampleActivitiesCSV}
                className="text-blue-600 hover:underline cursor-pointer font-medium"
              >
                Activities Template
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
