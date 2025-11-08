import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { logger } from "@/lib/logger"

export class CollaborationService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async checkProjectAccess(projectId: string, userId: string): Promise<boolean> {
    try {
      // Check if user owns the form or is a collaborator
      const { data: form, error: formError } = await this.supabase
        .from("forms")
        .select("user_id")
        .eq("id", projectId)
        .single()

      if (formError || !form) {
        logger.debug("Form not found", { projectId })
        return false
      }

      if (form.user_id === userId) {
        return true
      }

      // Check if user is a collaborator
      const { data: collaborator, error: collabError } = await this.supabase
        .from("form_collaborators")
        .select("id")
        .eq("form_id", projectId)
        .eq("user_id", userId)
        .eq("accepted_at", null)
        .single()

      if (collabError) {
        logger.debug("User not a collaborator", { projectId, userId })
        return false
      }

      return !!collaborator
    } catch (error) {
      logger.error("Check project access error", { error, projectId, userId })
      return false
    }
  }

  async broadcastUpdate(projectId: string, update: any): Promise<void> {
    try {
      // Record the collaboration event in form_events
      const { error } = await this.supabase.from("form_events").insert([
        {
          form_id: projectId,
          event_type: "submission",
          metadata: {
            type: "collaboration_update",
            update,
            timestamp: Date.now(),
          },
        },
      ])

      if (error) {
        logger.error("Failed to broadcast update", { error, projectId })
        throw error
      }

      logger.info("Collaboration update broadcasted", { projectId })
    } catch (error) {
      logger.error("Broadcast update error", { error, projectId })
      throw error
    }
  }
}
