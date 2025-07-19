"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { FormField } from "@/lib/types"
import { FieldEditor } from "@/components/field-editor"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, Copy, Trash2 } from "lucide-react"

interface SortableFieldItemProps {
  field: FormField
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void
  onDelete: (fieldId: string) => void
  onDuplicate: (fieldId: string) => void
}

export function SortableFieldItem({ field, onUpdate, onDelete, onDuplicate }: SortableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card ref={setNodeRef} style={style} className={`p-4 ${isDragging ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 mt-2"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1">
          <FieldEditor field={field} onUpdate={(updates) => onUpdate(field.id, updates)} />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(field.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(field.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
