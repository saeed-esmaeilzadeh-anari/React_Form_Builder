"use client"

import type { FormField, FormSchema, FormProject } from "./types"

export function generateFormSchema(fields: FormField[]): FormSchema {
  return {
    title: "Generated Form Schema",
    description: "Auto-generated form schema with advanced validation",
    fields,
    version: "2.0.0",
    createdAt: new Date().toISOString(),
    settings: {
      allowMultipleSubmissions: true,
      requireAuthentication: false,
      enableAnalytics: true,
      enableNotifications: true,
      theme: "modern",
      language: "en",
    },
  }
}

export async function saveFormToSupabase(formData: FormProject) {
  // Mock Supabase save operation
  console.log("Saving to Supabase:", formData)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In real implementation:
  // const { data, error } = await supabase
  //   .from('forms')
  //   .upsert([formData])

  return { success: true, id: formData.id }
}

export async function getFormAnalytics(projectId: string) {
  // Mock analytics data
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    views: Math.floor(Math.random() * 10000) + 1000,
    submissions: Math.floor(Math.random() * 1000) + 100,
    conversionRate: Math.random() * 30 + 10,
    countries: [
      { name: "United States", count: 450 },
      { name: "United Kingdom", count: 230 },
      { name: "Canada", count: 180 },
    ],
  }
}

export function validateFormField(field: FormField, value: any): string | null {
  const { validation } = field

  if (validation.required && (!value || value === "")) {
    return validation.customMessage || `${field.label} is required`
  }

  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address"
    }
  }

  if (field.type === "phone" && value) {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(value.replace(/\s/g, ""))) {
      return "Please enter a valid phone number"
    }
  }

  if (validation.minLength && value && value.length < validation.minLength) {
    return `Minimum length is ${validation.minLength} characters`
  }

  if (validation.maxLength && value && value.length > validation.maxLength) {
    return `Maximum length is ${validation.maxLength} characters`
  }

  if (validation.pattern && value) {
    const regex = new RegExp(validation.pattern)
    if (!regex.test(value)) {
      return validation.customMessage || "Invalid format"
    }
  }

  return null
}

export function generateReactCode(project: FormProject): string {
  const imports = `import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'`

  const fieldComponents = project.fields
    .map((field) => {
      switch (field.type) {
        case "text":
        case "email":
        case "phone":
        case "number":
          return `        <div className="space-y-2">
          <Label htmlFor="${field.id}">${field.label}${field.required ? " *" : ""}</Label>
          <Input
            id="${field.id}"
            type="${field.type}"
            placeholder="${field.placeholder || ""}"
            ${field.required ? "required" : ""}
            value={formData.${field.id} || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, ${field.id}: e.target.value }))}
          />
        </div>`

        case "textarea":
          return `        <div className="space-y-2">
          <Label htmlFor="${field.id}">${field.label}${field.required ? " *" : ""}</Label>
          <Textarea
            id="${field.id}"
            placeholder="${field.placeholder || ""}"
            rows={${field.rows || 3}}
            ${field.required ? "required" : ""}
            value={formData.${field.id} || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, ${field.id}: e.target.value }))}
          />
        </div>`

        case "select":
          return `        <div className="space-y-2">
          <Label>${field.label}${field.required ? " *" : ""}</Label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, ${field.id}: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="${field.placeholder || "Select an option"}" />
            </SelectTrigger>
            <SelectContent>
              ${field.options?.map((option) => `<SelectItem value="${option}">${option}</SelectItem>`).join("\n              ")}
            </SelectContent>
          </Select>
        </div>`

        default:
          return `        <!-- ${field.type} field -->`
      }
    })
    .join("\n\n")

  return `${imports}

export default function ${project.title.replace(/\s+/g, "")}Form() {
  const [formData, setFormData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Handle form submission
      console.log('Form submitted:', formData)
      alert('Form submitted successfully!')
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">${project.title}</h1>
        ${project.description ? `<p className="text-gray-600 mt-2">${project.description}</p>` : ""}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
${fieldComponents}
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </Button>
      </form>
    </div>
  )
}`
}

export function generateVueCode(project: FormProject): string {
  return `<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">${project.title}</h1>
      ${project.description ? `<p class="text-gray-600 mt-2">${project.description}</p>` : ""}
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      ${project.fields
        .map((field) => {
          switch (field.type) {
            case "text":
            case "email":
            case "phone":
            case "number":
              return `<div class="space-y-2">
        <label class="block text-sm font-medium">${field.label}${field.required ? " *" : ""}</label>
        <input
          v-model="formData.${field.id}"
          type="${field.type}"
          placeholder="${field.placeholder || ""}"
          ${field.required ? "required" : ""}
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>`
            default:
              return `<!-- ${field.type} field -->`
          }
        })
        .join("\n      ")}
      
      <button 
        type="submit" 
        :disabled="isSubmitting"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Submitting...' : 'Submit Form' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({})
const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    console.log('Form submitted:', formData.value)
    alert('Form submitted successfully!')
  } catch (error) {
    console.error('Submission error:', error)
    alert('Failed to submit form')
  } finally {
    isSubmitting.value = false
  }
}
</script>`
}
