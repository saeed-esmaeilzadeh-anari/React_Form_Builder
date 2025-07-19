"use client"

import type React from "react"
import type { FormField, FormProject } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSafeState, useSafeCallback } from "@/lib/safe-components"
import { safeGet, safeMap } from "@/lib/safe-utils"

interface FormPreviewProps {
  project?: FormProject
  fields?: FormField[]
  theme?: string
}

export function FormPreview({ project, fields = [] }: FormPreviewProps) {
  const [formData, setFormData] = useSafeState<Record<string, any>>({})

  const handleSubmit = useSafeCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      console.log("Form submitted:", formData)
      alert("Form submitted! Check console for data.")
    },
    [formData],
  )

  const updateFormData = useSafeCallback((fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }, [])

  const renderField = useSafeCallback(
    (field: FormField) => {
      if (!field || !field.id) return null

      const commonProps = {
        id: field.id,
        required: safeGet(field, "required", false),
      }

      try {
        switch (field.type) {
          case "text":
          case "email":
          case "phone":
            return (
              <Input
                {...commonProps}
                type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                placeholder={safeGet(field, "placeholder", "")}
                value={safeGet(formData, field.id, "")}
                onChange={(e) => updateFormData(field.id, e.target.value)}
              />
            )

          case "number":
            return (
              <Input
                {...commonProps}
                type="number"
                placeholder={safeGet(field, "placeholder", "")}
                value={safeGet(formData, field.id, "")}
                onChange={(e) => updateFormData(field.id, e.target.value)}
              />
            )

          case "textarea":
            return (
              <Textarea
                {...commonProps}
                placeholder={safeGet(field, "placeholder", "")}
                rows={safeGet(field, "rows", 3)}
                value={safeGet(formData, field.id, "")}
                onChange={(e) => updateFormData(field.id, e.target.value)}
              />
            )

          case "date":
            return (
              <Input
                {...commonProps}
                type="date"
                value={safeGet(formData, field.id, "")}
                onChange={(e) => updateFormData(field.id, e.target.value)}
              />
            )

          case "select":
            const options = safeGet(field, "options", [])
            return (
              <Select onValueChange={(value) => updateFormData(field.id, value)}>
                <SelectTrigger>
                  <SelectValue placeholder={safeGet(field, "placeholder", "Select an option")} />
                </SelectTrigger>
                <SelectContent>
                  {safeMap(options, (option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )

          case "radio":
            const radioOptions = safeGet(field, "options", [])
            return (
              <RadioGroup
                onValueChange={(value) => updateFormData(field.id, value)}
                value={safeGet(formData, field.id, "")}
              >
                {safeMap(radioOptions, (option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                    <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )

          case "checkbox":
            const checkboxOptions = safeGet(field, "options", [])
            return (
              <div className="space-y-2">
                {safeMap(checkboxOptions, (option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.id}-${index}`}
                      checked={(safeGet(formData, field.id, []) || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const currentValues = safeGet(formData, field.id, []) || []
                        if (checked) {
                          updateFormData(field.id, [...currentValues, option])
                        } else {
                          updateFormData(
                            field.id,
                            currentValues.filter((v: string) => v !== option),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                  </div>
                ))}
              </div>
            )

          case "switch":
            return (
              <div className="flex items-center space-x-2">
                <Switch
                  {...commonProps}
                  checked={safeGet(formData, field.id, false)}
                  onCheckedChange={(checked) => updateFormData(field.id, checked)}
                />
                <Label htmlFor={field.id}>{safeGet(field, "placeholder", "Toggle option")}</Label>
              </div>
            )

          case "file":
            return (
              <Input {...commonProps} type="file" onChange={(e) => updateFormData(field.id, e.target.files?.[0])} />
            )

          default:
            return <div className="text-gray-500 text-sm">Unsupported field type: {field.type}</div>
        }
      } catch (error) {
        console.error("Error rendering field:", error)
        return <div className="text-red-500 text-sm">Error rendering field</div>
      }
    },
    [formData, updateFormData],
  )

  const title = safeGet(project, "title", "Form Preview")
  const description = safeGet(project, "description", "")

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {safeMap(fields, (field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {safeGet(field, "label", "Field")}
                {safeGet(field, "required", false) && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
              {safeGet(field, "description") && <p className="text-sm text-gray-500">{field.description}</p>}
            </div>
          ))}

          {fields.length > 0 && (
            <Button type="submit" className="w-full">
              Submit Form
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
