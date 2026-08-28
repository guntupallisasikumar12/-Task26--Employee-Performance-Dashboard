import {
    createContext,
    useEffect,
    useState,
} from "react";

import type { ReactNode } from "react";

import api from "../api/axios";


export interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "manager";
}


interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
}


export const AuthContext =
    createContext<AuthContextType | null>(null);


interface AuthProviderProps {
    children: ReactNode;
}


export default function AuthProvider({
    children,
}: AuthProviderProps) {

    const [
        user,
        setUser,
    ] = useState<User | null>(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    /*
     * Restore the JWT session after
     * browser refresh.
     */
    useEffect(() => {

        const restoreSession = async () => {

            const accessToken =
                localStorage.getItem(
                    "access_token"
                );


            if (!accessToken) {

                setLoading(false);

                return;
            }


            try {

                const response =
                    await api.get("/me");


                setUser(
                    response.data.user
                );


            } catch (error) {

                console.error(
                    "Session restore failed:",
                    error
                );


                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "refresh_token"
                );

                setUser(null);


            } finally {

                setLoading(false);
            }
        };


        restoreSession();

    }, []);


    const login = (loggedInUser: User) => {

        setUser(
            loggedInUser
        );
    };


    const logout = () => {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );

        setUser(null);
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >

            {children}

        </AuthContext.Provider>
    );
}