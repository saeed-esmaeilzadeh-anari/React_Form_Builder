"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Wand2, Lightbulb, Zap, Brain } from "lucide-react"

interface AIAssistantProps {
  onGenerateForm: (prompt: string) => Promise<void>
  isGenerating: boolean
}

const quickPrompts = [
  {
    title: "Contact Form",
    description: "Professional contact form with validation",
    prompt: "Create a professional contact form with name, email, phone, company, message fields and proper validation",
    icon: <Lightbulb className="w-4 h-4" />,
  },
  {
    title: "Survey Form",
    description: "Customer satisfaction survey",
    prompt: "Build a customer satisfaction survey with rating scales, multiple choice questions, and feedback sections",
    icon: <Brain className="w-4 h-4" />,
  },
  {
    title: "Registration",
    description: "Event registration form",
    prompt:
      "Design an event registration form with personal details, preferences, dietary requirements, and payment options",
    icon: <Zap className="w-4 h-4" />,
  },
]

export function AIAssistant({ onGenerateForm, isGenerating }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    await onGenerateForm(prompt)
    setPrompt("")
  }

  const handleQuickPrompt = async (quickPrompt: string) => {
    setPrompt(quickPrompt)
    await onGenerateForm(quickPrompt)
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          AI Assistant
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
            BETA
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Describe your form and let AI build it for you</p>

          <AnimatePresence>
            {!isExpanded ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  variant="outline"
                  onClick={() => setIsExpanded(true)}
                  className="w-full text-left justify-start bg-white/50"
                  disabled={isGenerating}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generating..." : "Describe your form..."}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <Textarea
                  placeholder="e.g., Create a job application form with personal details, experience, skills, and file upload for resume..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="bg-white/50 backdrop-blur-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    {isGenerating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                      </motion.div>
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">Quick Start Templates</p>
          <div className="space-y-1">
            {quickPrompts.map((template, index) => (
              <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  onClick={() => handleQuickPrompt(template.prompt)}
                  disabled={isGenerating}
                  className="w-full justify-start text-left h-auto p-2 bg-white/30 hover:bg-white/50"
                >
                  <div className="flex items-start gap-2">
                    <div className="text-purple-500 mt-0.5">{template.icon}</div>
                    <div>
                      <div className="text-xs font-medium">{template.title}</div>
                      <div className="text-xs text-gray-500">{template.description}</div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
