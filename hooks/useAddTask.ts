import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';

export interface TaskFormSubmitData {
  name: string;
  description: string | null;
  priority: string | null;
  dueDate: string | null;
}

export function useAddTask() {
  const { addTask } = useTasks();
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = async (data: TaskFormSubmitData) => {
    try {
      setIsAdding(true);
      await addTask(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  return {
    handleAddTask,
    error,
    isAdding,
    setError,
    setIsAdding,
  };
}
