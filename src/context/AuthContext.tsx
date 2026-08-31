import {
    useEffect,
    useState,
    type ReactNode,
} from 'react';

import * as authApi from '../api/auth';
import type {
    AuthContextValue,
    LoginPayload,
    User,
} from '../types';

import { AuthContext } from './AuthContext';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');

        return stored
            ? (JSON.parse(stored) as User)
            : null;
    });

    const [isLoading, setIsLoading] = useState<boolean>(() =>
        Boolean(localStorage.getItem('access_token'))
    );

    // Restore and verify the session when the application starts.
    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            return;
        }

        authApi
            .fetchMe()
            .then((freshUser) => {
                setUser(freshUser);

                localStorage.setItem(
                    'user',
                    JSON.stringify(freshUser)
                );
            })
            .catch(() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');

                setUser(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    async function login(payload: LoginPayload): Promise<void> {
        const response = await authApi.login(payload);

        localStorage.setItem(
            'access_token',
            response.access_token
        );

        localStorage.setItem(
            'refresh_token',
            response.refresh_token
        );

        localStorage.setItem(
            'user',
            JSON.stringify(response.user)
        );

        setUser(response.user);
    }

    function logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        setUser(null);
    }

    const value: AuthContextValue = {
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}