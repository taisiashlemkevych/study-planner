import type { TaskFilter } from '../types/task';

interface TaskFiltersProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

function TaskFilters({
  filter,
  onFilterChange,
  counts,
}: TaskFiltersProps) {
  const filters: {
    label: string;
    value: TaskFilter;
    count: number;
  }[] = [
    { label: 'All tasks', value: 'all', count: counts.all },
    { label: 'Active', value: 'active', count: counts.active },
    {
      label: 'Completed',
      value: 'completed',
      count: counts.completed,
    },
  ];

  return (
    <div className="task-filters">
      {filters.map((item) => (
        <button
          key={item.value}
          className={`task-filters__button ${
            filter === item.value ? 'task-filters__button--active' : ''
          }`}
          onClick={() => onFilterChange(item.value)}
          type="button"
        >
          {item.label}
          <span className="task-filters__count">{item.count}</span>
        </button>
      ))}
    </div>
  );
}

export default TaskFilters;
