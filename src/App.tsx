import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import { Toast, type ToastType } from './components/Toast';
import { useTaskContext } from './hooks/useTaskContext';
import { useTheme } from './hooks/useTheme';
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
    'all'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const previousPendingDelete = useRef<string | null>(null);
  const undoWasClicked = useRef(false);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const activeCount = tasks.length - completedCount;

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed' && task.completed) ||
      (filter === 'active' && !task.completed);

    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());

    return matchesFilter && matchesSearch;
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
        priorityOrder[b.priority] - priorityOrder[a.priority]
    );
  }

  const handleAddTask = (task: Task) => {
    try {
      addTask(task);

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

  const handleUpdateTask = (task: Task) => {
    try {
      updateTask(task);
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

  const handleDeleteTask = (id: number) => {
    try {
      deleteTask(id);
    } catch {
      setToast({
        message: 'Failed to delete task.',
        type: 'error',
      });
    }
  };

  const handleUndoDelete = () => {
    undoWasClicked.current = true;
    undoDelete();
  };

  const handleClearCompleted = () => {
    try {
      clearCompleted();

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

  useEffect(() => {
    document.title = `Study Planner - ${activeCount} active tasks`;
  }, [activeCount]);

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
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
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
                all: tasks.length,
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

            <TaskList
              tasks={displayedTasks}
              hasTasks={tasks.length > 0}
              onToggle={toggleTask}
              onDelete={handleDeleteTask}
              onEdit={setEditingTask}
            />
          </section>
        </div>
      </main>

      <footer className="app__footer">
        Study Planner · Keep learning, keep growing.
      </footer>

      {pendingDelete && (
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
