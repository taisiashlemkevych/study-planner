import type { Task } from './task';

export interface ApiTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface TodosResponse {
  todos: ApiTodo[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateTaskDto {
  todo: string;
  completed: boolean;
  userId: number;
}

export interface UpdateTaskDto {
  todo?: string;
  completed?: boolean;
}

export interface ApiTodoMutationResponse extends ApiTodo {
  isDeleted?: boolean;
  deletedOn?: string;
}

export interface PaginatedTasks {
  tasks: Task[];
  total: number;
  skip: number;
  limit: number;
}
