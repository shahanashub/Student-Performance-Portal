import type { Student, Activity } from '../types';

// Cloud Sync configuration
const CLOUD_SYNC_KEY = 'spp_cloud_sync_id_v1';
const DEFAULT_SYNC_ID = 'spp-sci-edu-portal-2026'; // Default shared sync ID for instant multi-device sync

export interface CloudPayload {
  students: Student[];
  activities: Activity[];
  updatedAt: string;
}

/**
 * Fetch latest students & activities from the cloud storage endpoint.
 */
export async function fetchFromCloud(syncId: string = DEFAULT_SYNC_ID): Promise<CloudPayload | null> {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${encodeURIComponent(syncId)}`, {
      method: 'GET',
      headers: {
        'X-Bin-Meta': 'false',
      },
    });

    if (!response.ok) {
      // Try fallback endpoint or key-value storage
      const fallbackRes = await fetch(`https://api.restful-api.dev/objects/${encodeURIComponent(syncId)}`);
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        return data.data as CloudPayload;
      }
      return null;
    }

    const data = await response.json();
    if (data && Array.isArray(data.students) && Array.isArray(data.activities)) {
      return data as CloudPayload;
    }
    return null;
  } catch (error) {
    console.warn('Cloud sync fetch warning:', error);
    return null;
  }
}

/**
 * Push latest students & activities to the cloud storage endpoint so all devices (phones & PCs) get updated data.
 */
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

    // Use a public key-value sync service or rest API endpoint
    const response = await fetch('https://api.restful-api.dev/objects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: syncId,
        name: 'SPP_Cloud_Data',
        data: payload,
      }),
    });

    return response.ok;
  } catch (error) {
    console.warn('Cloud sync push warning:', error);
    return false;
  }
}

export function getStoredSyncId(): string {
  return localStorage.getItem(CLOUD_SYNC_KEY) || DEFAULT_SYNC_ID;
}

export function setStoredSyncId(syncId: string): void {
  localStorage.setItem(CLOUD_SYNC_KEY, syncId);
}
