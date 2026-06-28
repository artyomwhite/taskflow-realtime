'use client';

import { useEffect, useState } from 'react';
import { fetchHealth } from '@/lib/health-api';

type HealthState = 'loading' | 'healthy' | 'unhealthy';

export function useHealth(pollIntervalMs = 30000) {
  const [state, setState] = useState<HealthState>('loading');

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const response = await fetchHealth();
        if (isMounted) {
          setState(response.status === 'ok' ? 'healthy' : 'unhealthy');
        }
      } catch {
        if (isMounted) {
          setState('unhealthy');
        }
      }
    };

    void checkHealth();
    const interval = setInterval(() => {
      void checkHealth();
    }, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return state;
}
