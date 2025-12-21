/**
 * Custom hook for syncing filters with URL query parameters
 * This enables shareable links with filters and browser back/forward navigation
 */

import { useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

interface FilterRoutingOptions {
  /**
   * Whether to update URL when filters change
   */
  syncToUrl?: boolean;
  /**
   * Whether to initialize filters from URL on mount
   */
  initFromUrl?: boolean;
  /**
   * Transform filter value before saving to URL (e.g., remove 'all' values)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToUrl?: (filters: Record<string, any>) => Record<string, string>;
  /**
   * Transform URL params to filter values
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformFromUrl?: (params: URLSearchParams) => Record<string, any>;
}

/**
 * Hook to sync filters with URL query parameters
 * 
 * @param filters Current filter state
 * @param setFilters Function to update filters
 * @param options Configuration options
 * 
 * @example
 * const [filters, setFilters] = useState({ status: 'all', projectId: 'all' });
 * useFilterRouting(filters, setFilters, {
 *   transformToUrl: (filters) => {
 *     const result: Record<string, string> = {};
 *     if (filters.status !== 'all') result.status = filters.status;
 *     if (filters.projectId !== 'all') result.projectId = filters.projectId;
 *     return result;
 *   }
 * });
 */
export function useFilterRouting(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFilters: (filters: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void,
  options: FilterRoutingOptions = {}
) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    syncToUrl = true,
    initFromUrl = true,
    transformToUrl,
    transformFromUrl,
  } = options;

  // Transform filters to URL-safe format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtersToUrlParams = useCallback((currentFilters: Record<string, any>): URLSearchParams => {
    const params = new URLSearchParams();
    
    if (transformToUrl) {
      const transformed = transformToUrl(currentFilters);
      Object.entries(transformed).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      });
    } else {
      // Default: only include non-empty, non-'all' values
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && value !== 'all') {
          params.set(key, String(value));
        }
      });
    }

    return params;
  }, [transformToUrl]);

  // Transform URL params to filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const urlParamsToFilters = useCallback((params: URLSearchParams): Record<string, any> => {
    if (transformFromUrl) {
      return transformFromUrl(params);
    }

    // Default: read all params and convert to filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [transformFromUrl]);

  // Initialize filters from URL on mount
  useEffect(() => {
    if (!initFromUrl) return;

    const urlFilters = urlParamsToFilters(searchParams);
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters((prev) => {
        // Only update if filters are actually different
        const hasChanges = Object.keys(urlFilters).some(
          key => prev[key] !== urlFilters[key]
        );
        return hasChanges ? { ...prev, ...urlFilters } : prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - intentionally excluding dependencies

  // Update URL when filters change
  useEffect(() => {
    if (!syncToUrl) return;

    const urlParams = filtersToUrlParams(filters);
    const currentParams = new URLSearchParams(location.search);

    // Get all filter keys that we manage
    const filterKeys = new Set(Object.keys(filters));

    // Build the expected URL params string from filters
    const expectedParams = new URLSearchParams();
    urlParams.forEach((value, key) => {
      expectedParams.set(key, value);
    });
    const expectedString = expectedParams.toString();

    // Build current URL params string for filter keys only
    const currentFilterParams = new URLSearchParams();
    currentParams.forEach((value, key) => {
      if (filterKeys.has(key)) {
        currentFilterParams.set(key, value);
      }
    });
    const currentString = currentFilterParams.toString();

    // Only update if different
    if (expectedString !== currentString) {
      const newParams = new URLSearchParams(location.search);
      
      // Remove old filter params
      filterKeys.forEach(key => {
        newParams.delete(key);
      });

      // Add new filter params
      urlParams.forEach((value, key) => {
        newParams.set(key, value);
      });

      setSearchParams(newParams, { replace: true });
    }
  }, [filters, location.search, syncToUrl, filtersToUrlParams, setSearchParams]);

  return {
    /**
     * Get current filter value from URL
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getFilterFromUrl: useCallback((key: string, defaultValue: any = null) => {
      return searchParams.get(key) ?? defaultValue;
    }, [searchParams]),

    /**
     * Update a single filter in URL
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateFilterInUrl: useCallback((key: string, value: any) => {
      const params = new URLSearchParams(location.search);
      if (value === null || value === undefined || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      setSearchParams(params, { replace: true });
    }, [location.search, setSearchParams]),
  };
}
