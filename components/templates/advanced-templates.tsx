"use client"
import type { FormTemplate } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Download,
  Eye,
  Star,
  Clock,
  Building,
  FileText,
  CreditCard,
  Shield,
  MessageSquare,
  Calendar,
  Users,
  Settings,
  Crown,
} from "lucide-react"
import { useSafeState, useSafeCallback } from "@/lib/safe-components"

interface AdvancedTemplatesProps {
  onSelectTemplate: (template: FormTemplate) => void
  onCreateFromScratch: () => void
}

const advancedTemplates: FormTemplate[] = [
  {
    id: "login-form",
    title: "Advanced Login Form",
    description: "Professional login with social auth, forgot password, and security features",
    category: "Authentication",
    pages: [],
    fields: [],
    preview: "/placeholder.svg?height=300&width=500&text=Login+Form",
    isPremium: false,
    downloads: 2847,
    rating: 4.8,
    tags: ["login", "authentication", "security", "responsive"],
    difficulty: "intermediate",
    estimatedTime: 15,
    features: ["Social Login", "Password Reset", "Remember Me", "Two-Factor Auth"],
  },
  {
    id: "registration-form",
    title: "Multi-Step Registration",
    description: "Complete registration process with validation and progress tracking",
    category: "Authentication",
    pages: [],
    fields: [],
    preview: "/placeholder.svg?height=300&width=500&text=Registration+Form",
    isPremium: false,
    downloads: 1923,
    rating: 4.6,
    tags: ["registration", "multi-step", "validation", "progress"],
    difficulty: "intermediate",
    estimatedTime: 25,
    features: ["Multi-Step", "Progress Bar", "Validation", "File Upload"],
  },
  {
    id: "contact-form-pro",
    title: "Professional Contact Form",
    description: "Advanced contact form with department routing and file attachments",
    category: "Business",
    pages: [],
    fields: [],
    preview: "/placeholder.svg?height=300&width=500&text=Contact+Form",
    isPremium: false,
    downloads: 3421,
    rating: 4.9,
    tags: ["contact", "business", "routing", "attachments"],
    difficulty: "beginner",
    estimatedTime: 10,
    features: ["Department Routing", "File Attachments", "Auto-Reply", "Spam Protection"],
  },
  {
    id: "survey-form",
    title: "Advanced Survey Builder",
    description: "Comprehensive survey with conditional logic and analytics",
    category: "Survey",
    pages: [],
    fields: [],
    preview: "/placeholder.svg?height=300&width=500&text=Survey+Form",
    isPremium: true,
    downloads: 892,
    rating: 4.7,
    tags: ["survey", "conditional", "analytics", "reporting"],
    difficulty: "advanced",
    estimatedTime: 45,
    features: ["Conditional Logic", "Analytics", "Reporting", "Export Data"],
  },
  {
    id: "payment-form",
    title: "Secure Payment Form",
    description: "PCI-compliant payment form with multiple gateways",
    category: "E-commerce",
    pages: [],
    fields: [],
    preview: "/placeholder.svg?height=300&width=500&text=Payment+Form",
    isPremium: true,
    downloads: 567,
    rating: 4.5,
    tags: ["payment", "security", "e-commerce", "pci"],
    difficulty: "advanced",
    estimatedTime: 35,
    features: ["PCI Compliance", "Multiple Gateways", "Secure Processing", "Receipt Generation"],
  },
  {
    id: "job-application",
    title: "Job Application Form",
    description: "Complete job application with resume upload and screening",
    category: "HR",
    pages: [],
    fields: [],
    preview: "/placeholder.svg?height=300&width=500&text=Job+Application",
    isPremium: false,
    downloads: 1456,
    rating: 4.4,
    tags: ["job", "hr", "resume", "screening"],
    difficulty: "intermediate",
    estimatedTime: 30,
    features: ["Resume Upload", "Screening Questions", "References", "Status Tracking"],
  },
  {
    id: "event-registration",
    title: "Event Registration Form",
    description: "Comprehensive event registration with ticketing and payments",
    category: "Events",
    pages: [],
    fields: [],
    preview: "/placeholder.svg?height=300&width=500&text=Event+Registration",
    isPremium: true,
    downloads: 734,
    rating: 4.6,
    tags: ["event", "registration", "ticketing", "payment"],
    difficulty: "advanced",
    estimatedTime: 40,
    features: ["Ticketing System", "Payment Integration", "Attendee Management", "QR Codes"],
  },
  {
    id: "feedback-form",
    title: "Customer Feedback Form",
    description: "Detailed feedback collection with rating scales and analytics",
    category: "Business",
    pages: [],
    fields: [],
    preview: "/placeholder.svg?height=300&width=500&text=Feedback+Form",
    isPremium: false,
    downloads: 2156,
    rating: 4.7,
    tags: ["feedback", "rating", "analytics", "customer"],
    difficulty: "intermediate",
    estimatedTime: 20,
    features: ["Rating Scales", "Analytics", "Sentiment Analysis", "Auto-Responses"],
  },
]

const categories = [
  { id: "all", label: "All Templates", icon: <FileText className="w-4 h-4" /> },
  { id: "Authentication", label: "Authentication", icon: <Shield className="w-4 h-4" /> },
  { id: "Business", label: "Business", icon: <Building className="w-4 h-4" /> },
  { id: "Survey", label: "Survey", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "E-commerce", label: "E-commerce", icon: <CreditCard className="w-4 h-4" /> },
  { id: "HR", label: "HR", icon: <Users className="w-4 h-4" /> },
  { id: "Events", label: "Events", icon: <Calendar className="w-4 h-4" /> },
]

const difficulties = [
  { id: "all", label: "All Levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
]

export function AdvancedTemplates({ onSelectTemplate, onCreateFromScratch }: AdvancedTemplatesProps) {
  const [searchTerm, setSearchTerm] = useSafeState("")
  const [selectedCategory, setSelectedCategory] = useSafeState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useSafeState("all")
  const [showFilters, setShowFilters] = useSafeState(false)

  const filteredTemplates = advancedTemplates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || template.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleTemplateSelect = useSafeCallback(
    (template: FormTemplate) => {
      onSelectTemplate(template)
    },
    [onSelectTemplate],
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Templates</h2>
          <p className="text-gray-600 mt-1">Professional form templates for every use case</p>
        </div>

        <Button onClick={onCreateFromScratch} variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Create from Scratch
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex items-center gap-1"
                      >
                        {category.icon}
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map((difficulty) => (
                      <Button
                        key={difficulty.id}
                        variant={selectedDifficulty === difficulty.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDifficulty(difficulty.id)}
                      >
                        {difficulty.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden">
                <div className="relative">
                  <img
                    src={template.preview || "/placeholder.svg"}
                    alt={`${template.title} preview`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  <div className="absolute top-3 right-3 flex gap-2">
                    {template.isPremium && (
                      <Badge className="bg-yellow-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        PRO
                      </Badge>
                    )}
                    <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => handleTemplateSelect(template)}>
                        Use Template
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {template.downloads}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {template.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {template.estimatedTime}m
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {template.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <Button
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("all")
              setSelectedDifficulty("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
