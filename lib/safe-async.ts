import { logger } from "@/lib/logger"

// Safe async wrapper with automatic error handling
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  fallback?: T,
  errorMessage?: string,
): Promise<T | undefined> {
  try {
    return await asyncFn()
  } catch (error) {
    logger.error("Safe async operation failed", {
      error,
      errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (fallback !== undefined) {
      return fallback
    }

    if (errorMessage) {
      console.error(errorMessage, error)
    }

    return undefined
  }
}

// Retry mechanism for failed operations
export async function retryAsync<T>(asyncFn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      logger.warn(`Retry attempt ${attempt}/${maxRetries} failed`, {
        error: lastError,
        attempt,
        maxRetries,
      })

      if (attempt === maxRetries) {
        break
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  throw lastError!
}
