import { useCallback, useSyncExternalStore } from 'react';
import type { Toast, ToastType } from '../types';

// A module-level store (not React state) so any component or hook
// can call showToast without needing a context provider wired
// through the whole tree — same toast list everywhere it's read.
let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit(): void {
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot(): Toast[] {
    return toasts;
}

function dismiss(id: number): void {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
}

function showToast(message: string, type: ToastType = 'success'): void {
    const toast: Toast = { id: nextId++, message, type };
    toasts = [...toasts, toast];
    emit();

    // Auto-dismiss after 3 seconds, per the brief.
    window.setTimeout(() => dismiss(toast.id), 3000);
}

function useToast() {
    const list = useSyncExternalStore(subscribe, getSnapshot);
    const dismissToast = useCallback((id: number) => dismiss(id), []);

    return { toasts: list, showToast, dismissToast };
}

export default useToast;