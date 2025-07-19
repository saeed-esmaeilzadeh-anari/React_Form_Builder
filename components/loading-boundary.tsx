"use client"

import { Suspense, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface LoadingBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

function DefaultLoadingFallback() {
  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">در حال بارگذاری...</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoadingBoundary({ children, fallback, className }: LoadingBoundaryProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback || <DefaultLoadingFallback />}>{children}</Suspense>
    </div>
  )
}
