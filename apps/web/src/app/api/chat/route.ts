import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai'
import { ChatContextBuilder } from '@/lib/ai/context/chat'
import { validateInput, checkTopic } from '@/lib/ai/security'
import { rateLimitMiddleware, RATE_LIMITS } from '@/lib/rate-limit'

function calculateMetrics(applications: Array<{ status: string; created_at: string }>) {
  const total = applications.length
  const withResponse = applications.filter(a => 
    ['entrevista', 'oferta', 'rejeitado'].includes(a.status)
  ).length
  const responseRate = total > 0 ? Math.round((withResponse / total) * 100) : 0
  
  const avgDays = applications.length > 0
    ? Math.round(
        applications.reduce((sum, app) => {
          const days = Math.floor(
            (Date.now() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24)
          )
          return sum + days
        }, 0) / applications.length
      )
    : 0

  return { total, response_rate: responseRate, avg_days: avgDays }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const { response: rateLimitResponse, headers: rateLimitHeaders } = rateLimitMiddleware(
    request,
    RATE_LIMITS.chat
  )
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 })
    }

    // ========== SECURITY CHECKS ==========
    
    // 1. Validar input (sanitização e detecção de injection)
    const inputValidation = validateInput(message)
    if (!inputValidation.valid) {
      return Response.json(
        { error: inputValidation.reason, blocked: true },
        { status: 400 }
      )
    }

    // 2. Verificar se o tópico é permitido
    const topicCheck = checkTopic(inputValidation.sanitized)
    if (!topicCheck.onTopic) {
      // Retorna resposta amigável para perguntas fora do tópico
      return Response.json(
        { 
          message: topicCheck.suggestedResponse,
          blocked: true,
          reason: 'off_topic'
        },
        { status: 200 } // 200 porque não é erro, apenas fora do escopo
      )
    }

    // Log para monitoramento (em produção, usar serviço de logging)
    if (topicCheck.confidence === 'low') {
      console.log(`[TopicGuard] Ambiguous query: "${message.slice(0, 50)}..."`)
    }

    // ========== END SECURITY CHECKS ==========

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Buscar dados do usuario (sempre filtrado por user_id)
    const [applicationsResult, insightsResult] = await Promise.all([
      supabase.from('applications').select('*').eq('user_id', user.id),
      supabase.from('insights').select('*').eq('user_id', user.id),
    ])

    const applications = applicationsResult.data || []
    const insights = insightsResult.data || []

    // Construir contexto com dados sanitizados
    const contextBuilder = new ChatContextBuilder({
      applications: applications.map(a => ({
        company: a.company,
        status: a.status,
        created_at: a.created_at,
      })),
      insights: insights.map(i => ({
        cargo: i.cargo || '',
        recommendation: i.recommendation || '',
        created_at: i.created_at,
      })),
      metrics: calculateMetrics(applications),
    })

    // Usar mensagem sanitizada
    const messages = contextBuilder.build(inputValidation.sanitized)

    const provider = getAIProvider()

    // Retornar stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of provider.stream(messages)) {
            controller.enqueue(new TextEncoder().encode(chunk.content))
            if (chunk.done) break
          }
        } catch (error) {
          console.error('Stream error:', error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        ...Object.fromEntries(rateLimitHeaders),
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
