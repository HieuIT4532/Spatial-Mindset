// =====================================================
// SpatialMind — useDebounce Hook
// =====================================================
// Prevents excessive re-renders when typing coordinates
// for Live Preview (Math-as-Code). Waits for user to
// stop typing before triggering the 3D render update.
// =====================================================

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useDebounce — Returns a debounced value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in ms (default 300ms)
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback — Returns a debounced function
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in ms (default 300ms)
 */
export function useDebouncedCallback(callback, delay = 300) {
  const timerRef = useRef(null);

  const debouncedFn = useCallback((...args) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return debouncedFn;
}

export default useDebounce;
