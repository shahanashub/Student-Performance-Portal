import type { Activity, PerformanceTrend, TrendDirection } from '../types';

export function calculatePerformanceTrend(activities: Activity[]): PerformanceTrend {
  const sorted = [...activities].sort(
    (a, b) => new Date(a.ActivityDate).getTime() - new Date(b.ActivityDate).getTime()
  );

  const scoredActivities = sorted.filter(
    (a) => a.Score !== null && a.Score !== undefined && a.Status !== 'Absent'
  );

  const absentCount = sorted.filter((a) => a.Status === 'Absent').length;
  const attendedCount = sorted.filter(
    (a) => a.Status === 'Attended' || a.Status === 'Completed'
  ).length;

  if (scoredActivities.length === 0) {
    return {
      direction: 'Insufficient Data',
      averageScore: 0,
      scoreChange: 0,
      attendedCount,
      absentCount,
      totalActivities: sorted.length,
    };
  }

  const scores = scoredActivities.map((a) => Number(a.Score));
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  const averageScore = Math.round(sum / scores.length);

  if (scores.length === 1) {
    return {
      direction: 'Remaining Stable',
      averageScore,
      scoreChange: 0,
      attendedCount,
      absentCount,
      totalActivities: sorted.length,
    };
  }

  const lastScore = scores[scores.length - 1];
  const priorScores = scores.slice(0, scores.length - 1);
  const priorAverage = priorScores.reduce((a, b) => a + b, 0) / priorScores.length;
  const scoreChange = Math.round((lastScore - priorAverage) * 10) / 10;

  let direction: TrendDirection = 'Remaining Stable';
  if (scoreChange >= 3) {
    direction = 'Improving';
  } else if (scoreChange <= -3) {
    direction = 'Decreasing';
  } else {
    const firstScore = scores[0];
    const diff = lastScore - firstScore;
    if (diff >= 5) direction = 'Improving';
    else if (diff <= -5) direction = 'Decreasing';
  }

  return {
    direction,
    averageScore,
    scoreChange,
    attendedCount,
    absentCount,
    totalActivities: sorted.length,
  };
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
