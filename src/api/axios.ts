import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { AxiosError } from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// A request that's been retried once already gets flagged, so a
// second 401 on the same request fails for good instead of looping.
interface RetryableConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// ── Request interceptor: attach the access token to every call ──
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
});

// While a refresh is already in flight, every other request that
// hits a 401 at the same time waits on this promise instead of
// firing its own /api/refresh call — one refresh, not five.
let refreshPromise: Promise<string> | null = null;

function clearSessionAndRedirect(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

async function refreshAccessToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    // Plain axios, not the `api` instance — going through `api` here
    // would loop this call back through this same interceptor.
    const response = await axios.post(
        `${BASE_URL}/refresh`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
    );

    const newAccessToken: string = response.data.access_token;
    localStorage.setItem('access_token', newAccessToken);
    return newAccessToken;
}

// ── Response interceptor: on 401, refresh once and retry ──
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableConfig | undefined;

        const isUnauthorized = error.response?.status === 401;
        const isAuthEndpoint =
            originalRequest?.url?.includes('/login') ||
            originalRequest?.url?.includes('/refresh');

        if (!isUnauthorized || !originalRequest || originalRequest._retry || isAuthEndpoint) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            // Step 1: reuse an in-flight refresh, or start a new one.
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken().finally(() => {
                    refreshPromise = null;
                });
            }
            const newAccessToken = await refreshPromise;

            // Step 2: patch the new token onto the original request and
            // replay it exactly once.
            originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
            return api(originalRequest);
        } catch (refreshError) {
            // Step 3: refresh itself failed (refresh token expired/invalid)
            // — there's no recovering, so log the user out.
            clearSessionAndRedirect();
            return Promise.reject(refreshError);
        }
    }
);

export default api;