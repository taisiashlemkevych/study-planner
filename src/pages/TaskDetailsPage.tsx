import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { taskRepository } from '../repositories/taskRepository';
import { useTaskContext } from '../hooks/useTaskContext';
import { useAuth } from '../hooks/useAuth';
import TaskFormDialog from '../components/TaskFormDialog';
import type { TaskFormData } from '../schemas/taskSchema';
import type { Task } from '../types/task';

interface LoadedTask {
  id: number;
  task: Task;
}

interface LoadError {
  id: number;
  message: string;
}

function TaskDetailsPage() {
  const { taskId } = useParams();

  const { tasks, updateTask } = useTaskContext();
  const { isAuthenticated } = useAuth();

  const id = Number(taskId);
  const isValidId = Number.isSafeInteger(id) && id > 0;

  const existingTask = tasks.find((item) => item.id === id);

  const [loadedTask, setLoadedTask] = useState<LoadedTask | null>(null);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const task =
    existingTask ??
    (loadedTask?.id === id ? loadedTask.task : null);

  const error =
    loadError?.id === id ? loadError.message : null;

  const loading = isValidId && !task && !error;

  useEffect(() => {
    if (!isValidId || existingTask) {
      return;
    }

    const controller = new AbortController();

    const loadTask = async () => {
      try {
        const result = await taskRepository.getById(
          id,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setLoadedTask({ id, task: result });
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setLoadError({
            id,
            message:
              err instanceof Error
                ? err.message
                : 'Failed to load task details.',
          });
        }
      }
    };

    void loadTask();

    return () => {
      controller.abort();
    };
  }, [id, isValidId, existingTask]);

  useEffect(() => {
    document.title = task
      ? `Study Planner - ${task.title}`
      : 'Study Planner - Task Details';
  }, [task]);

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!task) return;

    try {
      const updatedTask: Task = {
        ...task,
        ...data,
      };

      await updateTask(updatedTask);

      setLoadedTask({ id, task: updatedTask });
      setIsDialogOpen(false);
    } catch {
      setLoadError({
        id,
        message: 'Failed to update task. Please try again.',
      });
    }
  };

  return (
    <main className="app__main">
      <section className="task-details-page">
        <Link to="/tasks" className="task-details-page__back">
          Back to tasks
        </Link>

        <div className="task-details-page__panel">
          <h1>Task details</h1>

          {!isValidId && (
            <div className="empty-state" role="alert">
              <h3>Invalid task ID</h3>
              <p>Please provide a valid task ID.</p>
            </div>
          )}

          {loading && (
            <p role="status">Loading task details...</p>
          )}

          {error && (
            <div className="empty-state" role="alert">
              <h3>Unable to load task</h3>
              <p>{error}</p>
            </div>
          )}

          {task && (
            <div className="task-details-page__content">
              <h2>{task.title}</h2>

              <div className="task-details-page__field">
                <strong>Description</strong>
                <p>
                  {task.description || 'No description provided'}
                </p>
              </div>

              <div className="task-details-page__field">
                <strong>Category</strong>
                <p>{task.category}</p>
              </div>

              <div className="task-details-page__field">
                <strong>Priority</strong>
                <p>{task.priority}</p>
              </div>

              <div className="task-details-page__field">
                <strong>Status</strong>
                <p>{task.completed ? 'Completed' : 'Active'}</p>
              </div>

              <div className="task-details-page__field">
                <strong>Created by</strong>
                <p>{task.createdBy ?? 'Not provided by API'}</p>
              </div>

              <div className="task-details-page__field">
                <strong>Created at</strong>
                <p>
                  {task.createdAt
                    ? new Date(task.createdAt).toLocaleString()
                    : 'Not provided by API'}
                </p>
              </div>

              {isAuthenticated && (
                <button
                  className="button button--primary"
                  type="button"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Edit task
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <TaskFormDialog
        open={isDialogOpen}
        mode="edit"
        task={task ?? undefined}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleUpdateTask}
      />
    </main>
  );
}

export default TaskDetailsPage;
