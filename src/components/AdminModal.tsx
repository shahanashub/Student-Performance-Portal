import React, { useState } from 'react';
import { X, Lock, UserPlus, FilePlus, Edit3, Trash2, KeyRound, ShieldCheck } from 'lucide-react';
import type { Student, Activity, ActivityStatus } from '../types';
import { db } from '../services/db';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLoginSuccess: () => void;
  students: Student[];
  onDataChanged: () => void;
  initialStudentId?: string;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  students,
  onDataChanged,
  initialStudentId,
}) => {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'activities'>('students');

  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
  const [studentForm, setStudentForm] = useState<Partial<Student>>({
    StudentName: '',
    Class: 'Class 7',
    RegistrationNumber: '',
    ContactNumber: '',
    PhotoURL: '',
    Description: '',
  });

  const [editingActivity, setEditingActivity] = useState<Partial<Activity> | null>(null);
  const [activityForm, setActivityForm] = useState<Partial<Activity>>({
    StudentID: initialStudentId || (students[0]?.StudentID || ''),
    ActivityName: 'Quiz 1',
    ActivityDate: new Date().toISOString().split('T')[0],
    Score: 85,
    MaxScore: 100,
    Status: 'Attended',
    Notes: '',
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Scienti@dmin' || password === 'admin123' || password === 'admin') {
      db.setAdminAuthenticated(true);
      onLoginSuccess();
      setAuthError('');
    } else {
      setAuthError('Invalid Admin Password. Password is Scienti@dmin');
    }
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.StudentName || !studentForm.Class) {
      alert('Student Name and Class are required.');
      return;
    }

    if (editingStudent && editingStudent.StudentID) {
      db.updateStudent({
        ...editingStudent,
        ...studentForm,
      } as Student);
    } else {
      db.addStudent(studentForm as Omit<Student, 'StudentID'>);
    }

    setEditingStudent(null);
    setStudentForm({
      StudentName: '',
      Class: 'Class 7',
      RegistrationNumber: '',
      ContactNumber: '',
      PhotoURL: '',
      Description: '',
    });
    onDataChanged();
  };

  const handleEditStudentClick = (student: Student) => {
    setEditingStudent(student);
    setStudentForm(student);
    setActiveTab('students');
  };

  const handleDeleteStudentClick = (studentId: string) => {
    if (confirm('Are you sure you want to delete this student and all their activity records?')) {
      db.deleteStudent(studentId);
      onDataChanged();
    }
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.StudentID || !activityForm.ActivityName || !activityForm.ActivityDate) {
      alert('Student, Activity Name, and Date are required.');
      return;
    }

    const formattedActivity: Partial<Activity> = {
      ...activityForm,
      Score: activityForm.Status === 'Absent' ? null : Number(activityForm.Score),
    };

    if (editingActivity && editingActivity.ActivityID) {
      db.updateActivity({
        ...editingActivity,
        ...formattedActivity,
      } as Activity);
    } else {
      db.addActivity(formattedActivity as Omit<Activity, 'ActivityID'>);
    }

    setEditingActivity(null);
    setActivityForm({
      StudentID: activityForm.StudentID,
      ActivityName: '',
      ActivityDate: new Date().toISOString().split('T')[0],
      Score: 80,
      MaxScore: 100,
      Status: 'Attended',
      Notes: '',
    });
    onDataChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-bold">Admin Management Console</h3>
              <p className="text-xs text-slate-400">
                {isAdmin ? 'Authenticated Admin Mode' : 'Authentication Required'}
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

        {!isAdmin ? (
          <div className="p-6 sm:p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Admin Authentication</h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter your administrative password to modify student data, photos, and performance records.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter password (Scienti@dmin)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                {authError && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{authError}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Admin Password: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">Scienti@dmin</code>
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('students')}
                className={`py-2.5 px-4 font-semibold text-xs sm:text-sm border-b-2 flex items-center space-x-2 transition-colors ${
                  activeTab === 'students'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Student Profiles ({students.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-2.5 px-4 font-semibold text-xs sm:text-sm border-b-2 flex items-center space-x-2 transition-colors ${
                  activeTab === 'activities'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <FilePlus className="w-4 h-4" />
                <span>Activity & Marks Entry</span>
              </button>
            </div>

            {activeTab === 'students' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleSaveStudent}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-4"
                >
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <span>{editingStudent ? 'Edit Student Profile' : 'Add New Student'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Aarav Sharma"
                        required
                        value={studentForm.StudentName || ''}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, StudentName: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Class / Grade *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Class 7"
                        required
                        value={studentForm.Class || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, Class: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Registration Number (Auto-assigned if blank)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. REG-2026-701"
                        value={studentForm.RegistrationNumber || ''}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, RegistrationNumber: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98765 43210"
                        value={studentForm.ContactNumber || ''}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, ContactNumber: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Photo URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={studentForm.PhotoURL || ''}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, PhotoURL: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Student Remarks / Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Academic achievements, strengths, areas of focus..."
                        value={studentForm.Description || ''}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, Description: e.target.value })
                        }
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    {editingStudent && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStudent(null);
                          setStudentForm({
                            StudentName: '',
                            Class: 'Class 7',
                            RegistrationNumber: '',
                            ContactNumber: '',
                            PhotoURL: '',
                            Description: '',
                          });
                        }}
                        className="px-3 py-1.5 border border-slate-300 text-xs font-semibold rounded-lg hover:bg-white"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      {editingStudent ? 'Update Student' : 'Save New Student'}
                    </button>
                  </div>
                </form>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Class</th>
                        <th className="py-2.5 px-3">Login Reg Number</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {students.map((s) => (
                        <tr key={s.StudentID} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {s.StudentName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{s.Class}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {s.RegistrationNumber}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => handleEditStudentClick(s)}
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudentClick(s.StudentID)}
                                className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleSaveActivity}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-4"
                >
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <FilePlus className="w-4 h-4 text-blue-600" />
                    <span>{editingActivity ? 'Edit Activity Record' : 'Record New Activity'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Student *
                      </label>
                      <select
                        required
                        value={activityForm.StudentID || ''}
                        onChange={(e) =>
                          setActivityForm({ ...activityForm, StudentID: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        {students.map((s) => (
                          <option key={s.StudentID} value={s.StudentID}>
                            {s.StudentName} ({s.Class} - {s.RegistrationNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Activity Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Quiz 1, Unit Test, Monthly Test"
                        required
                        value={activityForm.ActivityName || ''}
                        onChange={(e) =>
                          setActivityForm({ ...activityForm, ActivityName: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Activity Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={activityForm.ActivityDate || ''}
                        onChange={(e) =>
                          setActivityForm({ ...activityForm, ActivityDate: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Attendance Status *
                      </label>
                      <select
                        value={activityForm.Status || 'Attended'}
                        onChange={(e) =>
                          setActivityForm({
                            ...activityForm,
                            Status: e.target.value as ActivityStatus,
                          })
                        }
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="Attended">Attended</option>
                        <option value="Completed">Completed</option>
                        <option value="Absent">Absent</option>
                        <option value="Not Completed">Not Completed</option>
                      </select>
                    </div>

                    {activityForm.Status !== 'Absent' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Score / Percentage (0 - 100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={activityForm.Score ?? 80}
                          onChange={(e) =>
                            setActivityForm({ ...activityForm, Score: Number(e.target.value) })
                          }
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Activity Notes / Topics
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chapter 4 Geometry & Trigonometry"
                        value={activityForm.Notes || ''}
                        onChange={(e) =>
                          setActivityForm({ ...activityForm, Notes: e.target.value })
                        }
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    {editingActivity && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingActivity(null);
                        }}
                        className="px-3 py-1.5 border border-slate-300 text-xs font-semibold rounded-lg hover:bg-white"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      {editingActivity ? 'Update Record' : 'Add Activity Record'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
