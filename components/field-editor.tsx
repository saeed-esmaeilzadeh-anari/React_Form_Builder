"use client"

import { useState } from "react"
import type { FormField } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

interface FieldEditorProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
}

export function FieldEditor({ field, onUpdate }: FieldEditorProps) {
  const [newOption, setNewOption] = useState("")

  const addOption = () => {
    if (newOption.trim() && field.options) {
      onUpdate({ options: [...field.options, newOption.trim()] })
      setNewOption("")
    }
  }

  const removeOption = (index: number) => {
    if (field.options) {
      const newOptions = field.options.filter((_, i) => i !== index)
      onUpdate({ options: newOptions })
    }
  }

  const updateOption = (index: number, value: string) => {
    if (field.options) {
      const newOptions = [...field.options]
      newOptions[index] = value
      onUpdate({ options: newOptions })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {field.type.toUpperCase()}
        </Badge>
        {field.required && (
          <Badge variant="destructive" className="text-xs">
            Required
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`label-${field.id}`}>Field Label</Label>
          <Input
            id={`label-${field.id}`}
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Enter field label..."
          />
        </div>
        <div>
          <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
          <Input
            id={`placeholder-${field.id}`}
            value={field.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Enter placeholder text..."
          />
        </div>
      </div>

      {field.type === "textarea" && (
        <div>
          <Label htmlFor={`rows-${field.id}`}>Rows</Label>
          <Input
            id={`rows-${field.id}`}
            type="number"
            min="2"
            max="10"
            value={field.rows || 3}
            onChange={(e) => onUpdate({ rows: Number.parseInt(e.target.value) || 3 })}
          />
        </div>
      )}

      {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
        <div>
          <Label>Options</Label>
          <div className="space-y-2 mt-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add new option..."
                onKeyPress={(e) => e.key === "Enter" && addOption()}
              />
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id={`required-${field.id}`}
          checked={field.required}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
        <Label htmlFor={`required-${field.id}`}>Required field</Label>
      </div>

      {field.description && (
        <div>
          <Label htmlFor={`description-${field.id}`}>Help Text</Label>
          <Textarea
            id={`description-${field.id}`}
            value={field.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Enter help text..."
            rows={2}
          />
        </div>
      )}
    </div>
  )
}
