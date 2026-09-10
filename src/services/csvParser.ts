import Papa from 'papaparse';

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSVFile<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function downloadSampleStudentsCSV(): void {
  const sampleData = [
    {
      StudentID: 'STU-1001',
      StudentName: 'John Doe',
      Class: 'Class 7',
      RegistrationNumber: 'REG-2026-1001',
      ContactNumber: '+91 99999 88888',
      PhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      Description: 'Sample new student entry for Class 7',
    },
  ];
  exportToCSV(sampleData, 'sample_students_template');
}

export function downloadSampleActivitiesCSV(): void {
  const sampleData = [
    {
      ActivityID: 'ACT-1001-1',
      StudentID: 'STU-1001',
      ActivityName: 'Quiz 1',
      ActivityDate: '2026-09-01',
      Score: 85,
      MaxScore: 100,
      Status: 'Attended',
      Notes: 'First Diagnostic Test',
    },
    {
      ActivityID: 'ACT-1001-2',
      StudentID: 'STU-1001',
      ActivityName: 'Quiz 2',
      ActivityDate: '2026-09-10',
      Score: null,
      MaxScore: 100,
      Status: 'Absent',
      Notes: 'Excused Leave',
    },
  ];
  exportToCSV(sampleData, 'sample_activities_template');
}
