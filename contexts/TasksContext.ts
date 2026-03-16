import { createContext } from 'react';
import { TaskSubmitData } from '@/api';

export interface ToDoItem {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
  priority?: number;
}

export interface TasksContextType {
  tasks: ToDoItem[];
  addTask: (data: TaskSubmitData) => Promise<ToDoItem | null>;
  loadMoreCompleted: () => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  isLoading: boolean;
  hasMoreCompleted: boolean;
  setSearch: (query: string) => void;
  updateTask: (id: string, partial: Partial<ToDoItem>) => Promise<void>;
}

export const TasksContext = createContext<TasksContextType | undefined>(undefined);
