import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { useTaskContext } from '../hooks/useTaskContext';
import { useTheme } from '../hooks/useTheme';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../hooks/useAuth';

import TaskFormDialog from '../components/TaskFormDialog';
import TaskFilters from '../components/TaskFilters';
import TaskList from '../components/TaskList';
import TaskStats from '../components/TaskStats';
import { Toast, type ToastType } from '../components/Toast';

import type { Priority, Task, TaskFilter } from '../types/task';
import type { TaskFormData } from '../schemas/taskSchema';

type SortOrder = 'default' | 'priority';
type PriorityFilter = 'all' | Priority;

interface ToastMessage {
  message: string;
  type: ToastType;
}

function TasksPage() {
  const {
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
    undoDelete,
    pendingDelete,
  } = useTaskContext();

  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = searchParams.get('status');

  const filter: TaskFilter =
    statusParam === 'active' || statusParam === 'completed'
      ? statusParam
      : 'all';

  const priorityParam = searchParams.get('priority');

  const priorityFilter: PriorityFilter =
    priorityParam === 'low' ||
    priorityParam === 'medium' ||
    priorityParam === 'high'
      ? priorityParam
      : 'all';

  const sortOrder: SortOrder =
    searchParams.get('sort') === 'priority'
      ? 'priority'
      : 'default';

  const updateQueryParam = (
    key: string,
    value: string,
    defaultValue: string,
  ) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      if (value === defaultValue) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }

      return nextParams;
    });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>(
    'create',
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const previousPendingDelete = useRef<string | null>(null);
  const undoWasClicked = useRef(false);

  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }

    return true;
  };

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingTask(null);
  }, []);

  const openCreateDialog = () => {
    if (!requireAuth()) return;

    setEditingTask(null);
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    if (!requireAuth()) return;

    setEditingTask(task);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleUndoDelete = () => {
    undoWasClicked.current = true;
    undoDelete();
  };

  useEffect(() => {
    if (pendingDelete) {
      previousPendingDelete.current = pendingDelete.title;
      return;
    }

    if (previousPendingDelete.current !== null) {
      const deletedTaskTitle = previousPendingDelete.current;
      previousPendingDelete.current = null;

      if (undoWasClicked.current) {
        undoWasClicked.current = false;
        return;
      }

      setToast({
        message: `"${deletedTaskTitle}" was permanently deleted.`,
        type: 'success',
      });
    }
  }, [pendingDelete]);

  useEffect(() => {
    const controller = new AbortController();

    void loadTasks(page, debouncedSearch, controller.signal);

    return () => {
      controller.abort();
    };
  }, [page, debouncedSearch, reloadKey, loadTasks]);

  useEffect(() => {
    document.title = 'Study Planner - Tasks';
  }, []);

  const completedCount = tasks.filter(
    (task) => task.completed,
  ).length;

  const activeCount = tasks.length - completedCount;

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filter === 'all' ||
      (filter === 'completed' && task.completed) ||
      (filter === 'active' && !task.completed);

    const matchesPriority =
      priorityFilter === 'all' ||
      task.priority === priorityFilter;

    return matchesStatus && matchesPriority;
  });

  const priorityOrder: Record<Priority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const displayedTasks = [...filteredTasks];

  if (sortOrder === 'priority') {
    displayedTasks.sort(
      (a, b) =>
        priorityOrder[b.priority] - priorityOrder[a.priority],
    );
  }

  const handleDialogSubmit = async (data: TaskFormData) => {
    if (!requireAuth()) return;

    try {
      if (dialogMode === 'create') {
        const newTask: Task = {
          id: Date.now(),
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          completed: false,
          createdBy: user?.username,
          createdAt: new Date().toISOString(),
        };

        await addTask(newTask);

        setToast({
          message: 'Task created successfully.',
          type: 'success',
        });

        setPage(1);
        setReloadKey((key) => key + 1);
      } else {
        if (!editingTask) return;

        const updatedTask: Task = {
          ...editingTask,
          ...data,
        };

        await updateTask(updatedTask);

        setToast({
          message: 'Task updated successfully.',
          type: 'success',
        });
      }

      closeDialog();
    } catch {
      setToast({
        message:
          dialogMode === 'create'
            ? 'Failed to create task.'
            : 'Failed to update task.',
        type: 'error',
      });

      throw new Error('Task could not be saved.');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!requireAuth()) return;

    try {
      await deleteTask(id);

      setToast({
        message: 'Task deleted successfully.',
        type: 'success',
      });
    } catch {
      setToast({
        message: 'Failed to delete task.',
        type: 'error',
      });
    }
  };

  const handleToggleTask = async (id: number) => {
    if (!requireAuth()) return;

    try {
      await toggleTask(id);
    } catch {
      setToast({
        message: 'Failed to update task status.',
        type: 'error',
      });
    }
  };

  const handleClearCompleted = async () => {
    if (!requireAuth()) return;

    try {
      await clearCompleted();

      setToast({
        message: 'Completed tasks cleared successfully.',
        type: 'success',
      });
    } catch {
      setToast({
        message: 'Failed to clear completed tasks.',
        type: 'error',
      });
    }
  };

  const handleViewTask = (id: number) => {
    navigate(`/tasks/${id}`);
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <main className="app__main">
      <div className="welcome-section">
        <div>
          <span className="welcome-section__eyebrow">
            YOUR LEARNING SPACE
          </span>

          <h1>My Study Planner</h1>

          <p>
            Plan your tasks and keep track of your progress.
          </p>
        </div>

        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </div>

      <TaskStats tasks={tasks} />

      <div className="app__content">
        <section className="tasks-section">
          <div className="section-heading">
            <div>
              <h2>My tasks</h2>
              <p>
                {isAuthenticated
                  ? 'Manage your learning activities'
                  : 'Browse learning activities'}
              </p>
            </div>

            {isAuthenticated && (
              <button
                className="button button--primary"
                type="button"
                onClick={openCreateDialog}
              >
                + Add task
              </button>
            )}
          </div>

          <div className="task-tools">
            <input
              className="task-search"
              type="search"
              placeholder="Search tasks by title..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              aria-label="Search tasks by title"
            />

            <select
              className="task-sort"
              value={sortOrder}
              onChange={(event) =>
                updateQueryParam('sort', event.target.value, 'default')
              }
              aria-label="Sort tasks"
            >
              <option value="default">Default order</option>
              <option value="priority">Sort by priority</option>
            </select>

            <select
              className="task-sort"
              value={priorityFilter}
              onChange={(event) =>
                updateQueryParam('priority', event.target.value, 'all')
              }
              aria-label="Filter by priority"
            >
              <option value="all">All priorities</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>

          <TaskFilters
            filter={filter}
            onFilterChange={(value) =>
              updateQueryParam('status', value, 'all')
            }
            counts={{
              all: total,
              active: activeCount,
              completed: completedCount,
            }}
          />

          {isAuthenticated && completedCount > 0 && (
            <button
              className="clear-completed"
              onClick={handleClearCompleted}
              type="button"
            >
              Clear completed tasks ({completedCount})
            </button>
          )}

          {loading && (
            <div className="empty-state" role="status">
              <h3>Loading tasks...</h3>
              <p>Please wait while tasks are being loaded.</p>
            </div>
          )}

          {!loading && error && (
            <div className="empty-state" role="alert">
              <h3>Failed to load tasks</h3>
              <p>{error}</p>

              <button
                className="button button--primary"
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <TaskList
                tasks={displayedTasks}
                hasTasks={tasks.length > 0}
                canManage={isAuthenticated}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onEdit={openEditDialog}
                onView={handleViewTask}
              />

              {total > 0 && (
                <div className="pagination">
                  <button
                    className="button"
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) => current - 1)
                    }
                  >
                    Previous
                  </button>

                  <span>
                    Page {page} of {totalPages}
                  </span>

                  <button
                    className="button"
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {pendingDelete && isAuthenticated && (
        <div className="undo-toast" role="status">
          <div className="undo-toast__content">
            <div className="undo-toast__message">
              <span className="undo-toast__title">
                Task will be deleted
              </span>

              <span className="undo-toast__description">
                "{pendingDelete.title}" will be deleted in 5 seconds.
              </span>
            </div>

            <button
              className="undo-toast__button"
              type="button"
              onClick={handleUndoDelete}
            >
              Undo
            </button>
          </div>

          <div className="undo-toast__timer">
            <div className="undo-toast__timer-progress" />
          </div>
        </div>
      )}

      <TaskFormDialog
        open={isDialogOpen}
        mode={dialogMode}
        task={editingTask ?? undefined}
        onClose={closeDialog}
        onSubmit={handleDialogSubmit}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}
    </main>
  );
}

export default TasksPage;
