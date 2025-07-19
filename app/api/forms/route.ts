import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { FormService } from "@/lib/services/form-service"
import { AnalyticsService } from "@/lib/services/analytics-service"
import { validateAuth } from "@/lib/middleware/auth"
import { logger } from "@/lib/logger"
import { cache } from "@/lib/cache"

const createFormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  fields: z.array(z.any()),
  settings: z.object({
    allowMultipleSubmissions: z.boolean(),
    requireAuthentication: z.boolean(),
    enableAnalytics: z.boolean(),
    enableNotifications: z.boolean(),
  }),
  theme: z.enum(["modern", "classic", "minimal", "dark", "colorful"]),
})

const updateFormSchema = createFormSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await validateAuth(supabase)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""

    // Check cache first
    const cacheKey = `forms:${user.id}:${page}:${limit}:${search}:${category}`
    const cachedResult = await cache.get(cacheKey)

    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    const formService = new FormService(supabase)
    const result = await formService.getUserForms(user.id, {
      page,
      limit,
      search,
      category,
    })

    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300)

    return NextResponse.json(result)
  } catch (error) {
    logger.error("Get forms error", { error })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await validateAuth(supabase)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createFormSchema.parse(body)

    const formService = new FormService(supabase)
    const form = await formService.createForm({
      ...validatedData,
      userId: user.id,
    })

    // Initialize analytics
    const analyticsService = new AnalyticsService(supabase)
    await analyticsService.initializeFormAnalytics(form.id)

    // Invalidate cache
    await cache.del(`forms:${user.id}:*`)

    logger.info("Form created", { formId: form.id, userId: user.id })

    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    logger.error("Create form error", { error })

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
