'use client';

import { useState } from 'react';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui';
import { createTask, deleteTask, updateTask } from '@/lib/tasks-api';
import {
  TASK_STATUS_LABELS,
  type Task,
  type TaskStatus,
} from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onChanged: () => Promise<void>;
}

function statusBadgeClass(status: TaskStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700';
    case 'IN_PROGRESS':
      return 'bg-amber-50 text-amber-700';
    default:
      return 'bg-zinc-100 text-zinc-700';
  }
}

export function TaskList({ tasks, isLoading, error, onChanged }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading tasks...</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="text-sm text-zinc-600">No tasks yet. Create your first one.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <article
            key={task.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-medium text-zinc-900">{task.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(task.status)}`}
                  >
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                </div>
                {task.description ? (
                  <p className="text-sm text-zinc-600">{task.description}</p>
                ) : null}
                <p className="text-xs text-zinc-400">
                  Updated {new Date(task.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingTask(task)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  isLoading={deletingId === task.id}
                  onClick={async () => {
                    setDeletingId(task.id);
                    try {
                      await deleteTask(task.id);
                      await onChanged();
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editingTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Edit Task</h2>
            <TaskForm
              initialTask={editingTask}
              submitLabel="Save Changes"
              onCancel={() => setEditingTask(null)}
              onSubmit={async (values) => {
                await updateTask(editingTask.id, values);
                setEditingTask(null);
                await onChanged();
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

interface CreateTaskPanelProps {
  onCreated: () => Promise<void>;
}

export function CreateTaskPanel({ onCreated }: CreateTaskPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button type="button" onClick={() => setIsOpen(true)}>
        Create Task
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">New Task</h2>
        <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </div>
      <TaskForm
        submitLabel="Create Task"
        onSubmit={async (values) => {
          await createTask(values);
          setIsOpen(false);
          await onCreated();
        }}
      />
    </div>
  );
}
