"use client"

import type React from "react"
import { useDraggable } from "@dnd-kit/core"
import type { FormFieldType } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
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
  Star,
  MapPin,
  Clock,
  CreditCard,
  ImageIcon,
  SlidersHorizontal,
  Search,
  Grid3X3,
} from "lucide-react"
import { useSafeState, useSafeCallback } from "@/lib/safe-components"
import { safeMap, safeFilter } from "@/lib/safe-utils"

const fieldCategories = {
  basic: {
    label: "Basic Fields",
    color: "blue",
    fields: [
      {
        type: "text" as FormFieldType,
        label: "Text Input",
        icon: <Type className="w-4 h-4" />,
        description: "Single line text",
        premium: false,
      },
      {
        type: "textarea" as FormFieldType,
        label: "Text Area",
        icon: <FileText className="w-4 h-4" />,
        description: "Multi-line text",
        premium: false,
      },
      {
        type: "email" as FormFieldType,
        label: "Email",
        icon: <Mail className="w-4 h-4" />,
        description: "Email address",
        premium: false,
      },
      {
        type: "phone" as FormFieldType,
        label: "Phone",
        icon: <Phone className="w-4 h-4" />,
        description: "Phone number",
        premium: false,
      },
      {
        type: "number" as FormFieldType,
        label: "Number",
        icon: <Hash className="w-4 h-4" />,
        description: "Numeric input",
        premium: false,
      },
    ],
  },
  advanced: {
    label: "Advanced Fields",
    color: "purple",
    fields: [
      {
        type: "date" as FormFieldType,
        label: "Date Picker",
        icon: <Calendar className="w-4 h-4" />,
        description: "Date selection",
        premium: false,
      },
      {
        type: "select" as FormFieldType,
        label: "Dropdown",
        icon: <ChevronDown className="w-4 h-4" />,
        description: "Select options",
        premium: false,
      },
      {
        type: "radio" as FormFieldType,
        label: "Radio Group",
        icon: <Circle className="w-4 h-4" />,
        description: "Single choice",
        premium: false,
      },
      {
        type: "checkbox" as FormFieldType,
        label: "Checkboxes",
        icon: <CheckSquare className="w-4 h-4" />,
        description: "Multiple choice",
        premium: false,
      },
      {
        type: "file" as FormFieldType,
        label: "File Upload",
        icon: <Upload className="w-4 h-4" />,
        description: "File attachment",
        premium: false,
      },
    ],
  },
  premium: {
    label: "Premium Fields",
    color: "gold",
    fields: [
      {
        type: "rating" as FormFieldType,
        label: "Star Rating",
        icon: <Star className="w-4 h-4" />,
        description: "5-star rating",
        premium: true,
      },
      {
        type: "location" as FormFieldType,
        label: "Location",
        icon: <MapPin className="w-4 h-4" />,
        description: "Address picker",
        premium: true,
      },
      {
        type: "time" as FormFieldType,
        label: "Time Picker",
        icon: <Clock className="w-4 h-4" />,
        description: "Time selection",
        premium: true,
      },
      {
        type: "payment" as FormFieldType,
        label: "Payment",
        icon: <CreditCard className="w-4 h-4" />,
        description: "Payment integration",
        premium: true,
      },
      {
        type: "image" as FormFieldType,
        label: "Image Upload",
        icon: <ImageIcon className="w-4 h-4" />,
        description: "Image with preview",
        premium: true,
      },
      {
        type: "range" as FormFieldType,
        label: "Range Slider",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        description: "Numeric range",
        premium: true,
      },
      {
        type: "matrix" as FormFieldType,
        label: "Matrix Grid",
        icon: <Grid3X3 className="w-4 h-4" />,
        description: "Grid questions",
        premium: true,
      },
    ],
  },
}

function DraggableFieldType({
  type,
  label,
  icon,
  description,
  premium,
  category,
}: {
  type: FormFieldType
  label: string
  icon: React.ReactNode
  description: string
  premium: boolean
  category: string
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
    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} layout>
      <Card
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`p-3 cursor-grab hover:shadow-lg transition-all duration-200 border-l-4 ${
          category === "basic"
            ? "border-l-blue-500 hover:border-l-blue-600"
            : category === "advanced"
              ? "border-l-purple-500 hover:border-l-purple-600"
              : "border-l-yellow-500 hover:border-l-yellow-600"
        } ${isDragging ? "opacity-50 shadow-2xl" : ""} ${premium ? "bg-gradient-to-r from-yellow-50 to-orange-50" : "bg-white"}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 ${
              category === "basic" ? "text-blue-600" : category === "advanced" ? "text-purple-600" : "text-yellow-600"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">{label}</h4>
              {premium && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  PRO
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function FieldPalette() {
  const [searchTerm, setSearchTerm] = useSafeState("")
  const [activeCategory, setActiveCategory] = useSafeState<string | null>(null)

  const handleSearchChange = useSafeCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleCategoryToggle = useSafeCallback(
    (categoryKey: string) => {
      setActiveCategory(activeCategory === categoryKey ? null : categoryKey)
    },
    [activeCategory],
  )

  const filteredCategories = Object.entries(fieldCategories)
    .map(([key, category]) => ({
      key,
      ...category,
      fields: safeFilter(
        category.fields,
        (field) =>
          field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.fields.length > 0)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Form Fields
        </h3>
        <p className="text-sm text-gray-600 mb-4">Drag fields to build your form</p>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-white/50 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        {safeMap(filteredCategories, (category) => (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Button
              variant="ghost"
              onClick={() => handleCategoryToggle(category.key)}
              className="w-full justify-between p-2 h-auto"
            >
              <span className="text-sm font-medium text-gray-700">{category.label}</span>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  category.color === "blue"
                    ? "bg-blue-100 text-blue-700"
                    : category.color === "purple"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {category.fields.length}
              </Badge>
            </Button>

            <AnimatePresence>
              {(activeCategory === category.key || activeCategory === null) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {safeMap(category.fields, (fieldType) => (
                    <DraggableFieldType key={fieldType.type} {...fieldType} category={category.key} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
