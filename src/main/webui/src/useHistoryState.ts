import {useState} from "react";

/**
 * Stores the state in the browser history,
 * making the state reusable across refreshes, navigation
 * and even closing and reopening the window!
 *
 * @param key The key to store it in history
 * @param defaultTo A default value if nothing exists in history
 */
export function useHistoryState<T>(
    key: string,
    defaultTo: T
): [T, (value: T) => void] {
    const [state, rawSetState] = useState(() => {
        const value = window.history.state && window.history.state[key];
        return value || defaultTo;
    });

    function setState(value: T) {
        window.history.replaceState(
            { ...window.history.state, [key]: value },
            document.title
        );
        rawSetState(value);
    }

    return [state, setState];
}