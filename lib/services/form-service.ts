import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { FormProject, FormField } from "@/lib/types"
import { logger } from "@/lib/logger"

export class FormService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async createForm(data: {
    title: string
    description?: string
    fields: FormField[]
    settings: any
    theme: string
    userId: string
  }): Promise<FormProject> {
    try {
      const { data: form, error } = await this.supabase
        .from("forms")
        .insert([
          {
            title: data.title,
            description: data.description,
            fields: data.fields,
            settings: data.settings,
            theme: data.theme,
            user_id: data.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        logger.error("Failed to create form", { error })
        throw new Error("Failed to create form")
      }

      return this.mapDatabaseFormToProject(form)
    } catch (error) {
      logger.error("Form creation error", { error })
      throw error
    }
  }

  async getUserForms(
    userId: string,
    options: {
      page: number
      limit: number
      search?: string
      category?: string
    },
  ) {
    try {
      let query = this.supabase
        .from("forms")
        .select("*, form_analytics(*)", { count: "exact" })
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
      }

      const offset = (options.page - 1) * options.limit
      query = query.range(offset, offset + options.limit - 1)

      const { data: forms, error, count } = await query

      if (error) {
        logger.error("Failed to get user forms", { error, userId })
        throw new Error("Failed to get forms")
      }

      return {
        forms: forms?.map(this.mapDatabaseFormToProject) || [],
        total: count || 0,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil((count || 0) / options.limit),
      }
    } catch (error) {
      logger.error("Get user forms error", { error, userId })
      throw error
    }
  }

  async getFormById(formId: string): Promise<FormProject | null> {
    try {
      const { data: form, error } = await this.supabase
        .from("forms")
        .select("*, form_analytics(*)")
        .eq("id", formId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null // Form not found
        }
        logger.error("Failed to get form", { error, formId })
        throw new Error("Failed to get form")
      }

      return this.mapDatabaseFormToProject(form)
    } catch (error) {
      logger.error("Get form error", { error, formId })
      throw error
    }
  }

  async updateForm(formId: string, updates: Partial<FormProject>): Promise<FormProject> {
    try {
      const { data: form, error } = await this.supabase
        .from("forms")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formId)
        .select()
        .single()

      if (error) {
        logger.error("Failed to update form", { error, formId })
        throw new Error("Failed to update form")
      }

      return this.mapDatabaseFormToProject(form)
    } catch (error) {
      logger.error("Update form error", { error, formId })
      throw error
    }
  }

  async deleteForm(formId: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("forms").delete().eq("id", formId)

      if (error) {
        logger.error("Failed to delete form", { error, formId })
        throw new Error("Failed to delete form")
      }
    } catch (error) {
      logger.error("Delete form error", { error, formId })
      throw error
    }
  }

  private mapDatabaseFormToProject(dbForm: any): FormProject {
    return {
      id: dbForm.id,
      title: dbForm.title,
      description: dbForm.description,
      fields: dbForm.fields,
      theme: dbForm.theme,
      settings: dbForm.settings,
      createdAt: dbForm.created_at,
      updatedAt: dbForm.updated_at,
      createdBy: dbForm.user_id,
      isPublished: dbForm.is_published,
      publishedUrl: dbForm.published_url,
      analytics: dbForm.form_analytics?.[0]
        ? {
            views: dbForm.form_analytics[0].views,
            submissions: dbForm.form_analytics[0].submissions,
            conversionRate: dbForm.form_analytics[0].conversion_rate,
          }
        : undefined,
    }
  }
}
