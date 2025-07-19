import { logger } from "@/lib/logger"

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly timestamp: string
  public readonly context?: Record<string, any>

  constructor(message: string, statusCode = 500, isOperational = true, context?: Record<string, any>) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.timestamp = new Date().toISOString()
    this.context = context

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, true, context)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required", context?: Record<string, any>) {
    super(message, 401, true, context)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied", context?: Record<string, any>) {
    super(message, 403, true, context)
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", context?: Record<string, any>) {
    super(`${resource} not found`, 404, true, context)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 409, true, context)
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", context?: Record<string, any>) {
    super(message, 429, true, context)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 500, false, context)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, context?: Record<string, any>) {
    super(`${service} service error: ${message}`, 502, false, context)
  }
}

// Global error handler for API routes
export function handleApiError(error: unknown): {
  message: string
  statusCode: number
  details?: any
} {
  logger.error("API Error occurred", { error })

  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      details: process.env.NODE_ENV === "development" ? error.context : undefined,
    }
  }

  if (error instanceof Error) {
    // Handle specific known errors
    if (error.message.includes("PGRST116")) {
      return {
        message: "Resource not found",
        statusCode: 404,
      }
    }

    if (error.message.includes("duplicate key")) {
      return {
        message: "Resource already exists",
        statusCode: 409,
      }
    }

    if (error.message.includes("foreign key")) {
      return {
        message: "Invalid reference",
        statusCode: 400,
      }
    }

    return {
      message: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      statusCode: 500,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    }
  }

  return {
    message: "Unknown error occurred",
    statusCode: 500,
  }
}

// Async error wrapper for API routes
export function asyncHandler(fn: Function) {
  return async (req: any, res: any, ...args: any[]) => {
    try {
      return await fn(req, res, ...args)
    } catch (error) {
      const errorResponse = handleApiError(error)
      return Response.json(
        {
          error: errorResponse.message,
          details: errorResponse.details,
          timestamp: new Date().toISOString(),
        },
        { status: errorResponse.statusCode },
      )
    }
  }
}
