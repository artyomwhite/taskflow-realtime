'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchTasks } from '@/lib/tasks-api';
import { getSocket } from '@/lib/socket';
import type { Task, TaskDeletedPayload } from '@/types/task';

const TASK_EVENTS = {
  CREATED: 'task:created',
  UPDATED: 'task:updated',
  DELETED: 'task:deleted',
} as const;

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchTasks();
        if (!cancelled) {
          setTasks(data);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load tasks');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    const frame = window.requestAnimationFrame(() => {
      void load();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const socket = getSocket(userId);

    const handleCreated = (task: Task) => {
      setTasks((current) => {
        if (current.some((item) => item.id === task.id)) {
          return current;
        }
        return [task, ...current];
      });
    };

    const handleUpdated = (task: Task) => {
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? task : item)),
      );
    };

    const handleDeleted = (payload: TaskDeletedPayload) => {
      setTasks((current) => current.filter((item) => item.id !== payload.id));
    };

    socket.on(TASK_EVENTS.CREATED, handleCreated);
    socket.on(TASK_EVENTS.UPDATED, handleUpdated);
    socket.on(TASK_EVENTS.DELETED, handleDeleted);

    return () => {
      socket.off(TASK_EVENTS.CREATED, handleCreated);
      socket.off(TASK_EVENTS.UPDATED, handleUpdated);
      socket.off(TASK_EVENTS.DELETED, handleDeleted);
    };
  }, [userId]);

  return {
    tasks,
    isLoading,
    error,
    reload: loadTasks,
    setTasks,
  };
}
