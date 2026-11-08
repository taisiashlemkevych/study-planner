import { createContext } from "react";
import type { Task } from "../types/task";

export interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  updateTask: (task: Task) => void;
  clearCompleted: () => void;
  undoDelete: () => void;
  pendingDelete: Task | null;
}

export const TaskContext = createContext<TaskContextType | undefined>(
  undefined,
);
