import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { SubmissionService } from "@/lib/services/submission-service"
import { AnalyticsService } from "@/lib/services/analytics-service"
import { NotificationService } from "@/lib/services/notification-service"
import { validateAuth } from "@/lib/middleware/auth"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

const submitFormSchema = z.object({
  data: z.record(z.any()),
  metadata: z
    .object({
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
      referrer: z.string().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Rate limiting for form submissions
    const identifier = request.ip ?? "anonymous"
    const { success } = await rateLimit.limit(identifier)

    if (!success) {
      return NextResponse.json({ error: "Too many submissions" }, { status: 429 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    const formId = params.id
    const body = await request.json()
    const validatedData = submitFormSchema.parse(body)

    const submissionService = new SubmissionService(supabase)

    // Validate form exists and is active
    const form = await submissionService.getFormForSubmission(formId)
    if (!form) {
      return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 })
    }

    // Check if authentication is required
    if (form.settings.requireAuthentication) {
      const user = await validateAuth(supabase)
      if (!user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }
    }

    // Validate form data against schema
    const validationResult = await submissionService.validateSubmission(form.fields, validatedData.data)

    if (!validationResult.isValid) {
      return NextResponse.json({ error: "Validation failed", details: validationResult.errors }, { status: 400 })
    }

    // Create submission
    const submission = await submissionService.createSubmission({
      formId,
      data: validatedData.data,
      metadata: {
        ...validatedData.metadata,
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
        submittedAt: new Date().toISOString(),
      },
    })

    // Update analytics
    if (form.settings.enableAnalytics) {
      const analyticsService = new AnalyticsService(supabase)
      await analyticsService.recordSubmission(formId, {
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent"),
        referrer: request.headers.get("referer"),
      })
    }

    // Send notifications
    if (form.settings.enableNotifications) {
      const notificationService = new NotificationService()
      await notificationService.sendSubmissionNotification(form, submission)
    }

    logger.info("Form submitted", { formId, submissionId: submission.id })

    return NextResponse.json(
      {
        success: true,
        submissionId: submission.id,
        message: "Form submitted successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    logger.error("Form submission error", { error, formId: params.id })

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await validateAuth(supabase)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formId = params.id
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const submissionService = new SubmissionService(supabase)

    // Check form ownership
    const hasAccess = await submissionService.checkFormAccess(formId, user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const submissions = await submissionService.getFormSubmissions(formId, {
      page,
      limit,
    })

    return NextResponse.json(submissions)
  } catch (error) {
    logger.error("Get submissions error", { error, formId: params.id })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
