import { logger } from "@/lib/logger"

interface FormData {
  id: string
  title: string
  user_id: string
  settings?: {
    enableNotifications?: boolean
    notificationEmail?: string
  }
}

interface SubmissionData {
  id: string
  form_id: string
  data: Record<string, any>
  metadata?: Record<string, any>
  submitted_at: string
}

export class NotificationService {
  async sendSubmissionNotification(form: FormData, submission: SubmissionData): Promise<void> {
    try {
      // Send notification via email
      const response = await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: form.id,
          formTitle: form.title,
          submissionId: submission.id,
          submissionData: submission.data,
          submittedAt: submission.submitted_at,
          notificationEmail: form.settings?.notificationEmail,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`)
      }

      logger.info("Notification sent", { formId: form.id, submissionId: submission.id })
    } catch (error) {
      logger.error("Send notification error", { error, formId: form.id, submissionId: submission.id })
      // Don't throw - notifications are non-critical
    }
  }

  async sendCollaborationInvite(email: string, formTitle: string, inviteLink: string): Promise<void> {
    try {
      const response = await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "collaboration_invite",
          email,
          formTitle,
          inviteLink,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send invite: ${response.statusText}`)
      }

      logger.info("Collaboration invite sent", { email, formTitle })
    } catch (error) {
      logger.error("Send collaboration invite error", { error, email })
      // Don't throw - notifications are non-critical
    }
  }
}
