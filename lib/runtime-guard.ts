"use client"

import { logger } from "@/lib/logger"

// Ultimate runtime protection system
class UltimateRuntimeGuard {
  private static instance: UltimateRuntimeGuard
  private errorCount = 0
  private maxErrors = 50
  private errorCooldown = 1000
  private lastErrorTime = 0
  private criticalMode = false
  private protectedFunctions = new Map()

  static getInstance(): UltimateRuntimeGuard {
    if (!UltimateRuntimeGuard.instance) {
      UltimateRuntimeGuard.instance = new UltimateRuntimeGuard()
    }
    return UltimateRuntimeGuard.instance
  }

  initialize() {
    if (typeof window === "undefined") return

    // Global error protection
    this.setupGlobalErrorHandlers()

    // Patch all dangerous functions
    this.patchAllDangerousFunctions()

    // Setup performance monitoring
    this.setupPerformanceMonitoring()

    // Setup memory leak protection
    this.setupMemoryProtection()

    logger.info("Ultimate Runtime Guard initialized successfully")
  }

  private setupGlobalErrorHandlers() {
    // Catch all JavaScript errors
    window.addEventListener("error", (event) => {
      this.handleError("Global Error", event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
      event.preventDefault()
    })

    // Catch all promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError("Unhandled Promise Rejection", event.reason, {
        promise: event.promise,
      })
      event.preventDefault()
    })

    // Catch React errors (if React DevTools is available)
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const originalOnError = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = (...args) => {
        try {
          return originalOnError?.(...args)
        } catch (error) {
          this.handleError("React DevTools Error", error)
        }
      }
    }
  }

  private patchAllDangerousFunctions() {
    // Patch JSON methods
    this.patchJSON()

    // Patch localStorage/sessionStorage
    this.patchStorage()

    // Patch fetch and XMLHttpRequest
    this.patchNetworking()

    // Patch DOM methods
    this.patchDOM()

    // Patch Array methods
    this.patchArrayMethods()

    // Patch Object methods
    this.patchObjectMethods()

    // Patch Date methods
    this.patchDateMethods()

    // Patch RegExp methods
    this.patchRegExpMethods()
  }

  private patchJSON() {
    const originalParse = JSON.parse
    const originalStringify = JSON.stringify

    JSON.parse = (text: string, reviver?: any) => {
      try {
        return originalParse.call(JSON, text, reviver)
      } catch (error) {
        logger.warn("JSON.parse failed", { text: text?.substring(0, 100), error })
        return null
      }
    }

    JSON.stringify = (value: any, replacer?: any, space?: any) => {
      try {
        return originalStringify.call(JSON, value, replacer, space)
      } catch (error) {
        logger.warn("JSON.stringify failed", { error })
        return "{}"
      }
    }
  }

  private patchStorage() {
    // localStorage
    if (typeof Storage !== "undefined" && window.localStorage) {
      const originalSetItem = localStorage.setItem
      const originalGetItem = localStorage.getItem
      const originalRemoveItem = localStorage.removeItem

      localStorage.setItem = function (key: string, value: string) {
        try {
          return originalSetItem.call(this, key, value)
        } catch (error) {
          logger.warn("localStorage.setItem failed", { key, error })
        }
      }

      localStorage.getItem = function (key: string) {
        try {
          return originalGetItem.call(this, key)
        } catch (error) {
          logger.warn("localStorage.getItem failed", { key, error })
          return null
        }
      }

      localStorage.removeItem = function (key: string) {
        try {
          return originalRemoveItem.call(this, key)
        } catch (error) {
          logger.warn("localStorage.removeItem failed", { key, error })
        }
      }
    }

    // sessionStorage
    if (typeof Storage !== "undefined" && window.sessionStorage) {
      const originalSetItem = sessionStorage.setItem
      const originalGetItem = sessionStorage.getItem

      sessionStorage.setItem = function (key: string, value: string) {
        try {
          return originalSetItem.call(this, key, value)
        } catch (error) {
          logger.warn("sessionStorage.setItem failed", { key, error })
        }
      }

      sessionStorage.getItem = function (key: string) {
        try {
          return originalGetItem.call(this, key)
        } catch (error) {
          logger.warn("sessionStorage.getItem failed", { key, error })
          return null
        }
      }
    }
  }

  private patchNetworking() {
    // Patch fetch
    if (window.fetch) {
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args)
          return response
        } catch (error) {
          logger.error("Fetch failed", { args, error })
          throw error
        }
      }
    }

    // Patch XMLHttpRequest
    if (window.XMLHttpRequest) {
      const OriginalXHR = window.XMLHttpRequest
      window.XMLHttpRequest = (() => {
        const xhr = new OriginalXHR()
        const originalSend = xhr.send

        xhr.send = function (...args) {
          try {
            return originalSend.apply(this, args)
          } catch (error) {
            logger.error("XMLHttpRequest.send failed", { error })
            throw error
          }
        }

        return xhr
      }) as any
    }
  }

  private patchDOM() {
    // Patch querySelector methods
    if (document.querySelector) {
      const originalQuerySelector = document.querySelector
      document.querySelector = function (selector: string) {
        try {
          return originalQuerySelector.call(this, selector)
        } catch (error) {
          logger.warn("querySelector failed", { selector, error })
          return null
        }
      }
    }

    if (document.querySelectorAll) {
      const originalQuerySelectorAll = document.querySelectorAll
      document.querySelectorAll = function (selector: string) {
        try {
          return originalQuerySelectorAll.call(this, selector)
        } catch (error) {
          logger.warn("querySelectorAll failed", { selector, error })
          return document.createDocumentFragment().childNodes as any
        }
      }
    }

    // Patch addEventListener
    if (Element.prototype.addEventListener) {
      const originalAddEventListener = Element.prototype.addEventListener
      Element.prototype.addEventListener = function (type: string, listener: any, options?: any) {
        try {
          const safeListener = (...args: any[]) => {
            try {
              return listener(...args)
            } catch (error) {
              logger.error("Event listener failed", { type, error })
            }
          }
          return originalAddEventListener.call(this, type, safeListener, options)
        } catch (error) {
          logger.warn("addEventListener failed", { type, error })
        }
      }
    }
  }

  private patchArrayMethods() {
    const arrayMethods = ["map", "filter", "reduce", "forEach", "find", "some", "every"]

    arrayMethods.forEach((method) => {
      const original = Array.prototype[method as keyof Array<any>]
      if (typeof original === "function") {
        Array.prototype[method as keyof Array<any>] = function (callback: any, ...args: any[]) {
          try {
            const safeCallback = (...callbackArgs: any[]) => {
              try {
                return callback(...callbackArgs)
              } catch (error) {
                logger.warn(`Array.${method} callback failed`, { error })
                return method === "reduce" ? callbackArgs[0] : undefined
              }
            }
            return (original as any).call(this, safeCallback, ...args)
          } catch (error) {
            logger.warn(`Array.${method} failed`, { error })
            return method === "map" || method === "filter" ? [] : undefined
          }
        } as any
      }
    })
  }

  private patchObjectMethods() {
    // Patch Object.keys, Object.values, etc.
    const objectMethods = ["keys", "values", "entries"]

    objectMethods.forEach((method) => {
      const original = Object[method as keyof ObjectConstructor]
      if (typeof original === "function") {
        Object[method as keyof ObjectConstructor] = ((obj: any) => {
          try {
            return (original as any)(obj)
          } catch (error) {
            logger.warn(`Object.${method} failed`, { error })
            return []
          }
        }) as any
      }
    })
  }

  private patchDateMethods() {
    // Using the native Date constructor is safe enough.
    // Overriding it breaks "new Date()" in some environments (e.g. Next.js server components).
    logger.debug("RuntimeGuard: Native Date left untouched")
  }

  private patchRegExpMethods() {
    const originalRegExpConstructor = RegExp
    window.RegExp = ((pattern: any, flags?: any) => {
      try {
        return new originalRegExpConstructor(pattern, flags)
      } catch (error) {
        logger.warn("RegExp constructor failed", { pattern, flags, error })
        return new originalRegExpConstructor(".*") // Safe fallback
      }
    }) as any

    Object.setPrototypeOf(window.RegExp, originalRegExpConstructor)
    Object.defineProperty(window.RegExp, "prototype", {
      value: originalRegExpConstructor.prototype,
      writable: false,
    })
  }

  private setupPerformanceMonitoring() {
    if (typeof window !== "undefined" && window.performance) {
      // Monitor memory usage
      setInterval(() => {
        if ((performance as any).memory) {
          const memory = (performance as any).memory
          const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize

          if (memoryUsage > 0.9) {
            logger.warn("High memory usage detected", { memoryUsage })
            this.triggerGarbageCollection()
          }
        }
      }, 30000) // Check every 30 seconds
    }
  }

  private setupMemoryProtection() {
    // Prevent memory leaks from intervals and timeouts
    const originalSetInterval = window.setInterval
    const originalSetTimeout = window.setTimeout
    const activeIntervals = new Set()
    const activeTimeouts = new Set()

    window.setInterval = (callback: any, delay: number, ...args: any[]) => {
      const safeCallback = () => {
        try {
          callback(...args)
        } catch (error) {
          logger.error("Interval callback failed", { error })
        }
      }
      const id = originalSetInterval(safeCallback, delay)
      activeIntervals.add(id)
      return id
    }

    window.setTimeout = (callback: any, delay: number, ...args: any[]) => {
      const safeCallback = () => {
        try {
          callback(...args)
          activeTimeouts.delete(id)
        } catch (error) {
          logger.error("Timeout callback failed", { error })
          activeTimeouts.delete(id)
        }
      }
      const id = originalSetTimeout(safeCallback, delay)
      activeTimeouts.add(id)
      return id
    }

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      activeIntervals.forEach((id) => clearInterval(id))
      activeTimeouts.forEach((id) => clearTimeout(id))
    })
  }

  private triggerGarbageCollection() {
    // Force garbage collection if available
    if ((window as any).gc) {
      try {
        ;(window as any).gc()
      } catch (error) {
        logger.warn("Manual garbage collection failed", { error })
      }
    }
  }

  private handleError(type: string, error: any, context?: any) {
    const now = Date.now()

    // Rate limiting
    if (now - this.lastErrorTime < this.errorCooldown) {
      return
    }

    this.errorCount++
    this.lastErrorTime = now

    logger.error(`Runtime Guard: ${type}`, {
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      context,
      errorCount: this.errorCount,
      criticalMode: this.criticalMode,
    })

    // Enter critical mode if too many errors
    if (this.errorCount > this.maxErrors && !this.criticalMode) {
      this.enterCriticalMode()
    }
  }

  private enterCriticalMode() {
    this.criticalMode = true
    logger.error("Entering critical mode - too many errors detected")

    // Disable non-essential features
    this.disableNonEssentialFeatures()

    // Show user notification
    this.showCriticalModeNotification()
  }

  private disableNonEssentialFeatures() {
    // Disable animations
    const style = document.createElement("style")
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `
    document.head.appendChild(style)
  }

  private showCriticalModeNotification() {
    if (typeof window !== "undefined" && document.body) {
      const notification = document.createElement("div")
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fee;
        border: 1px solid #fcc;
        color: #c33;
        padding: 12px;
        border-radius: 4px;
        z-index: 10000;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        max-width: 300px;
      `
      notification.textContent = "Application is running in safe mode due to errors. Some features may be limited."
      document.body.appendChild(notification)

      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 10000)
    }
  }

  // Public methods
  isInCriticalMode(): boolean {
    return this.criticalMode
  }

  getErrorCount(): number {
    return this.errorCount
  }

  resetErrorCount(): void {
    this.errorCount = 0
    this.criticalMode = false
  }
}

export const ultimateRuntimeGuard = UltimateRuntimeGuard.getInstance()
