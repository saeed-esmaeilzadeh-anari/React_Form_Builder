"use client"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import type { FormField, FormFieldType, FormProject, FormPage, FormSection } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import {
  Save,
  Eye,
  Share2,
  Settings,
  Plus,
  FileText,
  Layout,
  Layers,
  Zap,
  Crown,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react"
import { PageBuilder } from "@/components/layout/page-builder"
import { FieldPalette } from "@/components/field-palette/field-palette"
import { FormPreview } from "@/components/form-preview"
import { StepNavigator } from "@/components/multi-step/step-navigator"
import { AdvancedTemplates } from "@/components/templates/advanced-templates"
import { toast } from "@/hooks/use-toast"
import { useUltimateSafeState, useUltimateSafeCallback } from "@/lib/safe-components"
import { logger } from "@/lib/logger"

export function FormBuilderAdvanced() {
  const [currentProject, setCurrentProject] = useUltimateSafeState<FormProject>({
    id: `project-${Date.now()}`,
    title: "Advanced Form Builder",
    description: "Create professional multi-step forms with advanced layouts",
    pages: [
      {
        id: `page-${Date.now()}`,
        title: "Page 1",
        description: "First page of your form",
        sections: [],
        navigation: {
          showPrevious: false,
          showNext: true,
          nextButtonText: "Next",
          previousButtonText: "Previous",
        },
        order: 0,
      },
    ],
    fields: [], // Deprecated - keeping for backward compatibility
    theme: "modern",
    settings: {
      allowMultipleSubmissions: true,
      requireAuthentication: false,
      enableAnalytics: true,
      enableNotifications: true,
      multiPage: true,
      showProgressBar: true,
      saveProgress: true,
      autoSave: false,
      submitButtonText: "Submit Form",
      resetButtonText: "Reset",
      validation: "onBlur",
      layout: "vertical",
      animation: "fade",
      responsive: true,
      theme: "modern",
      language: "en",
      accessibility: {
        enabled: true,
        highContrast: false,
        screenReader: true,
        keyboardNavigation: true,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 2,
  })

  const [activeTab, setActiveTab] = useUltimateSafeState("builder")
  const [currentPageIndex, setCurrentPageIndex] = useUltimateSafeState(0)
  const [activeField, setActiveField] = useUltimateSafeState<FormField | null>(null)
  const [allFields, setAllFields] = useUltimateSafeState<FormField[]>([])
  const [previewDevice, setPreviewDevice] = useUltimateSafeState<"desktop" | "tablet" | "mobile">("desktop")
  const [showTemplates, setShowTemplates] = useUltimateSafeState(false)

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
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            section: over.id.toString(),
          },
        }

        if (fieldType === "select" || fieldType === "radio" || fieldType === "checkbox") {
          newField.options = ["Option 1", "Option 2", "Option 3"]
        }

        // Add field to global fields array
        const updatedFields = [...allFields, newField]
        setAllFields(updatedFields)

        // Add field to appropriate section
        const updatedPages = currentProject.pages.map((page) => ({
          ...page,
          sections: page.sections.map((section) => {
            if (section.id === over.id) {
              return {
                ...section,
                fields: [...section.fields, newField],
              }
            }
            return section
          }),
        }))

        updateProject({ pages: updatedPages })

        toast({
          title: "Field Added",
          description: `${newField.label} has been added to your form.`,
        })
      }
    },
    [allFields, currentProject.pages],
  )

  const updateProject = useUltimateSafeCallback(
    (updates: Partial<FormProject>) => {
      const updatedProject = {
        ...currentProject,
        ...updates,
        updatedAt: new Date().toISOString(),
        version: currentProject.version + 1,
      }
      setCurrentProject(updatedProject)
    },
    [currentProject],
  )

  const handlePageAdd = useUltimateSafeCallback(() => {
    const newPage: FormPage = {
      id: `page-${Date.now()}`,
      title: `Page ${currentProject.pages.length + 1}`,
      description: "",
      sections: [],
      navigation: {
        showPrevious: true,
        showNext: true,
        nextButtonText: "Next",
        previousButtonText: "Previous",
      },
      order: currentProject.pages.length,
    }

    updateProject({
      pages: [...currentProject.pages, newPage],
      settings: { ...currentProject.settings, multiPage: true },
    })

    setCurrentPageIndex(currentProject.pages.length)
  }, [currentProject.pages])

  const handlePageUpdate = useUltimateSafeCallback(
    (pageId: string, updates: Partial<FormPage>) => {
      const updatedPages = currentProject.pages.map((page) => (page.id === pageId ? { ...page, ...updates } : page))
      updateProject({ pages: updatedPages })
    },
    [currentProject.pages],
  )

  const handlePageDelete = useUltimateSafeCallback(
    (pageId: string) => {
      if (currentProject.pages.length <= 1) {
        toast({
          title: "Cannot Delete",
          description: "You must have at least one page in your form.",
          variant: "destructive",
        })
        return
      }

      const updatedPages = currentProject.pages.filter((page) => page.id !== pageId)
      updateProject({ pages: updatedPages })

      if (currentPageIndex >= updatedPages.length) {
        setCurrentPageIndex(updatedPages.length - 1)
      }
    },
    [currentProject.pages, currentPageIndex],
  )

  const handleSectionAdd = useUltimateSafeCallback(
    (pageId: string) => {
      const newSection: FormSection = {
        id: `section-${Date.now()}`,
        title: "New Section",
        description: "",
        fields: [],
        layout: {
          type: "single",
          columns: [{ width: "100%", fields: [] }],
          gap: "1rem",
          alignment: "top",
        },
        collapsible: false,
        collapsed: false,
        repeatable: false,
        order: 0,
      }

      const updatedPages = currentProject.pages.map((page) => {
        if (page.id === pageId) {
          return {
            ...page,
            sections: [...page.sections, newSection],
          }
        }
        return page
      })

      updateProject({ pages: updatedPages })
    },
    [currentProject.pages],
  )

  const handleSectionUpdate = useUltimateSafeCallback(
    (sectionId: string, updates: Partial<FormSection>) => {
      const updatedPages = currentProject.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
      }))
      updateProject({ pages: updatedPages })
    },
    [currentProject.pages],
  )

  const handleSectionDelete = useUltimateSafeCallback(
    (sectionId: string) => {
      const updatedPages = currentProject.pages.map((page) => ({
        ...page,
        sections: page.sections.filter((section) => section.id !== sectionId),
      }))
      updateProject({ pages: updatedPages })
    },
    [currentProject.pages],
  )

  const handleFieldUpdate = useUltimateSafeCallback(
    (fieldId: string, updates: Partial<FormField>) => {
      const updatedFields = allFields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field))
      setAllFields(updatedFields)

      // Also update fields in pages/sections
      const updatedPages = currentProject.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) => ({
          ...section,
          fields: section.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
        })),
      }))
      updateProject({ pages: updatedPages })
    },
    [allFields, currentProject.pages],
  )

  const handleFieldDelete = useUltimateSafeCallback(
    (fieldId: string) => {
      const updatedFields = allFields.filter((field) => field.id !== fieldId)
      setAllFields(updatedFields)

      const updatedPages = currentProject.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) => ({
          ...section,
          fields: section.fields.filter((field) => field.id !== fieldId),
        })),
      }))
      updateProject({ pages: updatedPages })
    },
    [allFields, currentProject.pages],
  )

  const saveForm = useUltimateSafeCallback(async () => {
    try {
      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Form Saved Successfully! 🎉",
        description: "Your advanced form has been saved to the cloud.",
      })
    } catch (error) {
      logger.error("Failed to save form", { error })
      toast({
        title: "Save Failed",
        description: "Failed to save form. Please try again.",
        variant: "destructive",
      })
    }
  }, [currentProject])

  const shareForm = useUltimateSafeCallback(async () => {
    try {
      const shareUrl = `${window.location.origin}/form/${currentProject.id}`
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Share Link Copied! 🔗",
        description: "Form share link has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy share link.",
        variant: "destructive",
      })
    }
  }, [currentProject])

  const currentPage = currentProject.pages[currentPageIndex]

  const getDeviceWidth = () => {
    switch (previewDevice) {
      case "mobile":
        return "max-w-sm"
      case "tablet":
        return "max-w-2xl"
      default:
        return "max-w-4xl"
    }
  }

  if (showTemplates) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <AdvancedTemplates
          onSelectTemplate={(template) => {
            // Convert template to project format
            const newProject: FormProject = {
              ...currentProject,
              title: template.title,
              description: template.description,
              pages: template.pages.length > 0 ? template.pages : currentProject.pages,
            }
            setCurrentProject(newProject)
            setShowTemplates(false)
            toast({
              title: "Template Applied",
              description: `${template.title} template has been applied to your form.`,
            })
          }}
          onCreateFromScratch={() => setShowTemplates(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Advanced Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50"
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
                  <span className="text-xs text-gray-500">Advanced Builder</span>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Auto-Save On
              </Badge>

              <Badge variant="outline" className="text-xs">
                v{currentProject.version}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowTemplates(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>

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
          {/* Enhanced Field Palette */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-80 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Form Structure</span>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePageAdd}
                  className="w-full justify-start bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Page
                </Button>

                <StepNavigator
                  pages={currentProject.pages}
                  currentPageIndex={currentPageIndex}
                  onPageChange={setCurrentPageIndex}
                  onSubmit={() => {}}
                  isSubmitting={false}
                  showProgress={true}
                  showPagePreview={true}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <FieldPalette />
            </ScrollArea>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-white/50 backdrop-blur-sm">
                  <TabsTrigger value="builder" className="data-[state=active]:bg-white">
                    <Layout className="w-4 h-4 mr-2" />
                    Builder
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="data-[state=active]:bg-white">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                {activeTab === "preview" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewDevice === "desktop" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewDevice("desktop")}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewDevice === "tablet" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewDevice("tablet")}
                    >
                      <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewDevice === "mobile" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewDevice("mobile")}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                <TabsContent value="builder" className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <Card className="h-full bg-white/50 backdrop-blur-sm border-gray-200/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {currentPage?.title || "Untitled Page"}
                          </CardTitle>

                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              Page {currentPageIndex + 1} of {currentProject.pages.length}
                            </Badge>

                            <Badge variant="outline">{currentPage?.sections.length || 0} sections</Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="h-[calc(100%-80px)] overflow-hidden">
                        <ScrollArea className="h-full pr-4">
                          {currentPage && (
                            <PageBuilder
                              page={currentPage}
                              onPageUpdate={handlePageUpdate}
                              onPageDelete={handlePageDelete}
                              onPageDuplicate={() => {}}
                              onSectionAdd={handleSectionAdd}
                              onSectionUpdate={handleSectionUpdate}
                              onSectionDelete={handleSectionDelete}
                              onSectionDuplicate={() => {}}
                              onFieldAdd={() => {}}
                              onFieldUpdate={handleFieldUpdate}
                              onFieldDelete={handleFieldDelete}
                              onFieldDuplicate={() => {}}
                              availableFields={allFields}
                              isActive={true}
                              onActivate={() => {}}
                              totalPages={currentProject.pages.length}
                              currentPageIndex={currentPageIndex}
                            />
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="preview" className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full flex justify-center"
                  >
                    <div className={`w-full ${getDeviceWidth()} transition-all duration-300`}>
                      <Card className="h-full bg-white/50 backdrop-blur-sm border-gray-200/50">
                        <CardContent className="p-6 h-full">
                          <FormPreview project={currentProject} fields={allFields} theme={currentProject.theme} />
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="settings" className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <Card className="h-full bg-white/50 backdrop-blur-sm border-gray-200/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          Form Settings
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="h-[calc(100%-80px)] overflow-hidden">
                        <ScrollArea className="h-full pr-4">
                          <div className="space-y-6">
                            {/* General Settings */}
                            <div>
                              <h3 className="text-lg font-semibold mb-4">General</h3>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="form-title">Form Title</Label>
                                  <Input
                                    id="form-title"
                                    value={currentProject.title}
                                    onChange={(e) => updateProject({ title: e.target.value })}
                                    className="mt-2"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="form-description">Description</Label>
                                  <Input
                                    id="form-description"
                                    value={currentProject.description}
                                    onChange={(e) => updateProject({ description: e.target.value })}
                                    className="mt-2"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="form-theme">Theme</Label>
                                  <Select
                                    value={currentProject.theme}
                                    onValueChange={(value) => updateProject({ theme: value as any })}
                                  >
                                    <SelectTrigger className="mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="modern">Modern</SelectItem>
                                      <SelectItem value="classic">Classic</SelectItem>
                                      <SelectItem value="minimal">Minimal</SelectItem>
                                      <SelectItem value="dark">Dark</SelectItem>
                                      <SelectItem value="colorful">Colorful</SelectItem>
                                      <SelectItem value="glassmorphism">Glassmorphism</SelectItem>
                                      <SelectItem value="neumorphism">Neumorphism</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Multi-Page Settings */}
                            <div>
                              <h3 className="text-lg font-semibold mb-4">Multi-Page Form</h3>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label>Enable Multi-Page</Label>
                                  <Switch
                                    checked={currentProject.settings.multiPage}
                                    onCheckedChange={(checked) =>
                                      updateProject({
                                        settings: { ...currentProject.settings, multiPage: checked },
                                      })
                                    }
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label>Show Progress Bar</Label>
                                  <Switch
                                    checked={currentProject.settings.showProgressBar}
                                    onCheckedChange={(checked) =>
                                      updateProject({
                                        settings: { ...currentProject.settings, showProgressBar: checked },
                                      })
                                    }
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label>Save Progress</Label>
                                  <Switch
                                    checked={currentProject.settings.saveProgress}
                                    onCheckedChange={(checked) =>
                                      updateProject({
                                        settings: { ...currentProject.settings, saveProgress: checked },
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Advanced Settings */}
                            <div>
                              <h3 className="text-lg font-semibold mb-4">Advanced</h3>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label>Auto-Save</Label>
                                  <Switch
                                    checked={currentProject.settings.autoSave}
                                    onCheckedChange={(checked) =>
                                      updateProject({
                                        settings: { ...currentProject.settings, autoSave: checked },
                                      })
                                    }
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label>Enable Analytics</Label>
                                  <Switch
                                    checked={currentProject.settings.enableAnalytics}
                                    onCheckedChange={(checked) =>
                                      updateProject({
                                        settings: { ...currentProject.settings, enableAnalytics: checked },
                                      })
                                    }
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label>Responsive Design</Label>
                                  <Switch
                                    checked={currentProject.settings.responsive}
                                    onCheckedChange={(checked) =>
                                      updateProject({
                                        settings: { ...currentProject.settings, responsive: checked },
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>

          <DragOverlay>
            {activeField && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200 backdrop-blur-sm"
              >
                <span className="text-sm font-medium text-gray-700">{activeField.label}</span>
                <div className="text-xs text-gray-500 mt-1">{activeField.type}</div>
              </motion.div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
