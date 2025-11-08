import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { logger } from "@/lib/logger"

interface SubmissionData {
  formId: string
  data: Record<string, any>
  metadata?: {
    ipAddress?: string
    userAgent?: string
    referrer?: string
    submittedAt?: string
  }
}

interface ValidationResult {
  isValid: boolean
  errors?: Array<{ field: string; message: string }>
}

export class SubmissionService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getFormForSubmission(formId: string) {
    try {
      const { data: form, error } = await this.supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .eq("is_published", true)
        .single()

      if (error || !form) {
        logger.debug("Form not found or not published", { formId })
        return null
      }

      return form
    } catch (error) {
      logger.error("Get form for submission error", { error, formId })
      return null
    }
  }

  async validateSubmission(fields: any[], data: Record<string, any>): Promise<ValidationResult> {
    try {
      const errors: Array<{ field: string; message: string }> = []

      // Validate required fields
      for (const field of fields) {
        if (field.required && (!data[field.id] || data[field.id] === "")) {
          errors.push({
            field: field.id,
            message: `${field.label || field.id} is required`,
          })
        }

        // Basic type validation
        if (data[field.id]) {
          if (field.type === "email" && !this.isValidEmail(data[field.id])) {
            errors.push({
              field: field.id,
              message: `${field.label || field.id} must be a valid email`,
            })
          }

          if (field.type === "number" && isNaN(Number(data[field.id]))) {
            errors.push({
              field: field.id,
              message: `${field.label || field.id} must be a number`,
            })
          }

          if (field.type === "phone" && !this.isValidPhone(data[field.id])) {
            errors.push({
              field: field.id,
              message: `${field.label || field.id} must be a valid phone number`,
            })
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      logger.error("Validate submission error", { error })
      return {
        isValid: false,
        errors: [{ field: "unknown", message: "Validation failed" }],
      }
    }
  }

  async createSubmission(submissionData: SubmissionData) {
    try {
      const { data: submission, error } = await this.supabase
        .from("form_submissions")
        .insert([
          {
            form_id: submissionData.formId,
            data: submissionData.data,
            metadata: submissionData.metadata || {},
            ip_address: submissionData.metadata?.ipAddress,
            user_agent: submissionData.metadata?.userAgent,
            referrer: submissionData.metadata?.referrer,
            submitted_at: submissionData.metadata?.submittedAt || new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        logger.error("Failed to create submission", { error })
        throw error
      }

      logger.info("Submission created", { submissionId: submission.id, formId: submissionData.formId })
      return submission
    } catch (error) {
      logger.error("Create submission error", { error, formId: submissionData.formId })
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

  async getFormSubmissions(formId: string, options: { page: number; limit: number }) {
    try {
      const offset = (options.page - 1) * options.limit

      const {
        data: submissions,
        error,
        count,
      } = await this.supabase
        .from("form_submissions")
        .select("*", { count: "exact" })
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false })
        .range(offset, offset + options.limit - 1)

      if (error) {
        logger.error("Failed to get form submissions", { error, formId })
        throw error
      }

      return {
        submissions: submissions || [],
        total: count || 0,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil((count || 0) / options.limit),
      }
    } catch (error) {
      logger.error("Get form submissions error", { error, formId })
      throw error
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-+$$$$]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
  }
}
