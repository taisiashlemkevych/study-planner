import { useState } from 'react';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import { initialTasks } from './data/initialTasks';
import type { Task, TaskFilter } from './types/task';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<TaskFilter>('all');

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

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

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

            <TaskFilters
              filter={filter}
              onFilterChange={setFilter}
            />

            <TaskList
              tasks={filteredTasks}
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
