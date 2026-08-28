import { useCallback, useState, } from "react";

import type { Toast, } from "../types";

let toastId = 0; export default function useToast() {
    const [toasts, setToasts,] = useState<Toast[]>([]);

    const showToast = useCallback(
        (message: string, type: "success" | "error") => {
            const id = ++toastId;

            const newToast: Toast = { id, message, type, };

            setToasts((previous) => [...previous, newToast,]);

            /* * Automatically remove the toast * after 3 seconds. */

            setTimeout(() => {
                setToasts((previous) => previous.filter((toast) => toast.id !== id));


            },

                3000);

        },

        []);

    return { toasts, showToast, };
}