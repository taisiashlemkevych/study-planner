import {
  useReducer,
  type ReactNode,
} from 'react';

import type { Task } from '../types/task';
import { initialTasks } from '../data/initialTasks';
import { taskReducer } from '../reducers/taskReducer';
import { TaskContext } from './TaskContextValue';

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, dispatch] = useReducer(
    taskReducer,
    initialTasks
  );

  const addTask = (task: Task) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const toggleTask = (id: number) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  };

  const deleteTask = (id: number) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const clearCompleted = () => {
    dispatch({ type: 'CLEAR_COMPLETED' });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        clearCompleted,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
