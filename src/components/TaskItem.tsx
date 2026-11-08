import type { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  return (
    <article
      className={`task-card ${task.completed ? 'task-card--completed' : ''
        }`}
    >
      <div className="task-card__main">
        <button
          className={`task-card__checkbox ${task.completed ? 'task-card__checkbox--checked' : ''
            }`}
          onClick={() => onToggle(task.id)}
          type="button"
          aria-label={task.completed ? 'Mark as active' : 'Mark as completed'}
        >
          {task.completed ? '✓' : ''}
        </button>

        <div className="task-card__content">
          <h3 className="task-card__title">{task.title}</h3>

          <p className="task-card__description">
            {task.description || 'No description provided'}
          </p>

          <div className="task-card__details">
            <span className="task-card__category">{task.category}</span>

            <span className={`priority priority--${task.priority}`}>
              {task.priority}
            </span>

            <span className="task-card__status">
              {task.completed ? 'Completed' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      <div className="task-card__actions">
        <button
          className="task-card__edit"
          onClick={() => onEdit(task)}
          type="button"
          aria-label={`Edit ${task.title}`}
        >
          Edit
        </button>

        <button
          className="task-card__delete"
          onClick={() => onDelete(task.id)}
          type="button"
          aria-label={`Delete ${task.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskItem;
