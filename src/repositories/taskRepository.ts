import type { Task } from '../types/task';
import type {
  ApiTodo,
  ApiTodoMutationResponse,
  CreateTaskDto,
  PaginatedTasks,
  TodosResponse,
  UpdateTaskDto,
} from '../types/apiTodo';
import { httpClient } from '../api/httpClient';

const LOCAL_DESCRIPTIONS_KEY = 'study-planner-task-descriptions';

function getLocalDescriptions(): Record<number, string> {
  try {
    const stored = localStorage.getItem(LOCAL_DESCRIPTIONS_KEY);
    return stored ? (JSON.parse(stored) as Record<number, string>) : {};
  } catch {
    return {};
  }
}

function saveLocalDescription(id: number, description: string): void {
  try {
    const descriptions = getLocalDescriptions();
    descriptions[id] = description;
    localStorage.setItem(LOCAL_DESCRIPTIONS_KEY, JSON.stringify(descriptions));
  } catch {
    // Keep API operations working if localStorage is unavailable.
  }
}

function toTask(todo: ApiTodo): Task {
  const descriptions = getLocalDescriptions();

  return {
    id: todo.id,
    title: todo.todo,
    description: descriptions[todo.id] ?? '',
    completed: todo.completed,
    priority: 'medium',
    category: 'General',
  };
}

function toCreateDto(task: Omit<Task, 'id'>): CreateTaskDto {
  return {
    todo: task.title,
    completed: task.completed,
    userId: 1,
  };
}

function toUpdateDto(task: Partial<Task>): UpdateTaskDto {
  const dto: UpdateTaskDto = {};

  if (task.title !== undefined) {
    dto.todo = task.title;
  }

  if (task.completed !== undefined) {
    dto.completed = task.completed;
  }

  return dto;
}

export const taskRepository = {
  async getAll(
    limit = 10,
    skip = 0,
    signal?: AbortSignal,
  ): Promise<PaginatedTasks> {
    const response = await httpClient.get<TodosResponse>('/todos', {
      params: { limit, skip },
      signal,
    });

    return {
      tasks: response.data.todos.map(toTask),
      total: response.data.total,
      skip: response.data.skip,
      limit: response.data.limit,
    };
  },

  async search(
    query: string,
    limit = 10,
    skip = 0,
    signal?: AbortSignal,
  ): Promise<PaginatedTasks> {
    const normalizedQuery = query.trim().toLowerCase();

    const response = await httpClient.get<TodosResponse>('/todos', {
      params: { limit: 0 },
      signal,
    });

    const filteredTasks = response.data.todos
      .map(toTask)
      .filter((task) => task.title.toLowerCase().includes(normalizedQuery));

    return {
      tasks: filteredTasks.slice(skip, skip + limit),
      total: filteredTasks.length,
      skip,
      limit,
    };
  },

  async getById(
    id: number,
    signal?: AbortSignal,
  ): Promise<Task> {
    const response = await httpClient.get<ApiTodo>(`/todos/${id}`, {
      signal,
    });

    return toTask(response.data);
  },

  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const response = await httpClient.post<ApiTodo>(
      '/todos/add',
      toCreateDto(task),
    );

    saveLocalDescription(response.data.id, task.description);
    return {
      ...toTask(response.data),
      description: task.description,
      priority: task.priority,
      category: task.category,
    };
  },

  async update(
    id: number,
    task: Partial<Task>,
  ): Promise<Task> {
    const response = await httpClient.patch<ApiTodo>(
      `/todos/${id}`,
      toUpdateDto(task),
    );

    if (task.description !== undefined) {
      saveLocalDescription(id, task.description);
    }

    return {
      ...toTask(response.data),
      description: task.description ?? getLocalDescriptions()[id] ?? '',
    };
  },

  async delete(id: number): Promise<ApiTodoMutationResponse> {
    const response = await httpClient.delete<ApiTodoMutationResponse>(
      `/todos/${id}`,
    );

    return response.data;
  },
};
