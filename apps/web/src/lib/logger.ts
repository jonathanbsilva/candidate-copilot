/**
 * Structured logging utility
 * 
 * Usage:
 * import { logger } from '@/lib/logger'
 * 
 * logger.info('User logged in', { userId: '123', feature: 'auth' })
 * logger.error('Payment failed', { error: err.message, userId: '123' })
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogContext {
  userId?: string
  requestId?: string
  feature?: string
  error?: string
  [key: string]: unknown
}

interface LogEntry extends LogContext {
  timestamp: string
  level: LogLevel
  message: string
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString()
  const logEntry: LogEntry = {
    timestamp,
    level,
    message,
    ...context,
  }

  if (process.env.NODE_ENV === 'production') {
    // Em producao: JSON estruturado para agregadores de logs
    console[level](JSON.stringify(logEntry))
  } else {
    // Em dev: formato legivel no console
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`)
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  debug: (message: string, context?: LogContext) => {
    // Debug so loga em dev
    if (process.env.NODE_ENV !== 'production') {
      log('debug', message, context)
    }
  },
}
