import { createContext } from 'react';
import type { Task } from '../types/task';

export interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  total: number;
  loadTasks: (page: number, query: string, signal?: AbortSignal) => Promise<void>;
  addTask: (task: Task) => Promise<Task>;
  toggleTask: (id: number) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  clearCompleted: () => Promise<void>;
  retry: () => void;
  pendingDelete: Task | null;
  undoDelete: () => void;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined); 