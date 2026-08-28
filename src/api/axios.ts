import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(
            "access_token"
        );

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    }
);

let isRefreshing = false;

let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];


const processQueue = (
    error: unknown,
    token: string | null = null
) => {

    failedQueue.forEach((request) => {

        if (error) {
            request.reject(error);
        } else {
            request.resolve(token!);
        }

    });

    failedQueue = [];
};


api.interceptors.response.use(

    (response) => response,

    async (error: AxiosError) => {

        const originalRequest = error.config as
            InternalAxiosRequestConfig & {
                _retry?: boolean;
            };

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            if (isRefreshing) {

                return new Promise((resolve, reject) => {

                    failedQueue.push({
                        resolve,
                        reject,
                    });

                }).then((token) => {

                    originalRequest.headers.Authorization =
                        `Bearer ${token}`;

                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;

            isRefreshing = true;

            const refreshToken =
                localStorage.getItem(
                    "refresh_token"
                );

            if (!refreshToken) {

                localStorage.clear();

                window.location.href = "/login";

                return Promise.reject(error);
            }

            try {

                const response = await axios.post(
                    "http://localhost:5000/api/refresh",
                    {},
                    {
                        headers: {
                            Authorization:
                                `Bearer ${refreshToken}`,
                        },
                    }
                );

                const newAccessToken =
                    response.data.access_token;

                localStorage.setItem(
                    "access_token",
                    newAccessToken
                );

                processQueue(
                    null,
                    newAccessToken
                );

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);

            } catch (refreshError) {

                processQueue(
                    refreshError,
                    null
                );

                localStorage.clear();

                window.location.href = "/login";

                return Promise.reject(
                    refreshError
                );

            } finally {

                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);


export default api;
