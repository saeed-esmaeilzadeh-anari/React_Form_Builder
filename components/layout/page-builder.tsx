"use client"
import type { FormPage, FormSection, FormField } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Settings, Copy, Trash2, ChevronLeft, ChevronRight, FileText, Layout } from "lucide-react"
import { SectionBuilder } from "./section-builder"
import { useSafeState, useSafeCallback } from "@/lib/safe-components"

interface PageBuilderProps {
  page: FormPage
  onPageUpdate: (pageId: string, updates: Partial<FormPage>) => void
  onPageDelete: (pageId: string) => void
  onPageDuplicate: (pageId: string) => void
  onSectionAdd: (pageId: string) => void
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
  totalPages: number
  currentPageIndex: number
}

export function PageBuilder({
  page,
  onPageUpdate,
  onPageDelete,
  onPageDuplicate,
  onSectionAdd,
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
  totalPages,
  currentPageIndex,
}: PageBuilderProps) {
  const [showSettings, setShowSettings] = useSafeState(false)
  const [activeSection, setActiveSection] = useSafeState<string | null>(null)

  const handleSectionAdd = useSafeCallback(() => {
    onSectionAdd(page.id)
  }, [page.id, onSectionAdd])

  const handleSectionActivate = useSafeCallback((sectionId: string) => {
    setActiveSection(sectionId)
  }, [])

  const sortedSections = [...page.sections].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      <Card
        className={`transition-all duration-200 ${isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"}`}
        onClick={onActivate}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <Badge variant="secondary" className="text-xs">
                  Page {currentPageIndex + 1} of {totalPages}
                </Badge>
              </div>

              <div className="flex-1">
                <Input
                  value={page.title}
                  onChange={(e) => onPageUpdate(page.id, { title: e.target.value })}
                  className="font-semibold text-lg bg-transparent border-none p-0 h-auto"
                  placeholder="Page Title"
                />
                {page.description && (
                  <Textarea
                    value={page.description}
                    onChange={(e) => onPageUpdate(page.id, { description: e.target.value })}
                    className="mt-2 bg-transparent border-none p-0 text-sm text-gray-600 resize-none"
                    placeholder="Page Description"
                    rows={2}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {sortedSections.length} sections
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
                onClick={() => onPageDuplicate(page.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageDelete(page.id)}
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
              <Tabs defaultValue="navigation" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="navigation">Navigation</TabsTrigger>
                  <TabsTrigger value="logic">Logic</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>

                <TabsContent value="navigation" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Show Previous Button</Label>
                      <Switch
                        checked={page.navigation?.showPrevious ?? true}
                        onCheckedChange={(checked) =>
                          onPageUpdate(page.id, {
                            navigation: { ...page.navigation, showPrevious: checked },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Show Next Button</Label>
                      <Switch
                        checked={page.navigation?.showNext ?? true}
                        onCheckedChange={(checked) =>
                          onPageUpdate(page.id, {
                            navigation: { ...page.navigation, showNext: checked },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Previous Button Text</Label>
                      <Input
                        value={page.navigation?.previousButtonText || "Previous"}
                        onChange={(e) =>
                          onPageUpdate(page.id, {
                            navigation: { ...page.navigation, previousButtonText: e.target.value },
                          })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Next Button Text</Label>
                      <Input
                        value={page.navigation?.nextButtonText || "Next"}
                        onChange={(e) =>
                          onPageUpdate(page.id, {
                            navigation: { ...page.navigation, nextButtonText: e.target.value },
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logic" className="space-y-4">
                  <div>
                    <Label>Conditional Logic</Label>
                    <p className="text-sm text-gray-600 mt-1">Show/hide this page based on previous answers</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
                  <div>
                    <Label>Page Styling</Label>
                    <p className="text-sm text-gray-600 mt-1">Customize the appearance of this page</p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        Default
                      </Button>
                      <Button variant="outline" size="sm">
                        Centered
                      </Button>
                      <Button variant="outline" size="sm">
                        Wide
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-4">
          <div className="space-y-4">
            {sortedSections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Layout className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No sections added yet</p>
                <Button onClick={handleSectionAdd} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {sortedSections.map((section) => (
                    <SectionBuilder
                      key={section.id}
                      section={section}
                      onSectionUpdate={onSectionUpdate}
                      onSectionDelete={onSectionDelete}
                      onSectionDuplicate={onSectionDuplicate}
                      onFieldAdd={onFieldAdd}
                      onFieldUpdate={onFieldUpdate}
                      onFieldDelete={onFieldDelete}
                      onFieldDuplicate={onFieldDuplicate}
                      availableFields={availableFields}
                      isActive={activeSection === section.id}
                      onActivate={() => handleSectionActivate(section.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <Button onClick={handleSectionAdd} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>

            <div className="flex items-center gap-2">
              {currentPageIndex > 0 && (
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous Page
                </Button>
              )}

              {currentPageIndex < totalPages - 1 && (
                <Button variant="ghost" size="sm">
                  Next Page
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
