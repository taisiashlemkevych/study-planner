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

function toTask(todo: ApiTodo): Task {
  return {
    id: todo.id,
    title: todo.todo,
    description: '',
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

    return toTask(response.data);
  },

  async update(
    id: number,
    task: Partial<Task>,
  ): Promise<Task> {
    const response = await httpClient.patch<ApiTodo>(
      `/todos/${id}`,
      toUpdateDto(task),
    );

    return toTask(response.data);
  },

  async delete(id: number): Promise<ApiTodoMutationResponse> {
    const response = await httpClient.delete<ApiTodoMutationResponse>(
      `/todos/${id}`,
    );

    return response.data;
  },
};
