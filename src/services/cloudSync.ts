import type { Student, Activity } from '../types';

const CLOUD_SYNC_KEY = 'spp_cloud_sync_id_v1';
const DEFAULT_SYNC_ID = 'spp-sci-edu-portal-2026';

export interface CloudPayload {
  students: Student[];
  activities: Activity[];
  updatedAt: string;
}

export async function fetchFromCloud(syncId: string = DEFAULT_SYNC_ID): Promise<CloudPayload | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout max

    const response = await fetch(`https://api.restful-api.dev/objects/${encodeURIComponent(syncId)}`, {
      method: 'GET',
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

export async function pushToCloud(
  students: Student[],
  activities: Activity[],
  syncId: string = DEFAULT_SYNC_ID
): Promise<boolean> {
  try {
    const payload: CloudPayload = {
      students,
      activities,
      updatedAt: new Date().toISOString(),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.restful-api.dev/objects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        id: syncId,
        name: 'SPP_Cloud_Data',
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

export function getStoredSyncId(): string {
  try {
    return localStorage.getItem(CLOUD_SYNC_KEY) || DEFAULT_SYNC_ID;
  } catch {
    return DEFAULT_SYNC_ID;
  }
}

export function setStoredSyncId(syncId: string): void {
  try {
    localStorage.setItem(CLOUD_SYNC_KEY, syncId);
  } catch {
    // ignore
  }
}
