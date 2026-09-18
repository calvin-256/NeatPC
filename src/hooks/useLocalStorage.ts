// ===========================================
// NeatPC — useLocalStorage Hook
// ===========================================
// Persist state to localStorage with SSR safety.

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Like useState, but persists the value to localStorage.
 * SSR-safe — returns initialValue on the server.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize from localStorage (client only)
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Update both state and localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.warn(`Error writing localStorage key "${key}":`, error);
        }
        return newValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
