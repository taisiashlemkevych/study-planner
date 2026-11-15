import axios from 'axios';

export class ApiError extends Error {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isCancel(error)) {
    return new ApiError('Запит було скасовано.');
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseMessage = error.response?.data?.message;

    if (typeof responseMessage === 'string') {
      return new ApiError(responseMessage, status);
    }

    if (error.code === 'ERR_NETWORK') {
      return new ApiError(
        'Не вдалося підключитися до сервера. Перевірте інтернет-з’єднання.',
      );
    }

    return new ApiError(
      `Помилка HTTP-запиту${status ? `: ${status}` : ''}.`,
      status,
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('Сталася невідома помилка.');
}
