import type { TaskFilter } from '../types/task';

interface TaskFiltersProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

function TaskFilters({ filter, onFilterChange }: TaskFiltersProps) {
  const filters: { label: string; value: TaskFilter }[] = [
    { label: 'All tasks', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
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
        </button>
      ))}
    </div>
  );
}

export default TaskFilters;
