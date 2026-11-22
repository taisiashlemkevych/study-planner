import type { Task } from '../types/task';

export const initialTasks: Task[] = [
  {
    id: 1,
    title: 'React Components',
    description: 'Опрацювати базові принципи компонентів React',
    completed: false,
    priority: 'high',
    category: 'React',
  },
  {
    id: 2,
    title: 'TypeScript Exercises',
    description: 'Виконати практичні вправи з TypeScript',
    completed: true,
    priority: 'medium',
    category: 'TypeScript',
  },
  {
    id: 3,
    title: 'JSX Practice',
    description: 'Навчитися працювати з JSX та props',
    completed: false,
    priority: 'low',
    category: 'React',
  },
];
