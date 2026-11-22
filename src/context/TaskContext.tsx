import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Task } from '../types/task';
import { taskRepository } from '../repositories/taskRepository';
import { TaskContext } from './TaskContextValue';

interface TaskProviderProps {
  children: ReactNode;
}

interface PendingDelete {
  task: Task;
  index: number;
}

const DELETE_DELAY = 5000;

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [locallyCreatedTasks, setLocallyCreatedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const isLocallyCreated = useCallback(
    (id: number) => locallyCreatedTasks.some((task) => task.id === id),
    [locallyCreatedTasks],
  );

  const loadTasks = useCallback(
    async (page: number, query: string, signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const limit = 10;
        const skip = (page - 1) * limit;
        const normalizedQuery = query.trim().toLowerCase();

        if (normalizedQuery) {
          const apiResult = await taskRepository.search(
            normalizedQuery,
            1000,
            0,
            signal,
          );

          if (signal?.aborted) return;

          const localMatches = locallyCreatedTasks.filter((task) =>
            task.title.toLowerCase().includes(normalizedQuery),
          );

          const tasksById = new Map<number, Task>();

          [...apiResult.tasks, ...localMatches].forEach((task) => {
            tasksById.set(task.id, task);
          });

          const matchingTasks = Array.from(tasksById.values());

          setTasks(matchingTasks.slice(skip, skip + limit));
          setTotal(matchingTasks.length);
        } else {
          const result = await taskRepository.getAll(limit, skip, signal);

          if (signal?.aborted) return;

          const localStart = Math.max(0, skip - result.total);
          const localTasksForPage = locallyCreatedTasks.slice(
            localStart,
            localStart + Math.max(0, limit - result.tasks.length),
          );

          setTasks([...result.tasks, ...localTasksForPage]);
          setTotal(result.total + locallyCreatedTasks.length);
        }
      } catch (err) {
        if (signal?.aborted) return;

        setError(
          err instanceof Error ? err.message : 'Failed to load tasks.',
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [locallyCreatedTasks],
  );

  const addTask = async (task: Task): Promise<Task> => {
    setError(null);

    try {
      const createdTask = await taskRepository.create(task);

      const taskWithId: Task = {
        ...task,
        id: createdTask.id,
      };

      setLocallyCreatedTasks((previous) => [...previous, taskWithId]);
      setTasks((previous) => [...previous, taskWithId]);
      setTotal((previous) => previous + 1);

      return taskWithId;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create task.',
      );
      throw err;
    }
  };

  const toggleTask = async (id: number) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const updatedTask = {
      ...task,
      completed: !task.completed,
    };

    setTasks((previous) =>
      previous.map((item) => (item.id === id ? updatedTask : item)),
    );

    if (isLocallyCreated(id)) {
      setLocallyCreatedTasks((previous) =>
        previous.map((item) => (item.id === id ? updatedTask : item)),
      );
      return;
    }

    setError(null);

    try {
      await taskRepository.update(id, {
        completed: updatedTask.completed,
      });
    } catch (err) {
      setTasks((previous) =>
        previous.map((item) => (item.id === id ? task : item)),
      );

      setError(
        err instanceof Error ? err.message : 'Failed to update task.',
      );
      throw err;
    }
  };

  const updateTask = async (updatedTask: Task) => {
    const previousTask = tasks.find(
      (item) => item.id === updatedTask.id,
    );

    if (!previousTask) return;

    setError(null);

    if (isLocallyCreated(updatedTask.id)) {
      setTasks((previous) =>
        previous.map((item) =>
          item.id === updatedTask.id ? updatedTask : item,
        ),
      );

      setLocallyCreatedTasks((previous) =>
        previous.map((item) =>
          item.id === updatedTask.id ? updatedTask : item,
        ),
      );

      return;
    }

    try {
      await taskRepository.update(updatedTask.id, {
        title: updatedTask.title,
        completed: updatedTask.completed,
        description: updatedTask.description,
      });

      setTasks((previous) =>
        previous.map((item) =>
          item.id === updatedTask.id ? updatedTask : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update task.',
      );
      throw err;
    }
  };

  const deleteTask = async (id: number) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    if (pendingDelete && !isLocallyCreated(pendingDelete.task.id)) {
      void taskRepository
        .delete(pendingDelete.task.id)
        .catch((err: unknown) => {
          setError(
            err instanceof Error ? err.message : 'Failed to delete task.',
          );
        });
    }

    const index = tasks.findIndex((item) => item.id === id);

    setPendingDelete({ task, index });

    setTasks((previous) =>
      previous.filter((item) => item.id !== id),
    );

    setTotal((previous) => Math.max(0, previous - 1));
  };

  const undoDelete = () => {
    if (!pendingDelete) return;

    setTasks((previous) => {
      const restored = [...previous];

      restored.splice(
        Math.min(pendingDelete.index, restored.length),
        0,
        pendingDelete.task,
      );

      return restored;
    });

    setTotal((previous) => previous + 1);
    setPendingDelete(null);
  };

  useEffect(() => {
    if (!pendingDelete) return;

    const taskToDelete = pendingDelete.task;

    const timer = window.setTimeout(() => {
      const deletePromise = isLocallyCreated(taskToDelete.id)
        ? Promise.resolve()
        : taskRepository.delete(taskToDelete.id);

      void deletePromise
        .catch((err: unknown) => {
          setError(
            err instanceof Error ? err.message : 'Failed to delete task.',
          );
        })
        .finally(() => {
          setLocallyCreatedTasks((previous) =>
            previous.filter((task) => task.id !== taskToDelete.id),
          );

          setPendingDelete((current) =>
            current?.task.id === taskToDelete.id ? null : current,
          );
        });
    }, DELETE_DELAY);

    return () => window.clearTimeout(timer);
  }, [pendingDelete, isLocallyCreated]);

  const clearCompleted = async () => {
    const completedTasks = tasks.filter((task) => task.completed);

    try {
      for (const task of completedTasks) {
        if (!isLocallyCreated(task.id)) {
          await taskRepository.delete(task.id);
        }
      }

      const completedIds = new Set(
        completedTasks.map((task) => task.id),
      );

      setTasks((previous) =>
        previous.filter((task) => !completedIds.has(task.id)),
      );

      setLocallyCreatedTasks((previous) =>
        previous.filter((task) => !completedIds.has(task.id)),
      );

      setTotal((previous) =>
        Math.max(0, previous - completedTasks.length),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to clear completed tasks.',
      );
      throw err;
    }
  };

  const retry = () => setError(null);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        total,
        loadTasks,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        clearCompleted,
        retry,
        pendingDelete: pendingDelete?.task ?? null,
        undoDelete,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
