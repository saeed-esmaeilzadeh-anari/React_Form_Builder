"use client"
import type { FormPage } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Check, AlertCircle, Clock, Eye, EyeOff } from "lucide-react"
import { useSafeState, useSafeCallback } from "@/lib/safe-components"

interface StepNavigatorProps {
  pages: FormPage[]
  currentPageIndex: number
  onPageChange: (pageIndex: number) => void
  onSubmit: () => void
  isSubmitting: boolean
  showProgress?: boolean
  showPagePreview?: boolean
  validationErrors?: Record<string, string[]>
  completedPages?: Set<number>
}

export function StepNavigator({
  pages,
  currentPageIndex,
  onPageChange,
  onSubmit,
  isSubmitting,
  showProgress = true,
  showPagePreview = false,
  validationErrors = {},
  completedPages = new Set(),
}: StepNavigatorProps) {
  const [showPreview, setShowPreview] = useSafeState(showPagePreview)
  const [expandedPage, setExpandedPage] = useSafeState<number | null>(null)

  const currentPage = pages[currentPageIndex]
  const isFirstPage = currentPageIndex === 0
  const isLastPage = currentPageIndex === pages.length - 1
  const progressPercentage = ((currentPageIndex + 1) / pages.length) * 100

  const handlePrevious = useSafeCallback(() => {
    if (!isFirstPage) {
      onPageChange(currentPageIndex - 1)
    }
  }, [currentPageIndex, isFirstPage, onPageChange])

  const handleNext = useSafeCallback(() => {
    if (isLastPage) {
      onSubmit()
    } else {
      onPageChange(currentPageIndex + 1)
    }
  }, [currentPageIndex, isLastPage, onPageChange, onSubmit])

  const handlePageClick = useSafeCallback(
    (pageIndex: number) => {
      onPageChange(pageIndex)
    },
    [onPageChange],
  )

  const getPageStatus = (pageIndex: number) => {
    if (completedPages.has(pageIndex)) return "completed"
    if (pageIndex === currentPageIndex) return "current"
    if (pageIndex < currentPageIndex) return "visited"
    return "upcoming"
  }

  const getStatusIcon = (pageIndex: number) => {
    const status = getPageStatus(pageIndex)
    const hasErrors = validationErrors[pages[pageIndex].id]?.length > 0

    if (hasErrors) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }

    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />
      case "current":
        return <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
      case "visited":
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />
      default:
        return <div className="w-4 h-4 bg-gray-200 rounded-full" />
    }
  }

  const getStatusColor = (pageIndex: number) => {
    const status = getPageStatus(pageIndex)
    const hasErrors = validationErrors[pages[pageIndex].id]?.length > 0

    if (hasErrors) return "border-red-500 bg-red-50"

    switch (status) {
      case "completed":
        return "border-green-500 bg-green-50"
      case "current":
        return "border-blue-500 bg-blue-50"
      case "visited":
        return "border-gray-400 bg-gray-50"
      default:
        return "border-gray-200 bg-white"
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Step {currentPageIndex + 1} of {pages.length}
            </span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* Step Overview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Form Progress</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="text-gray-500">
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {pages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${getStatusColor(index)} ${
                  index === currentPageIndex ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => handlePageClick(index)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(index)}
                      <div>
                        <h4 className="font-medium text-gray-900">{page.title}</h4>
                        {page.description && <p className="text-sm text-gray-600 mt-1">{page.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {page.sections.length} sections
                      </Badge>

                      {validationErrors[page.id]?.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {validationErrors[page.id].length} errors
                        </Badge>
                      )}

                      {showPreview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedPage(expandedPage === index ? null : index)
                          }}
                        >
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${expandedPage === index ? "rotate-90" : ""}`}
                          />
                        </Button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {showPreview && expandedPage === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-gray-200"
                      >
                        <div className="space-y-2">
                          {page.sections.map((section) => (
                            <div key={section.id} className="text-sm">
                              <span className="font-medium text-gray-700">{section.title}</span>
                              <span className="text-gray-500 ml-2">({section.fields.length} fields)</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstPage}
          className="flex items-center gap-2 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentPage?.navigation?.previousButtonText || "Previous"}
        </Button>

        <div className="flex items-center gap-2">
          {!isLastPage && (
            <div className="text-sm text-gray-500">
              <Clock className="w-4 h-4 inline mr-1" />
              Estimated time: {pages.slice(currentPageIndex).reduce((acc, page) => acc + page.sections.length * 2, 0)}{" "}
              min
            </div>
          )}
        </div>

        <Button onClick={handleNext} disabled={isSubmitting} className="flex items-center gap-2">
          {isSubmitting ? (
            <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
          ) : isLastPage ? (
            "Submit Form"
          ) : (
            <>
              {currentPage?.navigation?.nextButtonText || "Next"}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
