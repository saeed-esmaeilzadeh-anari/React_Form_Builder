import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { CollaborationService } from "@/lib/services/collaboration-service"
import { validateAuth } from "@/lib/middleware/auth"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await validateAuth(supabase)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, update } = await request.json()

    const collaborationService = new CollaborationService(supabase)

    // Check project access
    const hasAccess = await collaborationService.checkProjectAccess(projectId, user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Broadcast update to all collaborators
    await collaborationService.broadcastUpdate(projectId, {
      ...update,
      userId: user.id,
      timestamp: Date.now(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Collaboration update error", { error })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
