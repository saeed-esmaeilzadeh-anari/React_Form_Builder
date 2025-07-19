import type { SupabaseClient } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

export async function validateAuth(supabase: SupabaseClient) {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      logger.error("Auth validation error", { error })
      return null
    }

    return user
  } catch (error) {
    logger.error("Auth validation exception", { error })
    return null
  }
}

export async function requireAuth(supabase: SupabaseClient) {
  const user = await validateAuth(supabase)

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function checkPermission(
  supabase: SupabaseClient,
  userId: string,
  resource: string,
  action: string,
): Promise<boolean> {
  try {
    const { data: permission, error } = await supabase
      .from("user_permissions")
      .select("*")
      .eq("user_id", userId)
      .eq("resource", resource)
      .eq("action", action)
      .single()

    if (error && error.code !== "PGRST116") {
      logger.error("Permission check error", { error, userId, resource, action })
      return false
    }

    return !!permission
  } catch (error) {
    logger.error("Permission check exception", { error, userId, resource, action })
    return false
  }
}
