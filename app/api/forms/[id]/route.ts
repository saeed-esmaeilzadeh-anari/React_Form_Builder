import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { FormService } from "@/lib/services/form-service"
import { validateAuth } from "@/lib/middleware/auth"
import { logger } from "@/lib/logger"
import { cache } from "@/lib/cache"

const updateFormSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  fields: z.array(z.any()).optional(),
  settings: z
    .object({
      allowMultipleSubmissions: z.boolean(),
      requireAuthentication: z.boolean(),
      enableAnalytics: z.boolean(),
      enableNotifications: z.boolean(),
    })
    .optional(),
  theme: z.enum(["modern", "classic", "minimal", "dark", "colorful"]).optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const formId = params.id

    // Check cache first
    const cacheKey = `form:${formId}`
    const cachedForm = await cache.get(cacheKey)

    if (cachedForm) {
      return NextResponse.json(cachedForm)
    }

    const formService = new FormService(supabase)
    const form = await formService.getFormById(formId)

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Cache for 10 minutes
    await cache.set(cacheKey, form, 600)

    return NextResponse.json(form)
  } catch (error) {
    logger.error("Get form error", { error, formId: params.id })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await validateAuth(supabase)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formId = params.id
    const body = await request.json()
    const validatedData = updateFormSchema.parse(body)

    const formService = new FormService(supabase)

    // Check ownership
    const existingForm = await formService.getFormById(formId)
    if (!existingForm || existingForm.userId !== user.id) {
      return NextResponse.json({ error: "Form not found or access denied" }, { status: 404 })
    }

    const updatedForm = await formService.updateForm(formId, validatedData)

    // Invalidate cache
    await cache.del(`form:${formId}`)
    await cache.del(`forms:${user.id}:*`)

    logger.info("Form updated", { formId, userId: user.id })

    return NextResponse.json(updatedForm)
  } catch (error) {
    logger.error("Update form error", { error, formId: params.id })

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await validateAuth(supabase)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formId = params.id
    const formService = new FormService(supabase)

    // Check ownership
    const existingForm = await formService.getFormById(formId)
    if (!existingForm || existingForm.userId !== user.id) {
      return NextResponse.json({ error: "Form not found or access denied" }, { status: 404 })
    }

    await formService.deleteForm(formId)

    // Invalidate cache
    await cache.del(`form:${formId}`)
    await cache.del(`forms:${user.id}:*`)

    logger.info("Form deleted", { formId, userId: user.id })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Delete form error", { error, formId: params.id })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
