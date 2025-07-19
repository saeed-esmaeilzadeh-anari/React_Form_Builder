"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { logger } from "@/lib/logger"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || "unknown"

    // Log error with context
    logger.error("React Error Boundary caught an error", {
      errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      timestamp: new Date().toISOString(),
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Report to external service in production
    if (process.env.NODE_ENV === "production") {
      this.reportErrorToService(error, errorInfo, errorId)
    }

    this.setState({ errorInfo })
  }

  private async reportErrorToService(error: Error, errorInfo: ErrorInfo, errorId: string) {
    try {
      await fetch("/api/errors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorId,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          errorInfo,
          userAgent: window.navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (reportError) {
      console.error("Failed to report error:", reportError)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">خطایی رخ داده است</CardTitle>
              <p className="text-gray-600 mt-2">متأسفانه مشکلی در اجرای برنامه پیش آمده است.</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Error Details (Development Mode)</h3>
                  <div className="text-sm text-red-700 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.name}
                    </div>
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorId && (
                      <div>
                        <strong>Error ID:</strong> {this.state.errorId}
                      </div>
                    )}
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium">Stack Trace</summary>
                        <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  تلاش مجدد
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="flex-1 bg-transparent">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  بارگذاری مجدد صفحه
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1 bg-transparent">
                  <Home className="w-4 h-4 mr-2" />
                  بازگشت به خانه
                </Button>
              </div>

              {this.state.errorId && (
                <div className="text-center text-sm text-gray-500">
                  <p>کد خطا: {this.state.errorId}</p>
                  <p>لطفاً این کد را هنگام گزارش مشکل ذکر کنید.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for error reporting
export function useErrorReporting() {
  const reportError = React.useCallback((error: Error, context?: Record<string, any>) => {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    logger.error("Manual error report", {
      errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      timestamp: new Date().toISOString(),
    })

    if (process.env.NODE_ENV === "production") {
      fetch("/api/errors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorId,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          context,
          userAgent: window.navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch((reportError) => {
        console.error("Failed to report error:", reportError)
      })
    }

    return errorId
  }, [])

  return { reportError }
}
