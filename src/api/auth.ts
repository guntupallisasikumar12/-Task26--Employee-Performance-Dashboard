import api from './axios';
import type { AuthResponse, LoginPayload, User } from '../types';

export const login = (payload: LoginPayload): Promise<AuthResponse> =>
    api.post('/login', payload).then((r) => r.data);

export const fetchMe = (): Promise<User> => api.get('/me').then((r) => r.data);