import { ContextBuilder } from './base'
import type { AIMessage } from '../types'

type InterviewContextData = {
  cargo: string
  area?: string
  senioridade?: string
  questionNumber: number
  previousQA?: Array<{ question: string; answer: string }>
}

export class InterviewContextBuilder extends ContextBuilder {
  constructor(data: InterviewContextData) {
    super()
    this.userContext = data
    this.systemPrompt = `Você é um entrevistador experiente conduzindo uma entrevista para a vaga de ${data.cargo}${data.area ? ` na área de ${data.area}` : ''}${data.senioridade ? ` (nível ${data.senioridade})` : ''}.

REGRAS:
1. Faça perguntas relevantes para a vaga e nível
2. Misture perguntas comportamentais e técnicas
3. Seja profissional mas acolhedor
4. Perguntas devem ser claras e diretas
5. Não repita perguntas já feitas
6. Adapte a dificuldade ao nível de senioridade

${data.previousQA?.length ? `PERGUNTAS JÁ FEITAS:\n${data.previousQA.map((qa, i) => `${i + 1}. ${qa.question}`).join('\n')}` : ''}

Faça a pergunta ${data.questionNumber} de 3. Apenas a pergunta, sem introdução.`
  }

  build(_userMessage: string): AIMessage[] {
    return [{ role: 'system', content: this.systemPrompt }]
  }
}

type FeedbackContextData = {
  cargo: string
  area?: string
  qa: Array<{ question: string; answer: string }>
}

export class FeedbackContextBuilder extends ContextBuilder {
  constructor(data: FeedbackContextData) {
    super()
    this.systemPrompt = `Voce e um coach de carreira avaliando as respostas de uma entrevista para ${data.cargo}${data.area ? ` (${data.area})` : ''}.

RESPOSTAS DO CANDIDATO:
${data.qa.map((qa, i) => `
Pergunta ${i + 1}: ${qa.question}
Resposta: ${qa.answer}
`).join('\n')}

AVALIE:
1. De uma nota geral de 0 a 100
2. Para cada resposta, de feedback especifico (pontos fortes e a melhorar)
3. De 3 dicas praticas para melhorar

FORMATO DE RESPOSTA (JSON):
{
  "overall_score": 75,
  "summary": "Resumo geral em 2-3 frases",
  "per_question": [
    {
      "question_number": 1,
      "score": 80,
      "strengths": ["ponto forte 1", "ponto forte 2"],
      "improvements": ["melhoria 1"],
      "tip": "Dica específica"
    }
  ],
  "general_tips": ["dica 1", "dica 2", "dica 3"]
}

Responda APENAS com o JSON, sem texto adicional.`
  }

  build(_userMessage: string): AIMessage[] {
    return [{ role: 'system', content: this.systemPrompt }]
  }
}
