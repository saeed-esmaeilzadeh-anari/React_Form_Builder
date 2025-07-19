import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import { ultimateRuntimeGuard } from "@/lib/runtime-guard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FormCraft Pro - Ultimate Form Builder",
  description: "Professional form builder with zero runtime errors",
    generator: 'v0.dev'
}

// Initialize ultimate protection
if (typeof window !== "undefined") {
  try {
    ultimateRuntimeGuard.initialize()
  } catch (error) {
    console.warn("Runtime guard initialization failed:", error)
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
