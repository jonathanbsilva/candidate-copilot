import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button, Card, Badge, Progress } from '@ui/components'
import { ArrowLeft, RotateCcw, History, CheckCircle, AlertTriangle, Lightbulb, MessageSquare } from 'lucide-react'
import { getSession, type InterviewFeedback } from '../../actions'
import { CopilotButton } from './copilot-button'

type Props = {
  params: Promise<{ id: string }>
}

function ScoreCircle({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-teal'
    if (s >= 60) return 'text-amber'
    return 'text-red-500'
  }

  const getLabel = (s: number) => {
    if (s >= 80) return 'Excelente!'
    if (s >= 60) return 'Bom'
    return 'Precisa melhorar'
  }

  return (
    <div className="text-center">
      <div className={`text-5xl font-bold ${getColor(score)}`}>
        {score}
        <span className="text-2xl text-navy/40">/100</span>
      </div>
      <p className={`text-sm font-medium ${getColor(score)} mt-1`}>
        {getLabel(score)}
      </p>
    </div>
  )
}

export default async function ResultadoPage({ params }: Props) {
  const { id } = await params
  const session = await getSession(id)

  if (!session) {
    redirect('/dashboard/interview-pro')
  }

  if (session.status !== 'completed') {
    redirect(`/dashboard/interview-pro/sessao/${id}`)
  }

  const feedback = session.feedback as InterviewFeedback | null

  return (
    <div className="container-narrow py-8 sm:py-12">
      <Link href="/dashboard/interview-pro" className="inline-flex items-center text-navy/70 hover:text-navy mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Link>

      {/* Score Card */}
      <Card variant="elevated" className="mb-6 overflow-hidden">
        <div className="bg-navy text-sand p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <Badge className="mb-3 bg-sand/20 text-sand">Resultado</Badge>
              <h1 className="text-2xl font-semibold mb-2">
                Entrevista para {session.cargo}
              </h1>
              <p className="text-sand/70">
                {new Date(session.completed_at!).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            {feedback && <ScoreCircle score={feedback.overall_score} />}
          </div>
        </div>

        {/* Summary */}
        {feedback?.summary && (
          <div className="p-6 border-b border-stone/30">
            <p className="text-navy leading-relaxed">{feedback.summary}</p>
          </div>
        )}

        {/* Progress bar */}
        {feedback && (
          <div className="p-6 border-b border-stone/30 bg-stone/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-navy">Score geral</span>
              <span className="text-sm text-navy/70">{feedback.overall_score}/100</span>
            </div>
            <Progress value={feedback.overall_score} max={100} />
          </div>
        )}
      </Card>

      {/* Per Question Feedback */}
      {feedback?.per_question && feedback.per_question.length > 0 && (
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold text-navy">Avaliacao por pergunta</h2>
          {feedback.per_question.map((pq, index) => {
            const question = session.questions[index]
            const answer = session.answers[index]

            return (
              <Card key={index} className="overflow-hidden">
                <div className="p-4 border-b border-stone/30 bg-stone/5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-navy">Pergunta {pq.question_number}</span>
                    <Badge className={
                      pq.score >= 80 ? 'bg-teal/20 text-teal' :
                      pq.score >= 60 ? 'bg-amber/20 text-amber' :
                      'bg-red-100 text-red-600'
                    }>
                      {pq.score}/100
                    </Badge>
                  </div>
                </div>

                <div className="p-4 border-b border-stone/30">
                  <p className="text-sm text-navy/60 mb-1">Pergunta</p>
                  <p className="text-navy font-medium mb-3">{question}</p>
                  <p className="text-sm text-navy/60 mb-1">Sua resposta</p>
                  <p className="text-navy/80 text-sm">{answer}</p>
                </div>

                <div className="p-4">
                  {pq.strengths && pq.strengths.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-teal flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        Pontos fortes
                      </p>
                      <ul className="space-y-1">
                        {pq.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-navy/70 pl-6">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pq.improvements && pq.improvements.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-amber flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        O que melhorar
                      </p>
                      <ul className="space-y-1">
                        {pq.improvements.map((s, i) => (
                          <li key={i} className="text-sm text-navy/70 pl-6">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pq.tip && (
                    <div className="bg-navy/5 rounded-lg p-3">
                      <p className="text-sm font-medium text-navy flex items-center gap-2 mb-1">
                        <Lightbulb className="w-4 h-4 text-amber" />
                        Dica
                      </p>
                      <p className="text-sm text-navy/70 pl-6">{pq.tip}</p>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* General Tips */}
      {feedback?.general_tips && feedback.general_tips.length > 0 && (
        <Card className="mb-6 border-teal/30">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber" />
              Dicas para melhorar
            </h2>
            <ol className="space-y-3">
              {feedback.general_tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-navy">{tip}</span>
                </li>
              ))}
            </ol>
          </div>
        </Card>
      )}

      {/* Copilot CTA */}
      <Card className="mb-6 p-6 bg-teal/5 border-teal/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-teal" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-navy mb-1">
              Quer explorar mais esse feedback?
            </h3>
            <p className="text-navy/70 text-sm mb-4">
              Converse com o Copilot sobre como melhorar suas respostas e se preparar para proximas entrevistas.
            </p>
            <CopilotButton session={session} />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard/interview-pro/iniciar">
            <Button>
              <RotateCcw className="w-5 h-5 mr-2" />
              Nova entrevista
            </Button>
          </Link>
          <Link href="/dashboard/interview-pro/historico">
            <Button variant="secondary">
              <History className="w-5 h-5 mr-2" />
              Ver historico
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
