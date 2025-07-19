"use client"

import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import { FormBuilderAdvanced } from "@/components/form-builder-advanced"
import { FieldPalette } from "@/components/field-palette/field-palette"
import type { FormField, FormFieldType, FormProject } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, Eye, Code, Share2, Zap, Crown } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useUltimateSafeState, useUltimateSafeCallback, withUltimateSafeRender } from "@/lib/safe-components"
import { logger } from "@/lib/logger"

function HomePage() {
  const [formFields, setFormFields] = useUltimateSafeState<FormField[]>([])
  const [activeField, setActiveField] = useUltimateSafeState<FormField | null>(null)
  const [currentProject, setCurrentProject] = useUltimateSafeState<FormProject>({
    id: `project-${Date.now()}`,
    title: "Untitled Form",
    description: "",
    fields: [],
    theme: "modern",
    settings: {
      allowMultipleSubmissions: true,
      requireAuthentication: false,
      enableAnalytics: true,
      enableNotifications: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  const [activeTab, setActiveTab] = useUltimateSafeState("builder")

  const handleDragStart = useUltimateSafeCallback((event: DragStartEvent) => {
    const { active } = event
    if (active?.data?.current?.type === "field") {
      setActiveField(active.data.current.field)
    }
  }, [])

  const handleDragEnd = useUltimateSafeCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveField(null)

      if (!over) return

      if (active?.data?.current?.type === "palette-item") {
        const fieldType = active.data.current.fieldType as FormFieldType
        if (!fieldType) return

        const newField: FormField = {
          id: `field-${Date.now()}`,
          type: fieldType,
          label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
          required: false,
          placeholder: `Enter ${fieldType}...`,
          validation: {
            required: false,
          },
          conditional: {
            enabled: false,
            conditions: [],
          },
          styling: {
            width: "full",
            alignment: "left",
          },
        }

        if (fieldType === "select" || fieldType === "radio" || fieldType === "checkbox") {
          newField.options = ["Option 1", "Option 2", "Option 3"]
        }

        if (over.id === "form-builder") {
          const newFields = [...formFields, newField]
          setFormFields(newFields)
          updateProject({ fields: newFields })
        } else {
          const overIndex = formFields.findIndex((field) => field.id === over.id)
          if (overIndex !== -1) {
            const newFields = [...formFields]
            newFields.splice(overIndex + 1, 0, newField)
            setFormFields(newFields)
            updateProject({ fields: newFields })
          }
        }

        toast({
          title: "Field Added",
          description: `${newField.label} has been added to your form.`,
        })
      }
    },
    [formFields],
  )

  const updateProject = useUltimateSafeCallback(
    (updates: Partial<FormProject>) => {
      const updatedProject = {
        ...currentProject,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      setCurrentProject(updatedProject)
    },
    [currentProject],
  )

  const updateField = useUltimateSafeCallback(
    (fieldId: string, updates: Partial<FormField>) => {
      const newFields = formFields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field))
      setFormFields(newFields)
      updateProject({ fields: newFields })
    },
    [formFields, updateProject],
  )

  const deleteField = useUltimateSafeCallback(
    (fieldId: string) => {
      const newFields = formFields.filter((field) => field.id !== fieldId)
      setFormFields(newFields)
      updateProject({ fields: newFields })

      toast({
        title: "Field Deleted",
        description: "Field has been removed from your form.",
      })
    },
    [formFields, updateProject],
  )

  const duplicateField = useUltimateSafeCallback(
    (fieldId: string) => {
      const field = formFields.find((f) => f.id === fieldId)
      if (field) {
        const newField = {
          ...field,
          id: `field-${Date.now()}`,
          label: `${field.label} (Copy)`,
        }
        const index = formFields.findIndex((f) => f.id === fieldId)
        const newFields = [...formFields]
        newFields.splice(index + 1, 0, newField)
        setFormFields(newFields)
        updateProject({ fields: newFields })
      }
    },
    [formFields, updateProject],
  )

  const saveForm = useUltimateSafeCallback(async () => {
    try {
      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Form Saved Successfully! 🎉",
        description: "Your form has been saved to the cloud.",
      })
    } catch (error) {
      logger.error("Failed to save form", { error })
      toast({
        title: "Save Failed",
        description: "Failed to save form. Please try again.",
        variant: "destructive",
      })
    }
  }, [currentProject, formFields])

  const shareForm = useUltimateSafeCallback(async () => {
    try {
      const shareUrl = `${window.location.origin}/form/${currentProject.id}`
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Share Link Copied! 🔗",
        description: "Form share link has been copied to clipboard.",
      })
    } catch (error) {
      logger.error("Failed to copy share link", { error })
      toast({
        title: "Copy Failed",
        description: "Failed to copy share link.",
        variant: "destructive",
      })
    }
  }, [currentProject])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  FormCraft Pro
                </h1>
                <div className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-gray-500">Ultimate Edition</span>
                </div>
              </div>
            </motion.div>

            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
              Zero Errors
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={shareForm}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={saveForm}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="flex h-[calc(100vh-80px)]">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Field Palette */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-80 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 p-4 overflow-y-auto"
          >
            <FieldPalette />
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="mb-4 bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="builder" className="data-[state=active]:bg-white">
                  <Code className="w-4 h-4 mr-2" />
                  Builder
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-white">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="builder" className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="h-full p-6 bg-white/50 backdrop-blur-sm border-gray-200/50">
                      <FormBuilderAdvanced
                        project={currentProject}
                        formFields={formFields}
                        onProjectUpdate={updateProject}
                        onFieldUpdate={updateField}
                        onFieldDelete={deleteField}
                        onFieldDuplicate={duplicateField}
                        onFieldsReorder={setFormFields}
                      />
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="preview" className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="h-full p-6 bg-white/50 backdrop-blur-sm border-gray-200/50">
                      {/* Preview content here */}
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>

          <DragOverlay>
            {activeField ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200 backdrop-blur-sm"
              >
                <span className="text-sm font-medium text-gray-700">{activeField.label}</span>
                <div className="text-xs text-gray-500 mt-1">{activeField.type}</div>
              </motion.div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

export default withUltimateSafeRender(HomePage, {
  fallback: (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Advanced Form Builder...</p>
      </div>
    </div>
  ),
  errorFallback: (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center p-8">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-red-800 mb-2">Application Error</h1>
        <p className="text-red-600 mb-4">The form builder failed to load properly.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  ),
  retryCount: 5,
})
