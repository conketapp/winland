/**
 * useAsync Hook
 * Handles async operations với loading, error states
 */

import { useState, useCallback } from 'react';
import { getErrorMessage } from '@/lib/errors/error-handler';

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: unknown[]) => Promise<T | undefined>;
  reset: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAsync<T = any>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = false
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (...args: any[]): Promise<T | undefined> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFunction(...args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState({ data: null, loading: false, error: errorMessage });
        throw error;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

