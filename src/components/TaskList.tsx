import type { Task } from '../types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  hasTasks: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

function TaskList({
  tasks,
  hasTasks,
  onToggle,
  onDelete,
}: TaskListProps) {
  if (!hasTasks) {
    return (
      <div className="empty-state">
        <h3>No tasks yet</h3>
        <p>Add your first learning task to get started.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <h3>No tasks found</h3>
        <p>There are no tasks matching this filter.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
