import { createClient } from '@/lib/supabase/server'
import { Card, Badge, Button } from '@ui/components'
import { Lightbulb, Sparkles, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { objetivoLabels } from '@/lib/insight-engine'
import { CurrentInsightCTAs } from './current-insight-ctas'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function InsightsPage() {
  const supabase = await createClient()
  
  const { data: insights } = await supabase
    .from('insights')
    .select('id, recommendation, diagnosis, type_label, objetivo, cargo, area, next_steps, next_step, created_at')
    .order('created_at', { ascending: false })

  const currentInsight = insights?.[0]
  const previousInsights = insights?.slice(1) || []

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Back link */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber/20 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber" />
          </div>
          <h1 className="text-2xl font-semibold text-navy">
            Suas Análises
          </h1>
        </div>
        <p className="text-navy/70">
          Acompanhe sua jornada de carreira.
        </p>
      </div>

      {currentInsight ? (
        <>
          {/* Análise Atual - Destaque */}
          <Card variant="elevated" className="mb-8 overflow-hidden">
            <div className="bg-navy text-sand p-4 sm:p-6">
              {currentInsight.type_label && (
                <Badge variant="warning" className="mb-3">
                  {currentInsight.type_label}
                </Badge>
              )}
              <h2 className="text-xl font-semibold mb-2">
                Sua análise de carreira
              </h2>
              <p className="text-sand/80 text-sm">
                {formatDate(currentInsight.created_at)}
              </p>
            </div>
            
            {/* Situação atual */}
            <div className="p-4 sm:p-6 border-b border-stone/20">
              <h3 className="text-sm font-semibold text-navy/70 uppercase tracking-wide mb-2">
                Situação atual
              </h3>
              <p className="text-navy">
                {currentInsight.diagnosis || currentInsight.recommendation}
              </p>
            </div>
            
            <div className="p-4 sm:p-6">
              {currentInsight.objetivo && (
                <p className="text-sm text-navy/70 mb-4">
                  <span className="font-medium">Objetivo:</span> {objetivoLabels[currentInsight.objetivo] || currentInsight.objetivo}
                </p>
              )}
              
              {/* CTAs Contextuais */}
              <CurrentInsightCTAs objetivo={currentInsight.objetivo} />
              
              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-stone/20">
                <Link href={`/dashboard/insights/${currentInsight.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Ver detalhes
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/comecar" className="w-full sm:w-auto">
                  <Button variant="ghost" className="w-full sm:w-auto">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refazer análise
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Análises Anteriores - Compacto */}
          {previousInsights.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-navy/60 uppercase tracking-wide mb-3">
                Análises Anteriores
              </h3>
              <div className="space-y-2">
                {previousInsights.map((insight) => (
                  <Link key={insight.id} href={`/dashboard/insights/${insight.id}`}>
                    <Card className="p-3 sm:p-4 hover:bg-stone/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-amber/60 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-navy truncate">
                            {insight.objetivo ? objetivoLabels[insight.objetivo] || insight.objetivo : (insight.diagnosis || insight.recommendation)}
                          </p>
                        </div>
                        <span className="text-xs text-navy/40 flex-shrink-0">
                          {formatDate(insight.created_at)}
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <Card className="p-6 sm:p-8 text-center">
          <div className="w-12 h-12 bg-stone/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-6 h-6 text-navy/40" />
          </div>
          <h2 className="text-lg font-medium text-navy mb-2">
            Nenhuma análise salva ainda
          </h2>
          <p className="text-navy/60 mb-4 max-w-md mx-auto">
            Comece respondendo algumas perguntas para receber análises personalizadas sobre sua carreira.
          </p>
          <Link 
            href="/comecar"
            className="inline-flex items-center justify-center px-4 py-2 bg-amber text-navy font-medium rounded-lg hover:bg-amber/90 transition-colors"
          >
            Gerar primeira análise
          </Link>
        </Card>
      )}
    </div>
  )
}
