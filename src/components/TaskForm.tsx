import { useState, type SyntheticEvent  } from 'react';
import type { Priority, Task } from '../types/task';

interface TaskFormProps {
  onAddTask: (task: Task) => void;
}

function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      priority,
      completed: false,
    };

    onAddTask(newTask);

    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('medium');
  };

  return (
    <section className="task-form-section">
      <div className="section-heading">
        <div>
          <h2>Add new task</h2>
          <p>Create a new learning goal</p>
        </div>
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="task-title">Task title *</label>
          <input
            id="task-title"
            type="text"
            placeholder="What do you need to learn?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            placeholder="Add some details..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="task-category">Category</label>
            <input
              id="task-category"
              type="text"
              placeholder="e.g. React"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as Priority)
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <button className="button button--primary" type="submit">
          + Add task
        </button>
      </form>
    </section>
  );
}

export default TaskForm;
