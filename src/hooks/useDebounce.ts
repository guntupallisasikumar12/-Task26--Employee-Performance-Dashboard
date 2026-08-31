import { useEffect, useState } from 'react';

// Generic — delays reflecting `value` until it stops changing for
// `delayMs`. Used on the employee search box so typing doesn't fire
// an API call on every keystroke.
function useDebounce<T>(value: T, delayMs = 300): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delayMs);

        // Cleanup: if `value` changes again before the timeout fires
        // (the user kept typing), this cancels the stale timer so only
        // the latest keystroke ever results in a state update — that's
        // what stops every intermediate value from reaching the API.
        return () => window.clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}

export default useDebounce;