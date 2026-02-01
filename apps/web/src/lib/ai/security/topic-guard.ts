/**
 * Topic Guard - Garante que perguntas sejam relevantes ao contexto de carreira
 */

export type TopicCheckResult = {
  onTopic: boolean
  category: 'career' | 'off_topic' | 'ambiguous'
  confidence: 'high' | 'medium' | 'low'
  suggestedResponse?: string
}

// Tópicos permitidos (relacionados a carreira)
const ALLOWED_TOPICS = [
  // Candidaturas e processos seletivos
  /aplica(cao|coes|r|ndo)/i,
  /candidatura/i,
  /processo\s*seletivo/i,
  /vaga/i,
  /entrevista/i,
  /oferta/i,
  /proposta/i,
  /contratacao/i,
  
  // Status e métricas
  /status/i,
  /metrica/i,
  /taxa\s*(de\s*)?(conversao|resposta|sucesso)/i,
  /estatistica/i,
  /resultado/i,
  /progresso/i,
  
  // Empresas e vagas
  /empresa/i,
  /companhia/i,
  /recrutador/i,
  /rh/i,
  /recursos\s*humanos/i,
  
  // Carreira
  /carreira/i,
  /profissional/i,
  /trabalho/i,
  /emprego/i,
  /curriculo/i,
  /cv/i,
  /linkedin/i,
  /portfolio/i,
  
  // Ações específicas do app
  /follow[\s-]?up/i,
  /acompanhamento/i,
  /insight/i,
  /recomendacao/i,
  /dica/i,
  /conselho/i,
  /sugestao/i,
  
  // Salário e benefícios
  /salario/i,
  /remuneracao/i,
  /beneficio/i,
  /pj|clt/i,
  
  // Habilidades e preparação
  /habilidade/i,
  /skill/i,
  /preparar|preparacao/i,
  /estudar/i,
  /melhorar/i,
  
  // Perguntas sobre os próprios dados
  /minha|meu|minhas|meus/i,
  /quantas?/i,
  /quais/i,
  /como\s*(estou|esta|vou)/i,
]

// Tópicos claramente fora do escopo
const BLOCKED_TOPICS = [
  // Conhecimento geral
  /presidente|politica|politico|eleicao/i,
  /capital\s*(de|do|da)/i,
  /historia\s*(de|do|da|mundial)/i,
  /geografia/i,
  
  // Entretenimento
  /filme|serie|novela|musica|jogo|game/i,
  /futebol|esporte|time|campeonato/i,
  /celebridade|famoso|ator|atriz|cantor/i,
  
  // Receitas e culinária
  /receita|cozinhar|ingrediente/i,
  
  // Matemática e cálculos genéricos (não relacionados a métricas)
  /quanto\s*(e|eh|é)\s*\d+\s*[\+\-\*\/x]/i,
  /calcul(e|a)\s*\d+/i,
  
  // Código e programação genérica (não relacionada a carreira)
  /escreva?\s*(um\s*)?(codigo|programa|script|funcao)/i,
  /debug|compile/i,
  
  // Piadas e entretenimento
  /piada|conte\s*(uma|um)\s*(historia|piada)/i,
  /poema|poesia|verso/i,
  
  // Previsões e horóscopo
  /horoscopo|signo|previsao/i,
  
  // Saúde não relacionada a trabalho
  /doenca|remedio|medicamento|sintoma/i,
  
  // Viagens não relacionadas a trabalho
  /viajar|turismo|ferias|passeio/i,
  
  // Relacionamentos pessoais
  /namor|casamento|relacionamento\s*amoroso/i,
  
  // Outros assuntos genéricos
  /quem\s*(e|eh|é|foi|era)\s*(o|a|os|as)/i,
  /o\s*que\s*(e|eh|é)\s*(um|uma|o|a)\s*(?!entrevista|vaga|proposta|oferta|aplicacao)/i,
]

// Respostas padrão para perguntas fora do tópico
const OFF_TOPIC_RESPONSES = [
  'Sou focado em ajudar com sua busca de emprego! Posso responder sobre suas candidaturas, métricas, dicas de entrevista, ou análise do seu progresso. Como posso ajudar com sua carreira?',
  'Essa pergunta está fora do meu escopo. Sou especializado em ajudar você a conseguir seu próximo emprego. Quer saber sobre suas candidaturas ou receber dicas de carreira?',
  'Minha especialidade é carreira e busca de emprego. Posso ajudar com análise das suas candidaturas, preparação para entrevistas, ou estratégias de candidatura. O que você precisa?',
]

/**
 * Verifica se a pergunta é sobre um tópico permitido
 */
export function checkTopic(message: string): TopicCheckResult {
  const normalizedMessage = message.toLowerCase().trim()
  
  // Mensagens muito curtas - deixar passar para o AI decidir
  if (normalizedMessage.length < 10) {
    return {
      onTopic: true,
      category: 'ambiguous',
      confidence: 'low',
    }
  }
  
  // Verificar se é claramente bloqueado
  for (const pattern of BLOCKED_TOPICS) {
    if (pattern.test(message)) {
      return {
        onTopic: false,
        category: 'off_topic',
        confidence: 'high',
        suggestedResponse: OFF_TOPIC_RESPONSES[Math.floor(Math.random() * OFF_TOPIC_RESPONSES.length)],
      }
    }
  }
  
  // Verificar se é claramente permitido
  let allowedMatches = 0
  for (const pattern of ALLOWED_TOPICS) {
    if (pattern.test(message)) {
      allowedMatches++
    }
  }
  
  if (allowedMatches >= 2) {
    return {
      onTopic: true,
      category: 'career',
      confidence: 'high',
    }
  }
  
  if (allowedMatches === 1) {
    return {
      onTopic: true,
      category: 'career',
      confidence: 'medium',
    }
  }
  
  // Ambíguo - deixar o sistema de prompt lidar
  // Mas com confidence baixa para logging
  return {
    onTopic: true,
    category: 'ambiguous',
    confidence: 'low',
  }
}
