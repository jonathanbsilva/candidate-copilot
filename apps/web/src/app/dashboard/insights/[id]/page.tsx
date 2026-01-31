import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, Badge, Button } from '@ui/components'
import { ArrowLeft, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react'
import { ContinueConversationButton } from './continue-button'
import { validateUUID } from '@/lib/schemas/uuid'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function getInsight(id: string) {
  // Validar UUID antes da query
  const uuidValidation = validateUUID(id)
  if (!uuidValidation.success) {
    return null
  }

  const supabase = await createClient()
  
  const { data: insight, error } = await supabase
    .from('insights')
    .select('*')
    .eq('id', uuidValidation.data)
    .single()
  
  if (error || !insight) {
    return null
  }
  
  return insight
}

export default async function InsightDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const insight = await getInsight(id)

  if (!insight) {
    notFound()
  }

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/insights">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Voltar
          </Button>
        </Link>
        <span className="text-sm text-navy/60">
          {formatDate(insight.created_at)}
        </span>
      </div>

      {/* Context Summary */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge>{insight.cargo}</Badge>
        {insight.area && <Badge variant="info">{insight.area}</Badge>}
        {insight.objetivo && <Badge variant="info">{insight.objetivo}</Badge>}
      </div>

      {/* Insight Content */}
      <Card variant="elevated" className="mb-6 overflow-hidden">
        {/* Recommendation Header */}
        <div className="bg-navy text-sand p-6">
          <h1 className="text-xl font-semibold">
            {insight.recommendation}
          </h1>
        </div>

        {/* Why section */}
        {insight.why && insight.why.length > 0 && (
          <div className="p-6 border-b border-stone/30">
            <h3 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
              Por que?
            </h3>
            <ul className="space-y-2">
              {insight.why.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <span className="text-navy">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks */}
        {insight.risks && insight.risks.length > 0 && (
          <div className="p-6 border-b border-stone/30 bg-amber/5">
            <h3 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
              Riscos a considerar
            </h3>
            <ul className="space-y-2">
              {insight.risks.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                  <span className="text-navy">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        {insight.next_steps && insight.next_steps.length > 0 && (
          <div className="p-6">
            <h3 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-3">
              Proximos passos
            </h3>
            <ol className="space-y-3">
              {insight.next_steps.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-navy">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Card>

      {/* CTA: Continuar conversa */}
      <Card className="p-6 text-center bg-teal/5 border-teal/20">
        <MessageSquare className="w-8 h-8 text-teal mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-navy mb-2">
          Quer aprofundar?
        </h2>
        <p className="text-navy/70 mb-4">
          Converse com o Copilot sobre este insight e tire suas duvidas.
        </p>
        <ContinueConversationButton 
          insight={{
            id: insight.id,
            cargo: insight.cargo,
            area: insight.area,
            objetivo: insight.objetivo,
            recommendation: insight.recommendation,
            next_steps: insight.next_steps || [],
          }} 
        />
      </Card>
    </div>
  )
}
