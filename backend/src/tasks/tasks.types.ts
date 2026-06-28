import { Task } from '@prisma/client';

export type TaskResponse = Task;

export const TASK_EVENTS = {
  CREATED: 'task:created',
  UPDATED: 'task:updated',
  DELETED: 'task:deleted',
} as const;

export interface TaskDeletedPayload {
  id: string;
  userId: string;
}
