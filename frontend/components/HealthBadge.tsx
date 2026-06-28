'use client';

import { useHealth } from '@/hooks/useHealth';

const stateStyles = {
  loading: 'bg-zinc-100 text-zinc-600',
  healthy: 'bg-emerald-50 text-emerald-700',
  unhealthy: 'bg-rose-50 text-rose-700',
} as const;

const stateLabels = {
  loading: 'Checking API',
  healthy: 'API Healthy',
  unhealthy: 'API Offline',
} as const;

export function HealthBadge() {
  const state = useHealth();

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${stateStyles[state]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          state === 'healthy'
            ? 'bg-emerald-500'
            : state === 'unhealthy'
              ? 'bg-rose-500'
              : 'bg-zinc-400'
        }`}
      />
      {stateLabels[state]}
    </span>
  );
}
