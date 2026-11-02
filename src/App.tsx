import { useState } from 'react';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import { initialTasks } from './data/initialTasks';
import type { Task, TaskFilter } from './types/task';
import './App.css';

type SortOrder = 'default' | 'priority';

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');

  const handleAddTask = (newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleToggleTask = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== id)
    );
  };

  const handleClearCompleted = () => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => !task.completed)
    );
  };

  const completedCount = tasks.filter((task) => task.completed).length;
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
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );
  }

  return (
    <div className="app">
      <Header />

      <main className="app__main">
        <div className="welcome-section">
          <div>
            <span className="welcome-section__eyebrow">
              YOUR LEARNING SPACE
            </span>
            <h1>My Study Planner</h1>
            <p>Plan your tasks and keep track of your progress.</p>
          </div>
        </div>

        <TaskStats tasks={tasks} />

        <div className="app__content">
          <TaskForm onAddTask={handleAddTask} />

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
                onChange={(event) => setSearchQuery(event.target.value)}
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
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          </section>
        </div>
      </main>

      <footer className="app__footer">
        Study Planner · Keep learning, keep growing.
      </footer>
    </div>
  );
}

export default App;
