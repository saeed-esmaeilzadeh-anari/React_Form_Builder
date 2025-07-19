"use client"

import React, { Component, type ReactNode, type ComponentType, Suspense } from "react"
import { logger } from "@/lib/logger"

// Safe component wrapper with multiple fallback strategies
export function withUltimateSafeRender<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: {
    fallback?: ReactNode
    errorFallback?: ReactNode
    loadingFallback?: ReactNode
    retryCount?: number
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  } = {},
): ComponentType<P> {
  const { fallback, errorFallback, loadingFallback, retryCount = 3, onError } = options

  return class UltimateSafeComponent extends Component<
    P,
    {
      hasError: boolean
      retryAttempt: number
      isLoading: boolean
    }
  > {
    private retryTimeout: NodeJS.Timeout | null = null

    constructor(props: P) {
      super(props)
      this.state = {
        hasError: false,
        retryAttempt: 0,
        isLoading: false,
      }
    }

    static getDerivedStateFromError(): { hasError: boolean } {
      return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      logger.error("Safe component caught error", {
        component: WrappedComponent.name || "Unknown",
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        retryAttempt: this.state.retryAttempt,
      })

      onError?.(error, errorInfo)

      // Auto-retry with exponential backoff
      if (this.state.retryAttempt < retryCount) {
        const delay = Math.pow(2, this.state.retryAttempt) * 1000
        this.retryTimeout = setTimeout(() => {
          this.setState((prevState) => ({
            hasError: false,
            retryAttempt: prevState.retryAttempt + 1,
            isLoading: false,
          }))
        }, delay)
      }
    }

    componentWillUnmount() {
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout)
      }
    }

    private handleRetry = () => {
      this.setState({
        hasError: false,
        retryAttempt: this.state.retryAttempt + 1,
        isLoading: true,
      })

      // Simulate loading time
      setTimeout(() => {
        this.setState({ isLoading: false })
      }, 500)
    }

    render() {
      if (this.state.isLoading) {
        return (
          loadingFallback || (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          )
        )
      }

      if (this.state.hasError) {
        if (this.state.retryAttempt >= retryCount) {
          return (
            errorFallback || (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center text-red-800">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Component failed to load
                </div>
                <p className="text-sm text-red-600 mt-1">This component encountered an error and couldn't recover.</p>
              </div>
            )
          )
        }

        return (
          fallback || (
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-yellow-800">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Component Error
                </div>
                <button
                  onClick={this.handleRetry}
                  className="px-3 py-1 text-sm bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                >
                  Retry ({retryCount - this.state.retryAttempt} left)
                </button>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Attempt {this.state.retryAttempt + 1} of {retryCount}
              </p>
            </div>
          )
        )
      }

      try {
        return (
          <Suspense fallback={loadingFallback || <div>Loading...</div>}>
            <WrappedComponent {...this.props} />
          </Suspense>
        )
      } catch (error) {
        logger.error("Render error in safe component", {
          error,
          component: WrappedComponent.name,
        })
        return fallback || <div className="p-4 text-red-500">Render error occurred</div>
      }
    }
  }
}

// Ultimate safe hooks
export function useUltimateSafeState<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = React.useState<T>(initialValue)

  const safeSetState = React.useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setState(value)
      } catch (error) {
        logger.error("Safe setState failed", { error })
        // Try to reset to initial value
        try {
          setState(initialValue)
        } catch (resetError) {
          logger.error("Failed to reset state", { resetError })
        }
      }
    },
    [initialValue],
  )

  return [state, safeSetState]
}

export function useUltimateSafeEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  React.useEffect(() => {
    try {
      const cleanup = effect()
      return () => {
        try {
          cleanup?.()
        } catch (cleanupError) {
          logger.error("Effect cleanup failed", { cleanupError })
        }
      }
    } catch (error) {
      logger.error("Safe effect failed", { error })
    }
  }, deps)
}

export function useUltimateSafeCallback<T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList): T {
  return React.useCallback((...args: Parameters<T>) => {
    try {
      return callback(...args)
    } catch (error) {
      logger.error("Safe callback failed", { error })
      return undefined
    }
  }, deps) as T
}

// Safe async hook
export function useUltimateSafeAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = [],
): {
  data: T | null
  loading: boolean
  error: Error | null
  retry: () => void
} {
  const [data, setData] = useUltimateSafeState<T | null>(null)
  const [loading, setLoading] = useUltimateSafeState(false)
  const [error, setError] = useUltimateSafeState<Error | null>(null)

  const execute = useUltimateSafeCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFn()
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      logger.error("Async operation failed", { error })
    } finally {
      setLoading(false)
    }
  }, deps)

  useUltimateSafeEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, retry: execute }
}

// -----------------------------------------------------------------------------
// 🔄  Back-compat aliases ─ keep older imports working
// -----------------------------------------------------------------------------
export {
  useUltimateSafeCallback as useSafeCallback,
  useUltimateSafeState as useSafeState,
  useUltimateSafeEffect as useSafeEffect,
  withUltimateSafeRender as withSafeRender,
}
