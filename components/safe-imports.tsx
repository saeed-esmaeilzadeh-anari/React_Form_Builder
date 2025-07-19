"use client"

import type React from "react"
import { Suspense, lazy, type ComponentType } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertTriangle } from "lucide-react"

// Safe dynamic import wrapper
export function safeLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importFn()
    } catch (error) {
      console.error("Dynamic import failed:", error)

      // Return a fallback component
      return {
        default: (() => (
          <Card className="w-full">
            <CardContent className="flex items-center justify-center p-8">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <span>Failed to load component</span>
              </div>
            </CardContent>
          </Card>
        )) as T,
      }
    }
  })
}

// Safe suspense wrapper
export function SafeSuspense({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const defaultFallback = (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </CardContent>
    </Card>
  )

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>
}
