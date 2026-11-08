import { useContext } from 'react';
import { TaskContext } from '../context/TaskContextValue';

export function useTaskContext() {
  const context = useContext(TaskContext);

  if (context === undefined) {
    throw new Error(
      'useTaskContext must be used within TaskProvider'
    );
  }

  return context;
}
