import type { Task } from "../types/task";
import { initialTasks } from "../data/initialTasks";

export interface PendingDelete {
  task: Task;
  index: number;
}

export interface TaskState {
  tasks: Task[];
  pendingDelete: PendingDelete | null;
}

export type TaskAction =
  | { type: "ADD_TASK"; payload: Task }
  | { type: "TOGGLE_TASK"; payload: number }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: number }
  | { type: "CONFIRM_DELETE"; payload: number }
  | { type: "UNDO_DELETE" }
  | { type: "CLEAR_COMPLETED" };

export const initialTaskState: TaskState = {
  tasks: initialTasks,
  pendingDelete: null,
};

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed }
            : task,
        ),
      };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task,
        ),
      };

    case "DELETE_TASK": {
      const index = state.tasks.findIndex((task) => task.id === action.payload);

      if (index === -1) {
        return state;
      }

      const taskToDelete = state.tasks[index];

      return {
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        pendingDelete: {
          task: taskToDelete,
          index,
        },
      };
    }

    case "CONFIRM_DELETE":
      if (state.pendingDelete?.task.id !== action.payload) {
        return state;
      }

      return {
        ...state,
        pendingDelete: null,
      };

    case "UNDO_DELETE": {
      if (!state.pendingDelete) {
        return state;
      }

      const restoredTasks = [...state.tasks];
      const restoreIndex = Math.min(
        state.pendingDelete.index,
        restoredTasks.length,
      );

      restoredTasks.splice(restoreIndex, 0, state.pendingDelete.task);

      return {
        tasks: restoredTasks,
        pendingDelete: null,
      };
    }

    case "CLEAR_COMPLETED":
      return {
        tasks: state.tasks.filter((task) => !task.completed),
        pendingDelete: null,
      };

    default:
      return state;
  }
}
