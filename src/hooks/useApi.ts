import { useState, useEffect, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  immediate?: boolean
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: options.immediate || false,
    error: null
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await apiCall()
      setState(prev => ({ ...prev, data: result, loading: false }))
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      throw error
    }
  }, [apiCall])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  const retry = useCallback(() => {
    execute()
  }, [execute])

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [execute, options.immediate])

  return {
    ...state,
    execute,
    reset,
    retry,
    isSuccess: !state.loading && !state.error && state.data !== null
  }
}

// Hook for manual API calls (forms, buttons, etc.)
export function useApiCall<T>() {
  return useApi<T>(() => Promise.resolve(null as T), { immediate: false })
}

export default useApi