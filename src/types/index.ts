export type ActivityStatus = 'Attended' | 'Absent' | 'Completed' | 'Not Completed';

export interface Student {
  StudentID: string;
  StudentName: string;
  Class: string;
  RegistrationNumber: string;
  ContactNumber: string;
  PhotoURL: string;
  Description: string;
  CreatedAt?: string;
}

export interface Activity {
  ActivityID: string;
  StudentID: string;
  ActivityName: string;
  ActivityDate: string; // ISO format string YYYY-MM-DD
  Score: number | null; // null if unrecorded or absent without numerical score
  MaxScore?: number;    // default 100 or activity max
  Status: ActivityStatus;
  Notes?: string;
}

export type TrendDirection = 'Improving' | 'Decreasing' | 'Remaining Stable' | 'Insufficient Data';

export interface PerformanceTrend {
  direction: TrendDirection;
  averageScore: number;
  scoreChange: number; // difference between last score and previous avg
  attendedCount: number;
  absentCount: number;
  totalActivities: number;
}

export interface AuthState {
  isAdmin: boolean;
  adminToken: string | null;
}
