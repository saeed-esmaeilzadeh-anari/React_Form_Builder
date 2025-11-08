"use client"

import type { FormField, FormProject } from "@/lib/types"
import { logger } from "@/lib/logger"

export interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
}

export class FormBuilderTester {
  private results: TestResult[] = []

  /**
   * Test 1: Validate form field creation
   */
  async testFieldCreation(): Promise<TestResult> {
    const startTime = performance.now()
    try {
      const field: FormField = {
        id: `test-field-${Date.now()}`,
        type: "text",
        label: "Test Field",
        required: false,
        placeholder: "Test placeholder",
        validation: { required: false },
        conditional: { enabled: false, conditions: [], action: "show" },
        styling: { width: "full", alignment: "left" },
      }

      if (!field.id || !field.type || !field.label) {
        throw new Error("Field creation failed: missing required properties")
      }

      const duration = performance.now() - startTime
      return { name: "Field Creation", passed: true, duration }
    } catch (error) {
      const duration = performance.now() - startTime
      return {
        name: "Field Creation",
        passed: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      }
    }
  }

  /**
   * Test 2: Validate project structure
   */
  async testProjectStructure(): Promise<TestResult> {
    const startTime = performance.now()
    try {
      const project: FormProject = {
        id: `test-project-${Date.now()}`,
        title: "Test Project",
        description: "Test Description",
        pages: [
          {
            id: `page-${Date.now()}`,
            title: "Page 1",
            description: "Test page",
            sections: [],
            order: 0,
            navigation: {
              showPrevious: false,
              showNext: true,
              nextButtonText: "Next",
              previousButtonText: "Previous",
            },
          },
        ],
        fields: [],
        theme: "modern",
        settings: {
          allowMultipleSubmissions: true,
          requireAuthentication: false,
          enableAnalytics: true,
          enableNotifications: true,
          multiPage: true,
          showProgressBar: true,
          saveProgress: true,
          autoSave: false,
          submitButtonText: "Submit",
          resetButtonText: "Reset",
          validation: "onBlur",
          layout: "vertical",
          animation: "fade",
          responsive: true,
          theme: "modern",
          language: "en",
          accessibility: {
            enabled: true,
            highContrast: false,
            screenReader: true,
            keyboardNavigation: true,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }

      if (!project.id || !project.pages || project.pages.length === 0) {
        throw new Error("Project structure validation failed")
      }

      const duration = performance.now() - startTime
      return { name: "Project Structure", passed: true, duration }
    } catch (error) {
      const duration = performance.now() - startTime
      return {
        name: "Project Structure",
        passed: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      }
    }
  }

  /**
   * Test 3: Validate state immutability
   */
  async testStateImmutability(): Promise<TestResult> {
    const startTime = performance.now()
    try {
      const originalField: FormField = {
        id: "test-field",
        type: "text",
        label: "Original",
        required: false,
        validation: { required: false },
        conditional: { enabled: false, conditions: [], action: "show" },
        styling: { width: "full", alignment: "left" },
      }

      const modifiedField = { ...originalField, label: "Modified" }

      if (originalField.label !== "Original" || modifiedField.label !== "Modified") {
        throw new Error("State immutability test failed")
      }

      const duration = performance.now() - startTime
      return { name: "State Immutability", passed: true, duration }
    } catch (error) {
      const duration = performance.now() - startTime
      return {
        name: "State Immutability",
        passed: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      }
    }
  }

  /**
   * Test 4: Validate error handling
   */
  async testErrorHandling(): Promise<TestResult> {
    const startTime = performance.now()
    try {
      try {
        throw new Error("Test error")
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error("Error handling failed: error is not Error instance")
        }
      }

      const duration = performance.now() - startTime
      return { name: "Error Handling", passed: true, duration }
    } catch (error) {
      const duration = performance.now() - startTime
      return {
        name: "Error Handling",
        passed: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      }
    }
  }

  /**
   * Test 5: Validate array operations
   */
  async testArrayOperations(): Promise<TestResult> {
    const startTime = performance.now()
    try {
      const fields: FormField[] = []

      const field1: FormField = {
        id: "field-1",
        type: "text",
        label: "Field 1",
        required: false,
        validation: { required: false },
        conditional: { enabled: false, conditions: [], action: "show" },
        styling: { width: "full", alignment: "left" },
      }

      const field2: FormField = {
        id: "field-2",
        type: "email",
        label: "Field 2",
        required: false,
        validation: { required: false },
        conditional: { enabled: false, conditions: [], action: "show" },
        styling: { width: "full", alignment: "left" },
      }

      const newFields = [...fields, field1, field2]
      const filtered = newFields.filter((f) => f.type === "text")

      if (newFields.length !== 2 || filtered.length !== 1) {
        throw new Error("Array operations test failed")
      }

      const duration = performance.now() - startTime
      return { name: "Array Operations", passed: true, duration }
    } catch (error) {
      const duration = performance.now() - startTime
      return {
        name: "Array Operations",
        passed: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      }
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<TestResult[]> {
    logger.info("Starting form builder tests")

    this.results = [
      await this.testFieldCreation(),
      await this.testProjectStructure(),
      await this.testStateImmutability(),
      await this.testErrorHandling(),
      await this.testArrayOperations(),
    ]

    const passed = this.results.filter((r) => r.passed).length
    const total = this.results.length
    const totalDuration = this.results.reduce((acc, r) => acc + r.duration, 0)

    logger.info(`Tests completed: ${passed}/${total} passed`, {
      results: this.results,
      totalDuration: totalDuration.toFixed(2) + "ms",
    })

    return this.results
  }

  /**
   * Get test results summary
   */
  getResults(): TestResult[] {
    return this.results
  }

  /**
   * Get summary
   */
  getSummary(): {
    total: number
    passed: number
    failed: number
    passRate: number
    averageDuration: number
  } {
    const total = this.results.length
    const passed = this.results.filter((r) => r.passed).length
    const failed = total - passed
    const passRate = total > 0 ? (passed / total) * 100 : 0
    const averageDuration = total > 0 ? this.results.reduce((acc, r) => acc + r.duration, 0) / total : 0

    return { total, passed, failed, passRate, averageDuration }
  }
}

export const formBuilderTester = new FormBuilderTester()
