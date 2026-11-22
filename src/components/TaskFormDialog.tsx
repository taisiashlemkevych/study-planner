import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { Task } from '../types/task';
import {
  taskSchema,
  type TaskFormData,
} from '../schemas/taskSchema';

interface TaskFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  task?: Task;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
}

function TaskFormDialog({
  open,
  mode,
  task,
  onClose,
  onSubmit,
}: TaskFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'General',
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      category: task?.category ?? 'General',
      priority: task?.priority ?? 'medium',
    });

    const focusTimer = window.setTimeout(() => {
      setFocus('title');
    }, 0);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, task, reset, setFocus, onClose]);

  if (!open) return null;

  const submitForm = async (data: TaskFormData) => {
    await onSubmit(data);
  };

  return (
    <div
      className="task-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <section
        className="task-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-dialog-title"
      >
        <div className="task-dialog__header">
          <div>
            <h2 id="task-dialog-title">
              {mode === 'create' ? 'Create task' : 'Edit task'}
            </h2>

            <p>
              {mode === 'create'
                ? 'Add a new learning activity.'
                : 'Update your learning activity.'}
            </p>
          </div>

          <button
            type="button"
            className="task-dialog__close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <form
          className="task-form"
          onSubmit={handleSubmit(submitForm)}
        >
          <div className="form-group">
            <label htmlFor="dialog-task-title">Title *</label>

            <input
              id="dialog-task-title"
              type="text"
              placeholder="What do you need to learn?"
              {...register('title')}
            />

            {errors.title && (
              <p className="task-dialog__error">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dialog-task-description">
              Description
            </label>

            <textarea
              id="dialog-task-description"
              placeholder="Add some details..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dialog-task-category">
              Category *
            </label>

            <input
              id="dialog-task-category"
              type="text"
              placeholder="e.g. React"
              {...register('category')}
            />

            {errors.category && (
              <p className="task-dialog__error">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dialog-task-priority">
              Priority
            </label>

            <select
              id="dialog-task-priority"
              {...register('priority')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="task-dialog__actions">
            <button
              className="button"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              className="button button--primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create task'
                  : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TaskFormDialog;
