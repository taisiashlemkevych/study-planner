import type { Task } from '../types/task';

interface TaskStatsProps {
  tasks: Task[];
}

function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;

  return (
    <section className="task-stats">
      <div className="stat-card">
        <span className="stat-card__label">Total tasks</span>
        <strong className="stat-card__value">{total}</strong>
      </div>

      <div className="stat-card stat-card--completed">
        <span className="stat-card__label">Completed</span>
        <strong className="stat-card__value">{completed}</strong>
      </div>

      <div className="stat-card stat-card--active">
        <span className="stat-card__label">Active</span>
        <strong className="stat-card__value">{active}</strong>
      </div>
    </section>
  );
}

export default TaskStats;
