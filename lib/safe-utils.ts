"use client"

// Safe object access
export function safeGet<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  try {
    const keys = path.split(".")
    let result = obj

    for (const key of keys) {
      if (result == null || typeof result !== "object") {
        return defaultValue
      }
      result = result[key]
    }

    return result !== undefined ? result : defaultValue
  } catch (error) {
    return defaultValue
  }
}

// Safe array operations
export function safeMap<T, U>(array: T[], mapFn: (item: T, index: number) => U): U[] {
  if (!Array.isArray(array)) return []

  try {
    return array.map(mapFn)
  } catch (error) {
    console.error("Safe map failed:", error)
    return []
  }
}

export function safeFilter<T>(array: T[], filterFn: (item: T, index: number) => boolean): T[] {
  if (!Array.isArray(array)) return []

  try {
    return array.filter(filterFn)
  } catch (error) {
    console.error("Safe filter failed:", error)
    return []
  }
}

// Safe DOM operations
export function safeQuerySelector(selector: string): Element | null {
  try {
    return document.querySelector(selector)
  } catch (error) {
    console.error("Safe querySelector failed:", error)
    return null
  }
}

export function safeAddEventListener(
  element: Element | Window | Document,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions,
) {
  try {
    element.addEventListener(event, handler, options)
    return () => {
      try {
        element.removeEventListener(event, handler, options)
      } catch (error) {
        console.error("Failed to remove event listener:", error)
      }
    }
  } catch (error) {
    console.error("Safe addEventListener failed:", error)
    return () => {} // Return empty cleanup function
  }
}

// Safe async operations
export async function safePromise<T>(promise: Promise<T>, fallback?: T): Promise<T | undefined> {
  try {
    return await promise
  } catch (error) {
    console.error("Safe promise failed:", error)
    return fallback
  }
}

// Safe number operations
export function safeParseInt(value: any, defaultValue = 0): number {
  try {
    const parsed = Number.parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  } catch (error) {
    return defaultValue
  }
}

export function safeParseFloat(value: any, defaultValue = 0): number {
  try {
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  } catch (error) {
    return defaultValue
  }
}

// Safe date operations
export function safeDateParse(dateString: string): Date | null {
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch (error) {
    return null
  }
}

// Safe URL operations
export function safeURL(url: string): URL | null {
  try {
    return new URL(url)
  } catch (error) {
    return null
  }
}
