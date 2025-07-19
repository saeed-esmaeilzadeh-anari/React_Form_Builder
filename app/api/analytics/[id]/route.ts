import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AnalyticsService } from "@/lib/services/analytics-service"
import { validateAuth } from "@/lib/middleware/auth"
import { logger } from "@/lib/logger"
import { cache } from "@/lib/cache"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await validateAuth(supabase)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formId = params.id
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("range") || "7d"
    const metrics = searchParams.get("metrics")?.split(",") || ["views", "submissions", "conversion"]

    // Check cache first
    const cacheKey = `analytics:${formId}:${timeRange}:${metrics.join(",")}`
    const cachedAnalytics = await cache.get(cacheKey)

    if (cachedAnalytics) {
      return NextResponse.json(cachedAnalytics)
    }

    const analyticsService = new AnalyticsService(supabase)

    // Check form ownership
    const hasAccess = await analyticsService.checkFormAccess(formId, user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const analytics = await analyticsService.getFormAnalytics(formId, {
      timeRange,
      metrics,
    })

    // Cache for 15 minutes
    await cache.set(cacheKey, analytics, 900)

    return NextResponse.json(analytics)
  } catch (error) {
    logger.error("Get analytics error", { error, formId: params.id })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
