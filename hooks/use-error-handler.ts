"use client"

import { useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  reportError?: boolean
  fallbackMessage?: string
}

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, options: ErrorHandlerOptions = {}) => {
    const {
      showToast = true,
      logError = true,
      reportError = true,
      fallbackMessage = "خطایی رخ داده است. لطفاً دوباره تلاش کنید.",
    } = options

    let errorMessage = fallbackMessage
    let errorDetails: any = {}

    // Extract error information
    if (error instanceof Error) {
      errorMessage = error.message || fallbackMessage
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    } else if (typeof error === "string") {
      errorMessage = error
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as any).message || fallbackMessage
    }

    // Log error
    if (logError) {
      logger.error("Error handled by useErrorHandler", {
        error: errorDetails,
        context: {
          url: typeof window !== "undefined" ? window.location.href : "unknown",
          userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
          timestamp: new Date().toISOString(),
        },
      })
    }

    // Show toast notification
    if (showToast) {
      toast({
        title: "خطا",
        description: errorMessage,
        variant: "destructive",
      })
    }

    // Report error to service
    if (reportError && error instanceof Error) {
      fetch("/api/errors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          error: errorDetails,
          userAgent: window.navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch((reportError) => {
        console.error("Failed to report error:", reportError)
      })
    }

    return {
      message: errorMessage,
      details: errorDetails,
    }
  }, [])

  const handleAsyncError = useCallback(
    async (asyncFn: () => Promise<any>, options: ErrorHandlerOptions = {}) => {
      try {
        return await asyncFn()
      } catch (error) {
        handleError(error, options)
        throw error // Re-throw so calling code can handle it
      }
    },
    [handleError],
  )

  return {
    handleError,
    handleAsyncError,
  }
}
