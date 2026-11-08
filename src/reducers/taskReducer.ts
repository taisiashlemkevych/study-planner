import type { Task } from "../types/task";

export type TaskAction =
  | { type: "ADD_TASK"; payload: Task }
  | { type: "TOGGLE_TASK"; payload: number }
  | { type: "DELETE_TASK"; payload: number }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "CLEAR_COMPLETED" };

export function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case "ADD_TASK":
      return [...state, action.payload];

    case "TOGGLE_TASK":
      return state.map((task) =>
        task.id === action.payload
          ? { ...task, completed: !task.completed }
          : task,
      );

    case "DELETE_TASK":
      return state.filter((task) => task.id !== action.payload);

    case "UPDATE_TASK":
      return state.map((task) =>
        task.id === action.payload.id ? action.payload : task,
      );

    case "CLEAR_COMPLETED":
      return state.filter((task) => !task.completed);

    default:
      return state;
  }
}
