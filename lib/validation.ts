import { z } from "zod"
import { ValidationError } from "@/lib/error-handler"

// Enhanced validation with better error messages
export const createFormSchema = z.object({
  title: z.string().min(1, "عنوان فرم الزامی است").max(255, "عنوان فرم نمی‌تواند بیش از ۲۵۵ کاراکتر باشد").trim(),
  description: z
    .string()
    .max(1000, "توضیحات نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد")
    .optional()
    .transform((val) => val?.trim()),
  fields: z
    .array(z.any())
    .min(1, "فرم باید حداقل یک فیلد داشته باشد")
    .max(50, "فرم نمی‌تواند بیش از ۵۰ فیلد داشته باشد"),
  settings: z.object({
    allowMultipleSubmissions: z.boolean(),
    requireAuthentication: z.boolean(),
    enableAnalytics: z.boolean(),
    enableNotifications: z.boolean(),
  }),
  theme: z.enum(["modern", "classic", "minimal", "dark", "colorful"], {
    errorMap: () => ({ message: "تم انتخابی معتبر نیست" }),
  }),
})

export const emailSchema = z
  .string()
  .email("آدرس ایمیل معتبر نیست")
  .min(1, "ایمیل الزامی است")
  .max(254, "ایمیل بیش از حد طولانی است")

export const passwordSchema = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
  .max(128, "رمز عبور بیش از حد طولانی است")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "رمز عبور باید شامل حروف کوچک، بزرگ و عدد باشد")

// Safe validation wrapper
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      throw new ValidationError(`خطای اعتبارسنجی: ${errorMessages}`, {
        validationErrors: error.errors,
        receivedData: data,
      })
    }
    throw error
  }
}

// Async validation wrapper
export async function validateDataAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      throw new ValidationError(`خطای اعتبارسنجی: ${errorMessages}`, {
        validationErrors: error.errors,
        receivedData: data,
      })
    }
    throw error
  }
}
