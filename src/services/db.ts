import type { Student, Activity } from '../types';
import { INITIAL_STUDENTS, INITIAL_ACTIVITIES } from './sampleData';
import { pushToCloud, fetchFromCloud } from './cloudSync';

const STUDENTS_KEY = 'spp_students_v1';
const ACTIVITIES_KEY = 'spp_activities_v1';
const DELETED_STUDENTS_KEY = 'spp_deleted_students_v1';
const DELETED_ACTIVITIES_KEY = 'spp_deleted_activities_v1';
const ADMIN_AUTH_KEY = 'spp_admin_auth_v1';
const LAST_SYNC_KEY = 'spp_last_cloud_sync_v1';

export class LocalDatabaseService {
  private static instance: LocalDatabaseService;
  private isSyncing = false;

  private constructor() {
    this.initDatabase();
    this.syncFromCloudSilently();
  }

  public static getInstance(): LocalDatabaseService {
    if (!LocalDatabaseService.instance) {
      LocalDatabaseService.instance = new LocalDatabaseService();
    }
    return LocalDatabaseService.instance;
  }

  private initDatabase(): void {
    if (!localStorage.getItem(STUDENTS_KEY)) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(INITIAL_STUDENTS));
    }
    if (!localStorage.getItem(ACTIVITIES_KEY)) {
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(INITIAL_ACTIVITIES));
    }
    if (!localStorage.getItem(DELETED_STUDENTS_KEY)) {
      localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(DELETED_ACTIVITIES_KEY)) {
      localStorage.setItem(DELETED_ACTIVITIES_KEY, JSON.stringify([]));
    }
  }

  private getDeletedStudentIds(): Set<string> {
    try {
      const data = localStorage.getItem(DELETED_STUDENTS_KEY);
      return new Set(data ? JSON.parse(data) : []);
    } catch {
      return new Set();
    }
  }

  public addDeletedStudentId(id: string): void {
    if (!id) return;
    const set = this.getDeletedStudentIds();
    set.add(id.trim().toUpperCase());
    localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify(Array.from(set)));
  }

  public removeDeletedStudentId(id: string): void {
    if (!id) return;
    const set = this.getDeletedStudentIds();
    const cleanId = id.trim().toUpperCase();
    if (set.has(cleanId)) {
      set.delete(cleanId);
      localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify(Array.from(set)));
    }
  }

  public isStudentDeleted(query: string): boolean {
    if (!query) return false;
    const set = this.getDeletedStudentIds();
    return set.has(query.trim().toUpperCase());
  }

  private getDeletedActivityIds(): Set<string> {
    try {
      const data = localStorage.getItem(DELETED_ACTIVITIES_KEY);
      return new Set(data ? JSON.parse(data) : []);
    } catch {
      return new Set();
    }
  }

  public addDeletedActivityId(id: string): void {
    if (!id) return;
    const set = this.getDeletedActivityIds();
    set.add(id.trim().toUpperCase());
    localStorage.setItem(DELETED_ACTIVITIES_KEY, JSON.stringify(Array.from(set)));
  }

  public removeDeletedActivityId(id: string): void {
    if (!id) return;
    const set = this.getDeletedActivityIds();
    const cleanId = id.trim().toUpperCase();
    if (set.has(cleanId)) {
      set.delete(cleanId);
      localStorage.setItem(DELETED_ACTIVITIES_KEY, JSON.stringify(Array.from(set)));
    }
  }

  public isActivityDeleted(id: string): boolean {
    if (!id) return false;
    const set = this.getDeletedActivityIds();
    return set.has(id.trim().toUpperCase());
  }

  public async syncFromCloudSilently(): Promise<boolean> {
    if (this.isSyncing) return false;
    this.isSyncing = true;
    try {
      const cloudData = await fetchFromCloud();
      if (cloudData && Array.isArray(cloudData.students)) {
        const deletedStudents = this.getDeletedStudentIds();
        const deletedActivities = this.getDeletedActivityIds();

        const cleanStudents = cloudData.students.filter(
          (s) =>
            !deletedStudents.has(s.StudentID.toUpperCase()) &&
            !deletedStudents.has((s.RegistrationNumber || '').toUpperCase())
        );
        const cleanActivities = (cloudData.activities || []).filter(
          (a) =>
            !deletedActivities.has(a.ActivityID.toUpperCase()) &&
            !deletedStudents.has(a.StudentID.toUpperCase())
        );

        localStorage.setItem(STUDENTS_KEY, JSON.stringify(cleanStudents));
        localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(cleanActivities));
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        this.isSyncing = false;
        return true;
      }
    } catch (e) {
      console.warn('Silent cloud sync error:', e);
    }
    this.isSyncing = false;
    return false;
  }

  public async syncToCloud(): Promise<boolean> {
    try {
      const students = this.getStudents();
      const activities = this.getActivities();
      const success = await pushToCloud(students, activities);
      if (success) {
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      }
      return success;
    } catch {
      return false;
    }
  }

  public getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STUDENTS_KEY);
      const rawStudents: Student[] = data ? JSON.parse(data) : INITIAL_STUDENTS;
      const deletedSet = this.getDeletedStudentIds();
      return rawStudents.filter(
        (s) =>
          !deletedSet.has(s.StudentID.toUpperCase()) &&
          !deletedSet.has((s.RegistrationNumber || '').toUpperCase())
      );
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  public getClasses(): string[] {
    const students = this.getStudents();
    const classesSet = new Set<string>();
    students.forEach((s) => {
      if (s.Class && s.Class.trim() !== '') {
        classesSet.add(s.Class.trim());
      }
    });
    return Array.from(classesSet).sort((a, b) => 
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }

  public getStudentsByClass(className: string): Student[] {
    const students = this.getStudents();
    if (!className || className === 'ALL') {
      return students;
    }
    return students.filter((s) => s.Class === className);
  }

  public getStudentById(studentId: string): Student | undefined {
    const query = studentId.toUpperCase();
    return this.getStudents().find(
      (s) =>
        s.StudentID.toUpperCase() === query ||
        (s.RegistrationNumber && s.RegistrationNumber.toUpperCase() === query)
    );
  }

  public getActivities(): Activity[] {
    try {
      const data = localStorage.getItem(ACTIVITIES_KEY);
      const rawActivities: Activity[] = data ? JSON.parse(data) : INITIAL_ACTIVITIES;
      const deletedActivities = this.getDeletedActivityIds();
      const deletedStudents = this.getDeletedStudentIds();
      return rawActivities.filter(
        (a) =>
          !deletedActivities.has(a.ActivityID.toUpperCase()) &&
          !deletedStudents.has(a.StudentID.toUpperCase())
      );
    } catch {
      return INITIAL_ACTIVITIES;
    }
  }

  public getActivitiesForStudent(studentId: string): Activity[] {
    const deletedStudents = this.getDeletedStudentIds();
    if (deletedStudents.has(studentId.toUpperCase())) {
      return [];
    }

    const allActivities = this.getActivities();
    return allActivities
      .filter((act) => act.StudentID.toUpperCase() === studentId.toUpperCase())
      .filter((act) => {
        const hasScore = act.Score !== null && act.Score !== undefined && !isNaN(Number(act.Score));
        const isExplicitStatus = act.Status === 'Absent' || act.Status === 'Not Completed' || act.Status === 'Completed' || act.Status === 'Attended';
        return hasScore || isExplicitStatus;
      })
      .sort((a, b) => new Date(a.ActivityDate).getTime() - new Date(b.ActivityDate).getTime());
  }

  public saveStudents(students: Student[]): void {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    this.syncToCloud();
  }

  public saveActivities(activities: Activity[]): void {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
    this.syncToCloud();
  }

  public addStudent(student: Omit<Student, 'StudentID'> & { StudentID?: string }): Student {
    const newId = student.StudentID || `STU-${Date.now().toString().slice(-4)}`;
    
    // Auto-generate Registration Number if blank
    const regNo = student.RegistrationNumber && student.RegistrationNumber.trim() !== ''
      ? student.RegistrationNumber.trim()
      : `REG-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Clear previous deletion tombstones if re-adding/re-creating
    this.removeDeletedStudentId(newId);
    this.removeDeletedStudentId(regNo);

    const newStudent: Student = {
      ...student,
      StudentID: newId,
      RegistrationNumber: regNo,
      CreatedAt: new Date().toISOString(),
    };

    const currentStudents = this.getStudents().filter((s) => s.StudentID !== newId);
    currentStudents.push(newStudent);
    this.saveStudents(currentStudents);
    return newStudent;
  }

  public updateStudent(updated: Student): void {
    const regNo = updated.RegistrationNumber && updated.RegistrationNumber.trim() !== ''
      ? updated.RegistrationNumber.trim()
      : `REG-2026-${updated.StudentID.replace(/\D/g, '') || Math.floor(100 + Math.random() * 900)}`;

    this.removeDeletedStudentId(updated.StudentID);
    this.removeDeletedStudentId(regNo);

    const sanitized = { ...updated, RegistrationNumber: regNo };
    const students = this.getStudents().map((s) => (s.StudentID === updated.StudentID ? sanitized : s));
    this.saveStudents(students);
  }

  public deleteStudent(studentId: string): void {
    const target = this.getStudentById(studentId);
    this.addDeletedStudentId(studentId);
    if (target) {
      if (target.StudentID) this.addDeletedStudentId(target.StudentID);
      if (target.RegistrationNumber) this.addDeletedStudentId(target.RegistrationNumber);
    }

    const remainingStudents = this.getStudents().filter(
      (s) => s.StudentID.toUpperCase() !== studentId.toUpperCase()
    );
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(remainingStudents));

    const remainingActivities = this.getActivities().filter(
      (a) => a.StudentID.toUpperCase() !== studentId.toUpperCase()
    );
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(remainingActivities));

    this.syncToCloud();
  }

  public addActivity(activity: Omit<Activity, 'ActivityID'> & { ActivityID?: string }): Activity {
    const activities = this.getActivities();
    const newId = activity.ActivityID || `ACT-${Date.now().toString().slice(-6)}`;
    
    if (activity.ActivityID) this.removeDeletedActivityId(activity.ActivityID);

    const newActivity: Activity = {
      ...activity,
      ActivityID: newId,
    };
    activities.push(newActivity);
    this.saveActivities(activities);
    return newActivity;
  }

  public updateActivity(updated: Activity): void {
    if (updated.ActivityID) this.removeDeletedActivityId(updated.ActivityID);
    const activities = this.getActivities().map((a) => (a.ActivityID === updated.ActivityID ? updated : a));
    this.saveActivities(activities);
  }

  public deleteActivity(activityId: string): void {
    this.addDeletedActivityId(activityId);

    const activities = this.getActivities().filter(
      (a) => a.ActivityID.toUpperCase() !== activityId.toUpperCase()
    );
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));

    this.syncToCloud();
  }

  public resetToSampleData(): void {
    localStorage.removeItem(DELETED_STUDENTS_KEY);
    localStorage.removeItem(DELETED_ACTIVITIES_KEY);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(INITIAL_ACTIVITIES));
    this.syncToCloud();
  }

  public bulkImport(newStudents: Student[], newActivities: Activity[]): { addedStudents: number; addedActivities: number } {
    const currentStudents = this.getStudents();
    const currentActivities = this.getActivities();

    const studentMap = new Map(currentStudents.map((s) => [s.StudentID, s]));
    let addedStudents = 0;
    newStudents.forEach((s) => {
      const regNo = s.RegistrationNumber && s.RegistrationNumber.trim() !== ''
        ? s.RegistrationNumber.trim()
        : `REG-2026-${Math.floor(100 + Math.random() * 900)}`;
      const cleanStudent = { ...s, RegistrationNumber: regNo };

      if (s.StudentID) this.removeDeletedStudentId(s.StudentID);
      this.removeDeletedStudentId(regNo);

      if (!studentMap.has(s.StudentID)) {
        studentMap.set(s.StudentID, cleanStudent);
        addedStudents++;
      } else {
        studentMap.set(s.StudentID, { ...studentMap.get(s.StudentID)!, ...cleanStudent });
      }
    });

    const activityMap = new Map(currentActivities.map((a) => [a.ActivityID, a]));
    let addedActivities = 0;
    newActivities.forEach((a) => {
      if (a.ActivityID) this.removeDeletedActivityId(a.ActivityID);
      if (!activityMap.has(a.ActivityID)) {
        activityMap.set(a.ActivityID, a);
        addedActivities++;
      } else {
        activityMap.set(a.ActivityID, { ...activityMap.get(a.ActivityID)!, ...a });
      }
    });

    this.saveStudents(Array.from(studentMap.values()));
    this.saveActivities(Array.from(activityMap.values()));

    return { addedStudents, addedActivities };
  }

  public isAdminAuthenticated(): boolean {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  }

  public setAdminAuthenticated(authenticated: boolean): void {
    if (authenticated) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }
  }

  public getLastSyncTime(): string | null {
    return localStorage.getItem(LAST_SYNC_KEY);
  }
}

export const db = LocalDatabaseService.getInstance();
