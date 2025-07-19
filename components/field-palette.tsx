"use client"

import type React from "react"

import { useDraggable } from "@dnd-kit/core"
import type { FormFieldType } from "@/lib/types"
import { Card } from "@/components/ui/card"
import {
  Type,
  Mail,
  Phone,
  Calendar,
  Hash,
  ChevronDown,
  CheckSquare,
  Circle,
  FileText,
  Upload,
  ToggleLeft,
} from "lucide-react"

const fieldTypes: Array<{
  type: FormFieldType
  label: string
  icon: React.ReactNode
  description: string
}> = [
  { type: "text", label: "Text Input", icon: <Type className="w-4 h-4" />, description: "Single line text" },
  { type: "textarea", label: "Text Area", icon: <FileText className="w-4 h-4" />, description: "Multi-line text" },
  { type: "email", label: "Email", icon: <Mail className="w-4 h-4" />, description: "Email address" },
  { type: "phone", label: "Phone", icon: <Phone className="w-4 h-4" />, description: "Phone number" },
  { type: "number", label: "Number", icon: <Hash className="w-4 h-4" />, description: "Numeric input" },
  { type: "date", label: "Date", icon: <Calendar className="w-4 h-4" />, description: "Date picker" },
  { type: "select", label: "Dropdown", icon: <ChevronDown className="w-4 h-4" />, description: "Select options" },
  { type: "radio", label: "Radio Group", icon: <Circle className="w-4 h-4" />, description: "Single choice" },
  { type: "checkbox", label: "Checkboxes", icon: <CheckSquare className="w-4 h-4" />, description: "Multiple choice" },
  { type: "file", label: "File Upload", icon: <Upload className="w-4 h-4" />, description: "File attachment" },
  { type: "switch", label: "Toggle Switch", icon: <ToggleLeft className="w-4 h-4" />, description: "On/off toggle" },
]

function DraggableFieldType({
  type,
  label,
  icon,
  description,
}: {
  type: FormFieldType
  label: string
  icon: React.ReactNode
  description: string
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      type: "palette-item",
      fieldType: type,
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 cursor-grab hover:shadow-md transition-shadow ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-blue-600 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900">{label}</h4>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </Card>
  )
}

export function FieldPalette() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Form Fields</h3>
        <p className="text-sm text-gray-600 mb-4">Drag fields to build your form</p>
      </div>

      <div className="space-y-2">
        {fieldTypes.map((fieldType) => (
          <DraggableFieldType key={fieldType.type} {...fieldType} />
        ))}
      </div>
    </div>
  )
}
