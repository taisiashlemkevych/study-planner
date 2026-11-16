export type Priority = 'low' | 'medium' | 'high';

export type TaskFilter = 'all' | 'completed' | 'active';

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: string;
}
