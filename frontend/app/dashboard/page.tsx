'use client';

import { CreateTaskPanel, TaskList } from '@/components/TaskList';
import { PageContainer } from '@/components/ui';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';

function DashboardContent() {
  const { user } = useAuth();
  const { tasks, isLoading, error, reload } = useTasks(user?.id);

  return (
    <PageContainer
      title="Dashboard"
      description="Create, edit, and delete tasks. Changes sync instantly across connected clients."
    >
      <div className="mb-6">
        <CreateTaskPanel onCreated={reload} />
      </div>
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        onChanged={reload}
      />
    </PageContainer>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
