import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { logger } from "@/lib/logger"
import { rateLimit } from "@/lib/rate-limit"

const errorReportSchema = z.object({
  errorId: z.string(),
  error: z.object({
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
  }),
  errorInfo: z
    .object({
      componentStack: z.string().optional(),
    })
    .optional(),
  context: z.record(z.any()).optional(),
  userAgent: z.string(),
  url: z.string(),
  timestamp: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for error reports
    const identifier = request.ip ?? "anonymous"
    const { success } = await rateLimit.limit(identifier)

    if (!success) {
      return NextResponse.json({ error: "Too many error reports" }, { status: 429 })
    }

    const body = await request.json()
    const validatedData = errorReportSchema.parse(body)

    // Log the error report
    logger.error("Client error report received", {
      ...validatedData,
      clientIP: request.ip,
      headers: {
        userAgent: request.headers.get("user-agent"),
        referer: request.headers.get("referer"),
      },
    })

    // In production, you might want to:
    // 1. Store in database for analysis
    // 2. Send to external monitoring service (Sentry, LogRocket, etc.)
    // 3. Send alerts for critical errors
    // 4. Generate error reports for developers

    if (process.env.NODE_ENV === "production") {
      // Example: Send to external monitoring service
      await sendToMonitoringService(validatedData)
    }

    return NextResponse.json({
      success: true,
      errorId: validatedData.errorId,
      message: "Error report received",
    })
  } catch (error) {
    logger.error("Error report API failed", { error })

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid error report format" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to process error report" }, { status: 500 })
  }
}

async function sendToMonitoringService(errorData: any) {
  try {
    // Example integration with external service
    // await fetch('https://api.sentry.io/api/...', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENTRY_AUTH_TOKEN}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(errorData)
    // })

    console.log("Error sent to monitoring service:", errorData.errorId)
  } catch (error) {
    logger.error("Failed to send error to monitoring service", { error })
  }
}
