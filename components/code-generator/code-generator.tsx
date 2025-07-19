"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Copy, Download, Code, FileCode, Globe } from "lucide-react"
import { generateReactCode, generateVueCode } from "@/lib/form-utils"
import type { FormProject, FormField } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface CodeGeneratorProps {
  project: FormProject
  fields: FormField[]
}

export function CodeGenerator({ project, fields }: CodeGeneratorProps) {
  const [activeFramework, setActiveFramework] = useState("react")

  const frameworks = [
    { id: "react", name: "React", icon: <Code className="w-4 h-4" />, color: "blue" },
    { id: "vue", name: "Vue.js", icon: <FileCode className="w-4 h-4" />, color: "green" },
    { id: "html", name: "HTML", icon: <Globe className="w-4 h-4" />, color: "orange" },
  ]

  const getGeneratedCode = () => {
    switch (activeFramework) {
      case "react":
        return generateReactCode(project)
      case "vue":
        return generateVueCode(project)
      case "html":
        return generateHTMLCode(project)
      default:
        return ""
    }
  }

  const copyToClipboard = async () => {
    const code = getGeneratedCode()
    await navigator.clipboard.writeText(code)
    toast({
      title: "Code Copied! 📋",
      description: "The generated code has been copied to your clipboard.",
    })
  }

  const downloadCode = () => {
    const code = getGeneratedCode()
    const extension = activeFramework === "react" ? "jsx" : activeFramework === "vue" ? "vue" : "html"
    const filename = `${project.title.toLowerCase().replace(/\s+/g, "-")}-form.${extension}`

    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Code</h2>
        <p className="text-gray-600">Generate production-ready code for your form</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {frameworks.map((framework) => (
            <Button
              key={framework.id}
              variant={activeFramework === framework.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFramework(framework.id)}
              className={`${
                activeFramework === framework.id
                  ? framework.color === "blue"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : framework.color === "green"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  : ""
              }`}
            >
              {framework.icon}
              <span className="ml-2">{framework.name}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCode}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Generated {frameworks.find((f) => f.id === activeFramework)?.name} Code</span>
            <Badge variant="secondary">
              {fields.length} field{fields.length !== 1 ? "s" : ""}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            key={activeFramework}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{getGeneratedCode()}</code>
            </pre>
          </motion.div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">React Features</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• TypeScript support</li>
              <li>• Form validation</li>
              <li>• State management</li>
              <li>• Component composition</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-900 mb-2">Vue.js Features</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Composition API</li>
              <li>• Reactive forms</li>
              <li>• Template syntax</li>
              <li>• Built-in validation</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-orange-900 mb-2">HTML Features</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Pure HTML5</li>
              <li>• CSS styling</li>
              <li>• Vanilla JavaScript</li>
              <li>• No dependencies</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function generateHTMLCode(project: FormProject): string {
  const fieldHTML = project.fields
    .map((field) => {
      switch (field.type) {
        case "text":
        case "email":
        case "phone":
        case "number":
          return `    <div class="form-group">
      <label for="${field.id}">${field.label}${field.required ? " *" : ""}</label>
      <input 
        type="${field.type}" 
        id="${field.id}" 
        name="${field.id}"
        placeholder="${field.placeholder || ""}"
        ${field.required ? "required" : ""}
        class="form-control"
      />
    </div>`

        case "textarea":
          return `    <div class="form-group">
      <label for="${field.id}">${field.label}${field.required ? " *" : ""}</label>
      <textarea 
        id="${field.id}" 
        name="${field.id}"
        placeholder="${field.placeholder || ""}"
        rows="${field.rows || 3}"
        ${field.required ? "required" : ""}
        class="form-control"
      ></textarea>
    </div>`

        default:
          return `    <!-- ${field.type} field -->`
      }
    })
    .join("\n\n")

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title}</title>
    <style>
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-control { 
            width: 100%; 
            padding: 10px; 
            border: 1px solid #ddd; 
            border-radius: 4px; 
            font-size: 16px;
        }
        .btn { 
            background: #007bff; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 16px;
        }
        .btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${project.title}</h1>
        ${project.description ? `<p>${project.description}</p>` : ""}
        
        <form id="generatedForm">
${fieldHTML}
            
            <button type="submit" class="btn">Submit Form</button>
        </form>
    </div>

    <script>
        document.getElementById('generatedForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            console.log('Form submitted:', data);
            alert('Form submitted successfully!');
        });
    </script>
</body>
</html>`
}
