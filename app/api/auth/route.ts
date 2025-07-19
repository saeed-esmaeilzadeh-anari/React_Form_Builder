import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip ?? "anonymous"
    const { success } = await rateLimit.limit(identifier)

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { action, ...data } = await request.json()

    switch (action) {
      case "sign-in": {
        const validatedData = signInSchema.parse(data)

        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: validatedData.email,
          password: validatedData.password,
        })

        if (error) {
          logger.error("Sign in failed", { error: error.message, email: validatedData.email })
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        logger.info("User signed in", { userId: authData.user?.id })

        return NextResponse.json({
          success: true,
          user: authData.user,
          session: authData.session,
        })
      }

      case "sign-up": {
        const validatedData = signUpSchema.parse(data)

        const { data: authData, error } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            data: {
              first_name: validatedData.firstName,
              last_name: validatedData.lastName,
            },
          },
        })

        if (error) {
          logger.error("Sign up failed", { error: error.message, email: validatedData.email })
          return NextResponse.json({ error: error.message }, { status: 400 })
        }

        logger.info("User signed up", { userId: authData.user?.id })

        return NextResponse.json({
          success: true,
          user: authData.user,
          message: "Please check your email to confirm your account",
        })
      }

      case "sign-out": {
        const { error } = await supabase.auth.signOut()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    logger.error("Auth API error", { error })

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
