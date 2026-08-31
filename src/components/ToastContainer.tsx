import useToast from '../hooks/useToast';

function ToastContainer() {
    const { toasts, dismissToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-stack" role="status" aria-live="polite">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast--${toast.type}`}
                    onClick={() => dismissToast(toast.id)}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}

export default ToastContainer;