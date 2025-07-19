"use client"
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { FormSection, FormField, FormLayout } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Grip,
  Settings,
  Copy,
  Trash2,
  Layout,
  Columns,
  Grid3X3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react"
import { SortableFieldItem } from "@/components/sortable-field-item"
import { useSafeState, useSafeCallback } from "@/lib/safe-components"

interface SectionBuilderProps {
  section: FormSection
  onSectionUpdate: (sectionId: string, updates: Partial<FormSection>) => void
  onSectionDelete: (sectionId: string) => void
  onSectionDuplicate: (sectionId: string) => void
  onFieldAdd: (sectionId: string, fieldType: string) => void
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void
  onFieldDelete: (fieldId: string) => void
  onFieldDuplicate: (fieldId: string) => void
  availableFields: FormField[]
  isActive: boolean
  onActivate: () => void
}

export function SectionBuilder({
  section,
  onSectionUpdate,
  onSectionDelete,
  onSectionDuplicate,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  onFieldDuplicate,
  availableFields,
  isActive,
  onActivate,
}: SectionBuilderProps) {
  const [showSettings, setShowSettings] = useSafeState(false)
  const [draggedField, setDraggedField] = useSafeState<FormField | null>(null)

  const handleDragStart = useSafeCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const field = availableFields.find((f) => f.id === active.id)
      if (field) {
        setDraggedField(field)
      }
    },
    [availableFields],
  )

  const handleDragEnd = useSafeCallback((event: DragEndEvent) => {
    setDraggedField(null)
    // Handle field reordering within section
  }, [])

  const handleLayoutChange = useSafeCallback(
    (layoutType: FormLayout["type"]) => {
      const newLayout: FormLayout = {
        type: layoutType,
        columns: [],
        gap: "1rem",
        alignment: "top",
      }

      switch (layoutType) {
        case "single":
          newLayout.columns = [{ width: "100%", fields: section.fields.map((f) => f.id) }]
          break
        case "two-column":
          newLayout.columns = [
            { width: "50%", fields: [] },
            { width: "50%", fields: [] },
          ]
          break
        case "three-column":
          newLayout.columns = [
            { width: "33.333%", fields: [] },
            { width: "33.333%", fields: [] },
            { width: "33.333%", fields: [] },
          ]
          break
        case "four-column":
          newLayout.columns = [
            { width: "25%", fields: [] },
            { width: "25%", fields: [] },
            { width: "25%", fields: [] },
            { width: "25%", fields: [] },
          ]
          break
      }

      onSectionUpdate(section.id, { layout: newLayout })
    },
    [section, onSectionUpdate],
  )

  const sectionFields = availableFields.filter((field) =>
    section.fields.some((sectionField) => sectionField.id === field.id),
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 border-dashed transition-all duration-200 ${
        isActive ? "border-blue-500 bg-blue-50/50" : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <Card className={`m-2 ${isActive ? "ring-2 ring-blue-500" : ""}`} onClick={onActivate}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="cursor-grab hover:cursor-grabbing">
                <Grip className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <Input
                  value={section.title}
                  onChange={(e) => onSectionUpdate(section.id, { title: e.target.value })}
                  className="font-semibold text-lg bg-transparent border-none p-0 h-auto"
                  placeholder="Section Title"
                />
                {section.description && (
                  <Textarea
                    value={section.description}
                    onChange={(e) => onSectionUpdate(section.id, { description: e.target.value })}
                    className="mt-2 bg-transparent border-none p-0 text-sm text-gray-600 resize-none"
                    placeholder="Section Description"
                    rows={2}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {sectionFields.length} fields
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Settings className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSectionDuplicate(section.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSectionDelete(section.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-4"
            >
              <Tabs defaultValue="layout" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="logic">Logic</TabsTrigger>
                </TabsList>

                <TabsContent value="layout" className="space-y-4">
                  <div>
                    <Label>Column Layout</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <Button
                        variant={section.layout.type === "single" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLayoutChange("single")}
                        className="h-12"
                      >
                        <Layout className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={section.layout.type === "two-column" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLayoutChange("two-column")}
                        className="h-12"
                      >
                        <Columns className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={section.layout.type === "three-column" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLayoutChange("three-column")}
                        className="h-12"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={section.layout.type === "four-column" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLayoutChange("four-column")}
                        className="h-12"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Alignment</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <Button
                        variant={section.layout.alignment === "top" ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          onSectionUpdate(section.id, {
                            layout: { ...section.layout, alignment: "top" },
                          })
                        }
                      >
                        <AlignLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={section.layout.alignment === "center" ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          onSectionUpdate(section.id, {
                            layout: { ...section.layout, alignment: "center" },
                          })
                        }
                      >
                        <AlignCenter className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={section.layout.alignment === "bottom" ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          onSectionUpdate(section.id, {
                            layout: { ...section.layout, alignment: "bottom" },
                          })
                        }
                      >
                        <AlignRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={section.layout.alignment === "stretch" ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          onSectionUpdate(section.id, {
                            layout: { ...section.layout, alignment: "stretch" },
                          })
                        }
                      >
                        <AlignJustify className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Collapsible</Label>
                    <Switch
                      checked={section.collapsible}
                      onCheckedChange={(checked) => onSectionUpdate(section.id, { collapsible: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Repeatable</Label>
                    <Switch
                      checked={section.repeatable}
                      onCheckedChange={(checked) => onSectionUpdate(section.id, { repeatable: checked })}
                    />
                  </div>

                  {section.repeatable && (
                    <div>
                      <Label>Max Repeats</Label>
                      <Input
                        type="number"
                        value={section.maxRepeats || 10}
                        onChange={(e) => onSectionUpdate(section.id, { maxRepeats: Number.parseInt(e.target.value) })}
                        className="mt-2"
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="logic" className="space-y-4">
                  <div>
                    <Label>Conditional Logic</Label>
                    <p className="text-sm text-gray-600 mt-1">Show/hide this section based on other field values</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-4">
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div
              className={`grid gap-4 ${
                section.layout.type === "single"
                  ? "grid-cols-1"
                  : section.layout.type === "two-column"
                    ? "grid-cols-2"
                    : section.layout.type === "three-column"
                      ? "grid-cols-3"
                      : section.layout.type === "four-column"
                        ? "grid-cols-4"
                        : "grid-cols-1"
              }`}
            >
              {section.layout.columns.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-2">
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Column {columnIndex + 1}
                  </div>
                  <div className="min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg p-2">
                    {column.fields.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        <Layout className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Drop fields here</p>
                      </div>
                    ) : (
                      <SortableContext items={column.fields} strategy={verticalListSortingStrategy}>
                        {column.fields.map((fieldId) => {
                          const field = sectionFields.find((f) => f.id === fieldId)
                          if (!field) return null
                          return (
                            <SortableFieldItem
                              key={field.id}
                              field={field}
                              onUpdate={onFieldUpdate}
                              onDelete={onFieldDelete}
                              onDuplicate={onFieldDuplicate}
                            />
                          )
                        })}
                      </SortableContext>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <DragOverlay>
              {draggedField && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white p-4 rounded-lg shadow-2xl border"
                >
                  <span className="text-sm font-medium">{draggedField.label}</span>
                  <div className="text-xs text-gray-500 mt-1">{draggedField.type}</div>
                </motion.div>
              )}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>
    </motion.div>
  )
}
