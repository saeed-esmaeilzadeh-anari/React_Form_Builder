"use client"

// Browser-safe logger that works everywhere
class BrowserLogger {
  private isDev = process.env.NODE_ENV === "development"
  private logs: Array<{ level: string; message: string; data?: any; timestamp: string }> = []
  private maxLogs = 1000

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`
    }
    return `${prefix} ${message}`
  }

  private addLog(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    this.logs.push({ level, message, data, timestamp })

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }

  info(message: string, data?: any) {
    this.addLog("info", message, data)
    if (this.isDev) {
      console.log(this.formatMessage("info", message, data))
    }
  }

  warn(message: string, data?: any) {
    this.addLog("warn", message, data)
    console.warn(this.formatMessage("warn", message, data))
  }

  error(message: string, data?: any) {
    this.addLog("error", message, data)
    console.error(this.formatMessage("error", message, data))

    // Send to monitoring service in production
    if (!this.isDev && typeof window !== "undefined") {
      this.sendToMonitoring("error", message, data)
    }
  }

  debug(message: string, data?: any) {
    this.addLog("debug", message, data)
    if (this.isDev) {
      console.debug(this.formatMessage("debug", message, data))
    }
  }

  private async sendToMonitoring(level: string, message: string, data?: any) {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          message,
          data,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      })
    } catch (error) {
      // Fail silently - don't break the app for logging
    }
  }

  getLogs() {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = new BrowserLogger()
