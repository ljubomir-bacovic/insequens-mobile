import { isAxiosError } from 'axios';
import axiosInstance from '@/services/axiosInstance';
import * as SecureStore from 'expo-secure-store';

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
}

export const loginUser = async (userData: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', userData);
    return response.data;
  } catch (error: unknown) {
    let message = 'Invalid email or password. Please try again.';

    if (!isAxiosError(error)) {
      throw new Error(message);
    }

    const data = error.response?.data;

    if (!error.response) {
      message = 'Unable to connect to the server. Please check your connection and try again.';
    } else if (typeof data === 'string') {
      const trimmed = data.trim();
      if (trimmed && !trimmed.endsWith(':')) {
        message = trimmed;
      }
    } else if (Array.isArray(data)) {
      const descriptions = data
        .map((e: unknown) =>
          e && typeof e === 'object'
            ? ((e as Record<string, string>).description || (e as Record<string, string>).message || '')
            : ''
        )
        .filter(Boolean);
      if (descriptions.length > 0) {
        message = descriptions[0];
      }
    } else if (data && typeof data === 'object') {
      const raw = (data as Record<string, unknown>).detail ||
        (data as Record<string, unknown>).message ||
        (data as Record<string, unknown>).title ||
        (data as Record<string, unknown>).error || '';
      const trimmed = String(raw).trim();
      if (trimmed && !trimmed.endsWith(':')) {
        message = trimmed;
      }
    }

    throw new Error(message);
  }
};

interface RegisterData {
  email: string;
  password: string;
}

export const registerUser = async (form: RegisterData) => {
  return axiosInstance.post('/auth/register', form);
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('refreshToken');
};

export const confirmEmail = async (userId: string, token: string) => {
  return axiosInstance.get('/auth/confirm-email', {
    params: { userId, token },
  });
};

export const getToDoItems = (
  isCompleted = false,
  page?: number,
  pageSize?: number
) => {
  const params: Record<string, string | number | boolean> = { isCompleted };

  if (page !== undefined) {
    params.page = page;
  }

  if (pageSize !== undefined) {
    params.pageSize = pageSize;
  }

  return axiosInstance.get('/ToDoItem', { params });
};

export interface TaskSubmitData {
  name: string;
  description: string | null;
  priority: string | null;
  dueDate: string | null;
}

export const addToDoItem = (payload: TaskSubmitData) => {
  return axiosInstance.post('/ToDoItem', payload);
};

export const updateCompletionStatus = async (id: string) => {
  return axiosInstance.patch(`/ToDoItem/${id}/togglecomplete`);
};

export const getToDoItemDetails = async (itemId: string) => {
  return axiosInstance.get(`/todoitem/${itemId}`);
};

export const deleteToDoItem = async (itemId: string) => {
  return axiosInstance.delete(`/todoitem/${itemId}`);
};

export const updateToDoItemPriority = async (itemId: string, priority: number) => {
  return axiosInstance.patch(`/todoitem/${itemId}/priority`, priority);
};

export const updateToDoItemName = async (itemId: string, name: string) => {
  return axiosInstance.patch(`/todoitem/${itemId}/name`, name);
};

export const updateToDoItemDescription = async (itemId: string, description: string) => {
  return axiosInstance.patch(`/todoitem/${itemId}/description`, description);
};

export const updateToDoItemDueDate = async (itemId: string, duedate: string) => {
  return axiosInstance.patch(`/todoitem/${itemId}/duedate`, duedate);
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw error.response?.data || 'Something went wrong. Please try again.';
    }
    throw 'Something went wrong. Please try again.';
  }
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', {
      email,
      token,
      newPassword,
    });
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw error.response?.data || 'Something went wrong. Please try again.';
    }
    throw 'Something went wrong. Please try again.';
  }
};
