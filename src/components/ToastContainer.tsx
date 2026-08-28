import type { Toast } from "../types";


interface Props {
    toasts: Toast[];
}


export default function ToastContainer({
    toasts,
}: Props) {

    return (
        <div className="toast-container">

            {toasts.map((toast) => (

                <div
                    key={toast.id}
                    className={`toast ${toast.type}`}
                >

                    {toast.message}

                </div>

            ))}

        </div>
    );
}
