"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { FormField, FormProject } from "@/lib/types"
import { SortableFieldItem } from "@/components/sortable-field-item"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useUltimateSafeState, useUltimateSafeCallback, withUltimateSafeRender } from "@/lib/safe-components"

interface FormBuilderProps {
  project?: FormProject
  formFields?: FormField[]
  onProjectUpdate?: (updates: Partial<FormProject>) => void
  onFieldUpdate?: (fieldId: string, updates: Partial<FormField>) => void
  onFieldDelete?: (fieldId: string) => void
  onFieldDuplicate?: (fieldId: string) => void
  onFieldsReorder?: (fields: FormField[]) => void
  collaborationState?: any
}

function FormBuilderComponent({
  project,
  formFields = [],
  onProjectUpdate,
  onFieldUpdate,
  onFieldDelete,
  onFieldDuplicate,
}: FormBuilderProps) {
  const { setNodeRef } = useDroppable({
    id: "form-builder",
  })

  const [localTitle, setLocalTitle] = useUltimateSafeState(project?.title || "Untitled Form")
  const [localDescription, setLocalDescription] = useUltimateSafeState(project?.description || "")

  const handleTitleChange = useUltimateSafeCallback(
    (value: string) => {
      setLocalTitle(value)
      onProjectUpdate?.({ title: value })
    },
    [onProjectUpdate],
  )

  const handleDescriptionChange = useUltimateSafeCallback(
    (value: string) => {
      setLocalDescription(value)
      onProjectUpdate?.({ description: value })
    },
    [onProjectUpdate],
  )

  const handleFieldUpdate = useUltimateSafeCallback(
    (fieldId: string, updates: Partial<FormField>) => {
      onFieldUpdate?.(fieldId, updates)
    },
    [onFieldUpdate],
  )

  const handleFieldDelete = useUltimateSafeCallback(
    (fieldId: string) => {
      onFieldDelete?.(fieldId)
    },
    [onFieldDelete],
  )

  const handleFieldDuplicate = useUltimateSafeCallback(
    (fieldId: string) => {
      onFieldDuplicate?.(fieldId)
    },
    [onFieldDuplicate],
  )

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="space-y-4 pb-6 border-b border-gray-200">
        <div>
          <Label htmlFor="form-title">Form Title</Label>
          <Input
            id="form-title"
            value={localTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter form title..."
            className="text-lg font-semibold"
          />
        </div>
        <div>
          <Label htmlFor="form-description">Form Description</Label>
          <Textarea
            id="form-description"
            value={localDescription}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Enter form description..."
            rows={2}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div ref={setNodeRef} className="space-y-4 min-h-[400px]">
        {formFields.length === 0 ? (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">No fields added yet</p>
              <p className="text-gray-400 text-sm">Drag fields from the palette to start building your form</p>
            </div>
          </div>
        ) : (
          <SortableContext items={formFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {formFields.map((field) => (
              <SortableFieldItem
                key={field.id}
                field={field}
                onUpdate={handleFieldUpdate}
                onDelete={handleFieldDelete}
                onDuplicate={handleFieldDuplicate}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  )
}

export const FormBuilder = withUltimateSafeRender(FormBuilderComponent, {
  fallback: <div className="p-8 text-center text-gray-500">Loading form builder...</div>,
  errorFallback: <div className="p-8 text-center text-red-500">Form builder failed to load</div>,
})
