/**
 * Device Fingerprinting and Word Usage Tracking Utility
 * 
 * This utility creates a device fingerprint and syncs word usage with the backend API.
 * The fingerprint survives browser data clearing and device switching via server-side tracking.
 */

let cachedFingerprint: string | null = null;

/**
 * Generate a device fingerprint based on browser/device characteristics
 * This is a simple fingerprinting method. For production, consider using a library like FingerprintJS
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  try {
    // Try to use FingerprintJS if available
    const fp = await import('@fingerprintjs/fingerprintjs');
    const fpInstance = await fp.load();
    const result = await fpInstance.get();
    cachedFingerprint = result.visitorId;
    return result.visitorId;
  } catch (error) {
    // Fallback to simple fingerprinting
    console.warn('FingerprintJS not available, using fallback fingerprinting');
    cachedFingerprint = generateFallbackFingerprint();
    return cachedFingerprint;
  }
}

/**
 * Generate a simple device fingerprint if FingerprintJS is not available
 */
function generateFallbackFingerprint(): string {
  const fingerprints = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    !!window.localStorage,
    !!window.sessionStorage,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency || 'unknown',
    (navigator as any).deviceMemory || 'unknown',
  ];

  const fingerprintString = fingerprints.join('|');
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return 'fp_' + Math.abs(hash).toString(36);
}

/**
 * Sync word usage with the backend API
 */
export async function syncWordUsage(
  action: 'add' | 'subtract' | 'get' | 'reset',
  wordCount?: number
): Promise<{ wordUsage: number; maxWords: number; month: string } | null> {
  try {
    const fingerprint = await getDeviceFingerprint();

    const response = await fetch('/api/usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fingerprint,
        wordCount: wordCount || 0,
        action,
      }),
    });

    if (!response.ok) {
      console.error('Failed to sync word usage:', response.statusText);
      return null;
    }

    const data = await response.json();
    return {
      wordUsage: data.wordUsage,
      maxWords: data.maxWords,
      month: data.month,
    };
  } catch (error) {
    console.error('Error syncing word usage:', error);
    return null;
  }
}

/**
 * Get current word usage from the backend
 */
export async function getWordUsage(): Promise<{
  wordUsage: number;
  maxWords: number;
  month: string;
} | null> {
  try {
    const fingerprint = await getDeviceFingerprint();

    const response = await fetch(`/api/usage?fingerprint=${encodeURIComponent(fingerprint)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to get word usage:', response.statusText);
      return null;
    }

    const data = await response.json();
    return {
      wordUsage: data.wordUsage,
      maxWords: data.maxWords,
      month: data.month,
    };
  } catch (error) {
    console.error('Error getting word usage:', error);
    return null;
  }
}

/**
 * Add word usage
 */
export async function addWordUsage(wordCount: number): Promise<{
  wordUsage: number;
  maxWords: number;
  month: string;
} | null> {
  return syncWordUsage('add', wordCount);
}

/**
 * Subtract word usage
 */
export async function subtractWordUsage(wordCount: number): Promise<{
  wordUsage: number;
  maxWords: number;
  month: string;
} | null> {
  return syncWordUsage('subtract', wordCount);
}

/**
 * Reset word usage (admin only - should have additional security)
 */
export async function resetWordUsage(): Promise<{
  wordUsage: number;
  maxWords: number;
  month: string;
} | null> {
  return syncWordUsage('reset');
}
