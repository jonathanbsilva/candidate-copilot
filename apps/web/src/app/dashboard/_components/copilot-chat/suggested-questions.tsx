'use client'

import { 
  TrendingUp, Clock, Target, Lightbulb, 
  Sparkles, HelpCircle, AlertTriangle, ListChecks,
  Mic, Users
} from 'lucide-react'
import type { SuggestedQuestion } from '@/lib/copilot/types'
import type { LucideIcon } from 'lucide-react'
import type { InsightContext, HeroContext, InterviewContext, BenchmarkContext } from '@/hooks/use-copilot-drawer'
import { insightSuggestedQuestions, heroSuggestedQuestions, interviewSuggestedQuestions, benchmarkSuggestedQuestions } from './insight-messages'

interface ExtendedQuestion extends SuggestedQuestion {
  icon: LucideIcon
}

const defaultQuestions: ExtendedQuestion[] = [
  // Metricas
  {
    id: 'taxa-conversao',
    label: 'Qual minha taxa de conversão?',
    category: 'metricas',
    icon: TrendingUp,
  },
  {
    id: 'aguardando',
    label: 'Quantas aplicações aguardando resposta?',
    category: 'metricas',
    icon: Clock,
  },
  // Proximos passos
  {
    id: 'follow-up',
    label: 'Quais empresas devo fazer follow-up?',
    category: 'proximos_passos',
    icon: Target,
  },
  {
    id: 'melhorar',
    label: 'O que posso fazer para melhorar?',
    category: 'proximos_passos',
    icon: Lightbulb,
  },
  // Insights
  {
    id: 'ultimo-insight',
    label: 'Me lembre do meu último insight',
    category: 'insights',
    icon: Sparkles,
  },
  {
    id: 'recomendacoes',
    label: 'Quais foram suas recomendações?',
    category: 'insights',
    icon: Lightbulb,
  },
  {
    id: 'riscos',
    label: 'Quais riscos você identificou?',
    category: 'insights',
    icon: AlertTriangle,
  },
  {
    id: 'proximos-passos',
    label: 'Quais próximos passos sugeriu?',
    category: 'insights',
    icon: ListChecks,
  },
  // Analise
  {
    id: 'padroes',
    label: 'Quais padrões você identifica?',
    category: 'analise',
    icon: HelpCircle,
  },
]

// Perguntas de Entrevista IA (aparecem para todos usuarios com historico de entrevista)
const interviewQuestions: ExtendedQuestion[] = [
  {
    id: 'ultima-entrevista',
    label: 'Como foi minha última entrevista simulada?',
    category: 'interview',
    icon: Mic,
  },
  {
    id: 'evolucao-treinos',
    label: 'Qual minha evolução nos treinos?',
    category: 'interview',
    icon: TrendingUp,
  },
  {
    id: 'perguntas-praticar',
    label: 'Que perguntas devo praticar mais?',
    category: 'interview',
    icon: Target,
  },
  {
    id: 'melhorar-entrevista',
    label: 'Me ajuda a melhorar meus pontos fracos',
    category: 'interview',
    icon: Lightbulb,
  },
]

// Perguntas de Benchmark
const benchmarkQuestions: ExtendedQuestion[] = [
  {
    id: 'minha-comparacao',
    label: 'Como me comparo com outros candidatos?',
    category: 'benchmark',
    icon: Users,
  },
  {
    id: 'melhorar-taxa',
    label: 'Como melhorar minha taxa de conversão?',
    category: 'benchmark',
    icon: TrendingUp,
  },
]

const categoryLabels: Record<string, string> = {
  metricas: 'Métricas',
  proximos_passos: 'Próximos Passos',
  insights: 'Seus Insights',
  analise: 'Análise',
  interview: 'Mock Interview',
  benchmark: 'Comparação',
}

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
  compact?: boolean
  categories?: string[]
  insightContext?: InsightContext | null
  heroContext?: HeroContext | null
  interviewContext?: InterviewContext | null
  benchmarkContext?: BenchmarkContext | null
  hasInterviewHistory?: boolean
}

export function SuggestedQuestions({ 
  onSelect, 
  compact = false,
  categories,
  insightContext,
  heroContext,
  interviewContext,
  benchmarkContext,
  hasInterviewHistory = false
}: SuggestedQuestionsProps) {
  // If there's benchmark, interview, insight, or hero context, show context-specific questions
  const contextQuestions = benchmarkContext
    ? benchmarkSuggestedQuestions
    : interviewContext
    ? interviewSuggestedQuestions
    : insightContext 
    ? insightSuggestedQuestions[insightContext.tipo] || insightSuggestedQuestions.default
    : heroContext
    ? heroSuggestedQuestions[heroContext.context] || heroSuggestedQuestions.active_summary
    : null
    
  if (contextQuestions) {
    if (compact) {
      const compactQuestions = contextQuestions.slice(0, 4)
      
      return (
        <div className="flex flex-wrap gap-2">
          {compactQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => onSelect(q)}
              className="
                flex items-center gap-2 px-3 py-1.5 rounded-full
                bg-stone/10 hover:bg-stone/20 transition-colors
                text-xs text-navy/80 hover:text-navy
              "
            >
              <HelpCircle className="w-3 h-3" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      )
    }
    
    return (
      <div className="space-y-1.5">
        {contextQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="
              w-full flex items-center gap-3 p-3 rounded-lg
              bg-stone/5 hover:bg-stone/10 transition-colors text-left
            "
          >
            <HelpCircle className="w-4 h-4 text-teal flex-shrink-0" />
            <span className="text-sm text-navy">{q}</span>
          </button>
        ))}
      </div>
    )
  }
  
  // Incluir perguntas de interview e benchmark para todos usuarios
  const allQuestions = hasInterviewHistory
    ? [...defaultQuestions, ...interviewQuestions, ...benchmarkQuestions]
    : [...defaultQuestions, ...benchmarkQuestions]
  
  // Filtrar por categorias se especificado
  const questions = categories 
    ? allQuestions.filter(q => categories.includes(q.category))
    : allQuestions
  
  if (compact) {
    // Modo compacto: apenas 4 perguntas principais
    const compactQuestions = questions.slice(0, 4)
    
    return (
      <div className="flex flex-wrap gap-2">
        {compactQuestions.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelect(q.label)}
            className="
              flex items-center gap-2 px-3 py-1.5 rounded-full
              bg-stone/10 hover:bg-stone/20 transition-colors
              text-xs text-navy/80 hover:text-navy
            "
          >
            <q.icon className="w-3 h-3" />
            <span>{q.label}</span>
          </button>
        ))}
      </div>
    )
  }
  
  // Agrupar por categoria
  const grouped = questions.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = []
    }
    acc[q.category].push(q)
    return acc
  }, {} as Record<string, ExtendedQuestion[]>)
  
  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, categoryQuestions]) => (
        <div key={category}>
          <p className="text-xs text-navy/50 uppercase tracking-wide mb-2">
            {categoryLabels[category] || category}
          </p>
          <div className="space-y-1.5">
            {categoryQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => onSelect(q.label)}
                className="
                  w-full flex items-center gap-3 p-3 rounded-lg
                  bg-stone/5 hover:bg-stone/10 transition-colors text-left
                "
              >
                <q.icon className="w-4 h-4 text-teal flex-shrink-0" />
                <span className="text-sm text-navy">{q.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
