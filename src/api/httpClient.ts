import axios from 'axios';
import { normalizeApiError } from './apiError';

const baseURL = import.meta.env.VITE_API_URL;

export const httpClient = axios.create({
  baseURL: baseURL.replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    return Promise.reject(normalizeApiError(error));
  },
);
