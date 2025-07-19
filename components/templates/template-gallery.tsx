"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { FormTemplate } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Star } from "lucide-react"

interface TemplateGalleryProps {
  onSelectTemplate: (template: FormTemplate) => void
}

const mockTemplates: FormTemplate[] = [
  {
    id: "tmpl-contact",
    title: "Contact Form",
    description: "Clean contact form with validation",
    category: "Business",
    fields: [],
    preview: "/placeholder.svg?height=200&width=400",
    isPremium: false,
    downloads: 452,
    rating: 4.5,
  },
  {
    id: "tmpl-survey",
    title: "Customer Survey",
    description: "Collect feedback with multiple question types",
    category: "Survey",
    fields: [],
    preview: "/placeholder.svg?height=200&width=400",
    isPremium: false,
    downloads: 317,
    rating: 4.2,
  },
  {
    id: "tmpl-registration",
    title: "Event Registration",
    description: "Gather attendee details and preferences",
    category: "Events",
    fields: [],
    preview: "/placeholder.svg?height=200&width=400",
    isPremium: true,
    downloads: 201,
    rating: 4.8,
  },
]

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [templates] = useState<FormTemplate[]>(mockTemplates)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Gallery</h2>
        <p className="text-gray-600">Choose a template to kick-start your form.</p>
      </div>

      <ScrollArea className="h-[calc(100vh-250px)] pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="group relative overflow-hidden">
              <CardHeader className="p-0">
                <img
                  src={template.preview || "/placeholder.svg"}
                  alt={`${template.title} preview`}
                  className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                />
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.title}</CardTitle>
                  {template.isPremium && (
                    <Badge variant="destructive" className="text-[10px]">
                      PRO
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {template.downloads}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-500" />
                    {template.rating}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => onSelectTemplate(template)}
                  >
                    Use Template
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent text-gray-500"
                    aria-label="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
