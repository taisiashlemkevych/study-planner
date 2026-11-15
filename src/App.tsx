import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTaskContext } from './hooks/useTaskContext';
import { useTheme } from './hooks/useTheme';
import { useDebounce } from './hooks/useDebounce';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import { Toast, type ToastType } from './components/Toast';
import { taskRepository } from './repositories/taskRepository';
import type { Task, TaskFilter } from './types/task';
import './App.css';

type SortOrder = 'default' | 'priority';

interface ToastMessage {
  message: string;
  type: ToastType;
}

function App() {
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

  const [filter, setFilter] = useLocalStorage<TaskFilter>(
    'study-planner-filter',
    'all',
  );

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(
    null,
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  const previousPendingDelete = useRef<string | null>(null);
  const undoWasClicked = useRef(false);

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
    if (selectedTaskId === null) {
      return;
    }

    const controller = new AbortController();

    const loadDetails = async () => {
      try {
        const task = await taskRepository.getById(
          selectedTaskId,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setSelectedTask(task);
          setDetailsError(null);
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          const localTask = tasks.find((item) => item.id === selectedTaskId);

          if (localTask) {
            setSelectedTask(localTask);
            setDetailsError(null);
          } else {
            setDetailsError(
              err instanceof Error
                ? err.message
                : 'Failed to load task details.',
            );
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailsLoading(false);
        }
      }
    };

    void loadDetails();

    return () => {
      controller.abort();
    };
  }, [selectedTaskId, tasks]);

  const completedCount = tasks.filter(
    (task) => task.completed,
  ).length;

  const activeCount = tasks.length - completedCount;

  useEffect(() => {
    document.title = `Study Planner - ${activeCount} active tasks`;
  }, [activeCount]);

  const filteredTasks = tasks.filter((task) => {
    return (
      filter === 'all' ||
      (filter === 'completed' && task.completed) ||
      (filter === 'active' && !task.completed)
    );
  });

  const priorityOrder = {
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

  const handleAddTask = async (task: Task) => {
    try {
      await addTask(task);

      setToast({
        message: 'Task created successfully.',
        type: 'success',
      });
    } catch {
      setToast({
        message: 'Failed to create task.',
        type: 'error',
      });
    }
  };

  const handleUpdateTask = async (task: Task) => {
    try {
      await updateTask(task);

      setEditingTask(null);

      setToast({
        message: 'Task updated successfully.',
        type: 'success',
      });
    } catch {
      setToast({
        message: 'Failed to update task.',
        type: 'error',
      });
    }
  };

  const handleDeleteTask = async (id: number) => {
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
    setSelectedTask(null);
    setDetailsError(null);
    setDetailsLoading(true);
    setSelectedTaskId(id);
  };

  const handleCloseDetails = () => {
    setSelectedTaskId(null);
    setSelectedTask(null);
    setDetailsError(null);
    setDetailsLoading(false);
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className={`app app--${theme}`}>
      <Header />

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
          <TaskForm
            key={editingTask?.id ?? 'new-task'}
            onAddTask={handleAddTask}
            editingTask={editingTask}
            onUpdateTask={handleUpdateTask}
            onCancelEdit={() => setEditingTask(null)}
          />

          <section className="tasks-section">
            <div className="section-heading">
              <div>
                <h2>My tasks</h2>
                <p>Manage your learning activities</p>
              </div>
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
                  setSortOrder(event.target.value as SortOrder)
                }
                aria-label="Sort tasks"
              >
                <option value="default">Default order</option>
                <option value="priority">Sort by priority</option>
              </select>
            </div>

            <TaskFilters
              filter={filter}
              onFilterChange={setFilter}
              counts={{
                all: total,
                active: activeCount,
                completed: completedCount,
              }}
            />

            {completedCount > 0 && (
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
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onEdit={setEditingTask}
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
      </main>

      <footer className="app__footer">
        Study Planner · Keep learning, keep growing.
      </footer>

      {selectedTaskId !== null && (
        <section
          className="task-details"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-details-title"
        >
          <div className="task-details__content">
            <button
              className="button"
              type="button"
              onClick={handleCloseDetails}
            >
              Close
            </button>

            <h2 id="task-details-title">Task details</h2>

            {detailsLoading && (
              <p role="status">Loading details...</p>
            )}

            {detailsError && (
              <div role="alert">
                <p>{detailsError}</p>

                <button
                  className="button"
                  type="button"
                  onClick={() => handleViewTask(selectedTaskId)}
                >
                  Try again
                </button>
              </div>
            )}

            {selectedTask && !detailsLoading && (
              <>
                <h3>{selectedTask.title}</h3>

                <p>
                  Description:{' '}
                  {selectedTask.description ||
                    'No description provided'}
                </p>

                <p>Category: {selectedTask.category}</p>

                <p>Priority: {selectedTask.priority}</p>

                <p>
                  Status:{' '}
                  {selectedTask.completed ? 'Completed' : 'Active'}
                </p>
              </>
            )}
          </div>
        </section>
      )}

      {pendingDelete && (
        <div className="undo-toast" role="status">
          <div className="undo-toast__content">
            <div className="undo-toast__message">
              <span className="undo-toast__title">Task will be deleted</span>
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
}

export default App;
