/**
 * Simple in-memory rate limiter
 * Para producao com multiplas instancias, usar @upstash/ratelimit ou Redis
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

// Map para armazenar limites por IP/key
const rateLimitMap = new Map<string, RateLimitRecord>()

// Limpar registros antigos periodicamente (a cada 5 minutos)
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupOldRecords() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  
  Array.from(rateLimitMap.entries()).forEach(([key, record]) => {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  })
  lastCleanup = now
}

export interface RateLimitConfig {
  /** Numero maximo de requests permitidos na janela */
  limit: number
  /** Janela de tempo em milissegundos */
  windowMs: number
}

export interface RateLimitResult {
  /** Se o request deve ser permitido */
  success: boolean
  /** Numero de requests restantes */
  remaining: number
  /** Timestamp de quando o limite sera resetado */
  resetTime: number
  /** Numero total de requests permitidos */
  limit: number
}

/**
 * Verifica rate limit para uma key (geralmente IP ou user ID)
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  
  // Cleanup periodico
  cleanupOldRecords()
  
  const record = rateLimitMap.get(key)
  
  // Se nao existe registro ou janela expirou, criar novo
  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitMap.set(key, newRecord)
    
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime: newRecord.resetTime,
      limit: config.limit,
    }
  }
  
  // Se atingiu o limite
  if (record.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
      limit: config.limit,
    }
  }
  
  // Incrementar contador
  record.count++
  
  return {
    success: true,
    remaining: config.limit - record.count,
    resetTime: record.resetTime,
    limit: config.limit,
  }
}

/**
 * Extrair IP do request
 */
export function getClientIP(request: Request): string {
  // Headers comuns de proxy/CDN
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }
  
  // Fallback para requests diretos
  return 'unknown'
}

/**
 * Criar headers de rate limit para response
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())
  return headers
}

/**
 * Middleware helper para rate limiting
 * Retorna Response de erro se limite atingido, ou null se permitido
 */
export function rateLimitMiddleware(
  request: Request,
  config: RateLimitConfig
): { response: Response | null; headers: Headers } {
  const ip = getClientIP(request)
  const result = checkRateLimit(ip, config)
  const headers = createRateLimitHeaders(result)
  
  if (!result.success) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
    headers.set('Retry-After', retryAfter.toString())
    
    return {
      response: new Response(
        JSON.stringify({
          error: 'Muitas requisições. Tente novamente em alguns instantes.',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(headers),
          },
        }
      ),
      headers,
    }
  }
  
  return { response: null, headers }
}

// Configuracoes pre-definidas
export const RATE_LIMITS = {
  /** API de chat - 20 requests por minuto */
  chat: { limit: 20, windowMs: 60 * 1000 },
  /** Validacao de cupom - 10 requests por minuto */
  coupon: { limit: 10, windowMs: 60 * 1000 },
  /** Aplicacao de cupom - 5 requests por minuto (mais restritivo) */
  couponApply: { limit: 5, windowMs: 60 * 1000 },
  /** Stripe checkout - 5 requests por minuto */
  stripe: { limit: 5, windowMs: 60 * 1000 },
} as const
