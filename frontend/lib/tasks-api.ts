import { api } from './api';
import type {
  CreateTaskInput,
  Task,
  TaskDeletedPayload,
  UpdateTaskInput,
} from '@/types/task';

export async function fetchTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>('/tasks');
  return data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data } = await api.post<Task>('/tasks', input);
  return data;
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const { data } = await api.patch<Task>(`/tasks/${id}`, input);
  return data;
}

export async function deleteTask(id: string): Promise<TaskDeletedPayload> {
  const { data } = await api.delete<TaskDeletedPayload>(`/tasks/${id}`);
  return data;
}
