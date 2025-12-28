import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'letgo_release_history';

/**
 * Custom hook for tracking release history in localStorage
 */
export function useReleaseHistory() {
    const [releaseCount, setReleaseCount] = useState(0);

    // Load count from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                setReleaseCount(data.count || 0);
            }
        } catch (e) {
            console.warn('Failed to load release history:', e);
        }
    }, []);

    // Increment release count
    const recordRelease = useCallback(() => {
        setReleaseCount(prev => {
            const newCount = prev + 1;
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    count: newCount,
                    lastRelease: new Date().toISOString()
                }));
            } catch (e) {
                console.warn('Failed to save release history:', e);
            }
            return newCount;
        });
    }, []);

    return { releaseCount, recordRelease };
}
