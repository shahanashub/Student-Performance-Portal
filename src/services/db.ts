import type { Student, Activity } from '../types';
import { INITIAL_STUDENTS, INITIAL_ACTIVITIES } from './sampleData';

const STUDENTS_KEY = 'spp_students_v1';
const ACTIVITIES_KEY = 'spp_activities_v1';
const ADMIN_AUTH_KEY = 'spp_admin_auth_v1';

export class LocalDatabaseService {
  private static instance: LocalDatabaseService;

  private constructor() {
    this.initDatabase();
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
  }

  public getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STUDENTS_KEY);
      return data ? JSON.parse(data) : INITIAL_STUDENTS;
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
    return this.getStudents().find((s) => s.StudentID === studentId);
  }

  public getActivities(): Activity[] {
    try {
      const data = localStorage.getItem(ACTIVITIES_KEY);
      return data ? JSON.parse(data) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  }

  public getActivitiesForStudent(studentId: string): Activity[] {
    const allActivities = this.getActivities();
    return allActivities
      .filter((act) => act.StudentID === studentId)
      .filter((act) => {
        const hasScore = act.Score !== null && act.Score !== undefined && !isNaN(Number(act.Score));
        const isExplicitStatus = act.Status === 'Absent' || act.Status === 'Not Completed' || act.Status === 'Completed' || act.Status === 'Attended';
        return hasScore || isExplicitStatus;
      })
      .sort((a, b) => new Date(a.ActivityDate).getTime() - new Date(b.ActivityDate).getTime());
  }

  public saveStudents(students: Student[]): void {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }

  public saveActivities(activities: Activity[]): void {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  }

  public addStudent(student: Omit<Student, 'StudentID'> & { StudentID?: string }): Student {
    const students = this.getStudents();
    const newId = student.StudentID || `STU-${Date.now().toString().slice(-4)}`;
    const newStudent: Student = {
      ...student,
      StudentID: newId,
      CreatedAt: new Date().toISOString(),
    };
    students.push(newStudent);
    this.saveStudents(students);
    return newStudent;
  }

  public updateStudent(updated: Student): void {
    const students = this.getStudents().map((s) => (s.StudentID === updated.StudentID ? updated : s));
    this.saveStudents(students);
  }

  public deleteStudent(studentId: string): void {
    const students = this.getStudents().filter((s) => s.StudentID !== studentId);
    this.saveStudents(students);
    const activities = this.getActivities().filter((a) => a.StudentID !== studentId);
    this.saveActivities(activities);
  }

  public addActivity(activity: Omit<Activity, 'ActivityID'> & { ActivityID?: string }): Activity {
    const activities = this.getActivities();
    const newId = activity.ActivityID || `ACT-${Date.now().toString().slice(-6)}`;
    const newActivity: Activity = {
      ...activity,
      ActivityID: newId,
    };
    activities.push(newActivity);
    this.saveActivities(activities);
    return newActivity;
  }

  public updateActivity(updated: Activity): void {
    const activities = this.getActivities().map((a) => (a.ActivityID === updated.ActivityID ? updated : a));
    this.saveActivities(activities);
  }

  public deleteActivity(activityId: string): void {
    const activities = this.getActivities().filter((a) => a.ActivityID !== activityId);
    this.saveActivities(activities);
  }

  public resetToSampleData(): void {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(INITIAL_ACTIVITIES));
  }

  public bulkImport(newStudents: Student[], newActivities: Activity[]): { addedStudents: number; addedActivities: number } {
    const currentStudents = this.getStudents();
    const currentActivities = this.getActivities();

    const studentMap = new Map(currentStudents.map((s) => [s.StudentID, s]));
    let addedStudents = 0;
    newStudents.forEach((s) => {
      if (!studentMap.has(s.StudentID)) {
        studentMap.set(s.StudentID, s);
        addedStudents++;
      } else {
        studentMap.set(s.StudentID, { ...studentMap.get(s.StudentID)!, ...s });
      }
    });

    const activityMap = new Map(currentActivities.map((a) => [a.ActivityID, a]));
    let addedActivities = 0;
    newActivities.forEach((a) => {
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
}

export const db = LocalDatabaseService.getInstance();
