import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { logger } from "@/lib/logger"

export class AnalyticsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async initializeFormAnalytics(formId: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("form_analytics").insert([
        {
          form_id: formId,
          views: 0,
          submissions: 0,
          conversion_rate: 0,
          geographic_data: {},
          device_data: {},
          created_at: new Date().toISOString(),
        },
      ])

      if (error) {
        logger.error("Failed to initialize analytics", { error, formId })
        throw new Error("Failed to initialize analytics")
      }
    } catch (error) {
      logger.error("Initialize analytics error", { error, formId })
      throw error
    }
  }

  async recordView(
    formId: string,
    metadata: {
      ipAddress?: string
      userAgent?: string
      referrer?: string
    },
  ): Promise<void> {
    try {
      // Record the view event
      const { error: eventError } = await this.supabase.from("form_events").insert([
        {
          form_id: formId,
          event_type: "view",
          metadata,
          created_at: new Date().toISOString(),
        },
      ])

      if (eventError) {
        logger.error("Failed to record view event", { error: eventError, formId })
      }

      // Update analytics counters
      const { error: updateError } = await this.supabase.rpc("increment_form_views", { form_id: formId })

      if (updateError) {
        logger.error("Failed to increment views", { error: updateError, formId })
      }
    } catch (error) {
      logger.error("Record view error", { error, formId })
    }
  }

  async recordSubmission(
    formId: string,
    metadata: {
      ipAddress?: string
      userAgent?: string
      referrer?: string
    },
  ): Promise<void> {
    try {
      // Record the submission event
      const { error: eventError } = await this.supabase.from("form_events").insert([
        {
          form_id: formId,
          event_type: "submission",
          metadata,
          created_at: new Date().toISOString(),
        },
      ])

      if (eventError) {
        logger.error("Failed to record submission event", { error: eventError, formId })
      }

      // Update analytics counters and conversion rate
      const { error: updateError } = await this.supabase.rpc("increment_form_submissions", { form_id: formId })

      if (updateError) {
        logger.error("Failed to increment submissions", { error: updateError, formId })
      }
    } catch (error) {
      logger.error("Record submission error", { error, formId })
    }
  }

  async getFormAnalytics(
    formId: string,
    options: {
      timeRange: string
      metrics: string[]
    },
  ) {
    try {
      const { data: analytics, error } = await this.supabase
        .from("form_analytics")
        .select("*")
        .eq("form_id", formId)
        .single()

      if (error) {
        logger.error("Failed to get analytics", { error, formId })
        throw new Error("Failed to get analytics")
      }

      // Get time-series data
      const { data: events, error: eventsError } = await this.supabase
        .from("form_events")
        .select("*")
        .eq("form_id", formId)
        .gte("created_at", this.getTimeRangeStart(options.timeRange))
        .order("created_at", { ascending: true })

      if (eventsError) {
        logger.error("Failed to get events", { error: eventsError, formId })
      }

      return {
        summary: {
          totalViews: analytics.views,
          totalSubmissions: analytics.submissions,
          conversionRate: analytics.conversion_rate,
        },
        timeSeries: this.processTimeSeriesData(events || [], options.timeRange),
        geographic: analytics.geographic_data,
        devices: analytics.device_data,
      }
    } catch (error) {
      logger.error("Get analytics error", { error, formId })
      throw error
    }
  }

  async checkFormAccess(formId: string, userId: string): Promise<boolean> {
    try {
      const { data: form, error } = await this.supabase.from("forms").select("user_id").eq("id", formId).single()

      if (error || !form) {
        return false
      }

      return form.user_id === userId
    } catch (error) {
      logger.error("Check form access error", { error, formId, userId })
      return false
    }
  }

  private getTimeRangeStart(timeRange: string): string {
    const now = new Date()
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 7
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return start.toISOString()
  }

  private processTimeSeriesData(events: any[], timeRange: string) {
    // Group events by day/hour based on time range
    const groupedData = events.reduce((acc, event) => {
      const date = new Date(event.created_at)
      const key =
        timeRange === "7d"
          ? date.toISOString().split("T")[0] // Group by day
          : date.toISOString().split(":")[0] // Group by hour

      if (!acc[key]) {
        acc[key] = { views: 0, submissions: 0 }
      }

      if (event.event_type === "view") {
        acc[key].views++
      } else if (event.event_type === "submission") {
        acc[key].submissions++
      }

      return acc
    }, {})

    return Object.entries(groupedData).map(([date, data]) => ({
      date,
      ...data,
    }))
  }
}
