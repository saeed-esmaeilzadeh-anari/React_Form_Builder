"use client"

import { useState } from "react"
import type { FormField } from "@/lib/types"

export function useAI() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateFormSuggestion = async (prompt: string) => {
    setIsGenerating(true)

    try {
      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock AI response based on prompt keywords
      const mockResponse = {
        title: prompt.includes("contact")
          ? "Professional Contact Form"
          : prompt.includes("survey")
            ? "Customer Satisfaction Survey"
            : prompt.includes("registration")
              ? "Event Registration Form"
              : "Custom Form",
        description: "AI-generated form based on your requirements",
        fields: generateMockFields(prompt),
      }

      return mockResponse
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMockFields = (prompt: string): FormField[] => {
    const baseFields: FormField[] = []

    if (prompt.includes("contact") || prompt.includes("name")) {
      baseFields.push({
        id: `field-${Date.now()}-1`,
        type: "text",
        label: "Full Name",
        required: true,
        placeholder: "Enter your full name",
        validation: { required: true, minLength: 2 },
        conditional: { enabled: false, conditions: [] },
        styling: { width: "full", alignment: "left" },
      })
    }

    if (prompt.includes("email") || prompt.includes("contact")) {
      baseFields.push({
        id: `field-${Date.now()}-2`,
        type: "email",
        label: "Email Address",
        required: true,
        placeholder: "Enter your email",
        validation: { required: true, pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
        conditional: { enabled: false, conditions: [] },
        styling: { width: "full", alignment: "left" },
      })
    }

    if (prompt.includes("phone")) {
      baseFields.push({
        id: `field-${Date.now()}-3`,
        type: "phone",
        label: "Phone Number",
        required: false,
        placeholder: "Enter your phone number",
        validation: { required: false },
        conditional: { enabled: false, conditions: [] },
        styling: { width: "half", alignment: "left" },
      })
    }

    if (prompt.includes("message") || prompt.includes("feedback")) {
      baseFields.push({
        id: `field-${Date.now()}-4`,
        type: "textarea",
        label: "Message",
        required: true,
        placeholder: "Enter your message",
        rows: 4,
        validation: { required: true, minLength: 10 },
        conditional: { enabled: false, conditions: [] },
        styling: { width: "full", alignment: "left" },
      })
    }

    if (prompt.includes("rating") || prompt.includes("satisfaction")) {
      baseFields.push({
        id: `field-${Date.now()}-5`,
        type: "rating",
        label: "Overall Satisfaction",
        required: true,
        validation: { required: true },
        conditional: { enabled: false, conditions: [] },
        styling: { width: "full", alignment: "center" },
      })
    }

    return baseFields
  }

  return {
    generateFormSuggestion,
    isGenerating,
  }
}
