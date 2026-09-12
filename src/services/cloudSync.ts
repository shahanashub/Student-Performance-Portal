import type { Student, Activity } from '../types';

// Permanent Shared Master Cloud Database ID
export const MASTER_CLOUD_DB_ID = 'ff808181a067127101a0946afa3e7fb9';

export interface CloudPayload {
  students: Student[];
  activities: Activity[];
  updatedAt: string;
}

/**
 * Fetch live students & activities from central cloud database
 */
export async function fetchFromCloud(): Promise<CloudPayload | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`https://api.restful-api.dev/objects/${MASTER_CLOUD_DB_ID}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (response && response.ok) {
      const result = await response.json().catch(() => null);
      if (result && result.data && Array.isArray(result.data.students)) {
        return result.data as CloudPayload;
      }
    }

    return null;
  } catch (error) {
    console.warn('Cloud sync fetch warning:', error);
    return null;
  }
}

/**
 * Push live student & activity updates to central cloud database so all mobile phones & PCs match instantly
 */
export async function pushToCloud(
  students: Student[],
  activities: Activity[]
): Promise<boolean> {
  try {
    const payload: CloudPayload = {
      students,
      activities,
      updatedAt: new Date().toISOString(),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`https://api.restful-api.dev/objects/${MASTER_CLOUD_DB_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        name: 'SPP_SHARED_DATABASE',
        data: payload,
      }),
    }).catch(() => null);

    clearTimeout(timeoutId);
    return !!(response && response.ok);
  } catch (error) {
    console.warn('Cloud sync push warning:', error);
    return false;
  }
}
