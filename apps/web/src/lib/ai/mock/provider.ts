import type { AIMessage, AIResponse, AIStreamChunk, AIConfig } from '../types'
import type { AIProvider } from '../provider'

const DEFAULT_CONFIG: AIConfig = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  max_tokens: 1000,
}

/**
 * Mock Provider para desenvolvimento
 * Simula respostas da AI sem gastar tokens
 */
export class MockProvider implements AIProvider {
  async complete(messages: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config }
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() ?? ''

    // Simular delay de resposta
    await new Promise(resolve => setTimeout(resolve, 300))

    const content = this.generateResponse(lastMessage)
    
    return {
      content,
      model: finalConfig.model,
      usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
    }
  }

  async *stream(messages: AIMessage[]): AsyncIterable<AIStreamChunk> {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() ?? ''
    const response = this.generateResponse(lastMessage)
    
    // Simular streaming palavra por palavra
    const words = response.split(' ')
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 30))
      yield { content: word + ' ', done: false }
    }
    yield { content: '', done: true }
  }

  private generateResponse(message: string): string {
    // Taxa de conversão
    if (message.includes('taxa') && (message.includes('conversao') || message.includes('conversão'))) {
      return `Sua taxa de conversão está em **28%**, o que significa que aproximadamente 1 em cada 4 aplicações resulta em entrevista.

Isso está dentro da média do mercado (25-30%). Continue focando em qualidade nas aplicações!

**Próximos passos:**
1. Mantenha a estratégia atual de aplicações direcionadas
2. Prepare-se bem para as entrevistas que estão chegando`
    }

    // Follow-up
    if (message.includes('follow-up') || message.includes('follow up') || message.includes('followup')) {
      return `Identifiquei **2 empresas** que ainda não responderam há mais de 7 dias:

1. **TechCorp** - 12 dias sem resposta (vaga de Dev Senior)
2. **StartupXYZ** - 8 dias sem resposta (vaga de Tech Lead)

**Recomendação:** Envie um follow-up educado para TechCorp primeiro, pois é a mais antiga. Um email simples perguntando sobre o status do processo costuma funcionar bem.`
    }

    // Proposta/Oferta
    if (message.includes('proposta') || message.includes('oferta')) {
      return `Analisando seu pipeline, você tem **1 processo em fase avançada**:

**PromptTech** - Entrevista final realizada há 5 dias

Com base no histórico, empresas desse porte costumam responder em 5-7 dias úteis. Você está no caminho certo!

Se não receber resposta até sexta-feira, considere um follow-up gentil.`
    }

    // Melhorar/Dicas
    if (message.includes('melhorar') || message.includes('dica') || message.includes('sugest')) {
      return `Baseado na análise dos seus dados, aqui estão algumas sugestões:

**Pontos fortes:**
- Sua taxa de conversão está na média
- Você está aplicando consistentemente

**Oportunidades de melhoria:**
1. Diversifique os tipos de empresa (você está focado apenas em startups)
2. Adicione mais detalhes às notas de cada aplicação
3. Faça follow-up mais cedo (antes de 7 dias)

Quer que eu detalhe algum desses pontos?`
    }

    // Insight/Recomendação
    if (message.includes('insight') || message.includes('recomendação') || message.includes('recomendacao')) {
      return `Seu último insight foi gerado recentemente:

**Recomendação principal:** Foque em vagas de Senior/Tech Lead

**Por quê:**
- Sua experiência combina bem com esse nível
- O mercado está aquecido para essas posições
- Você teve mais sucesso com esse perfil de vaga

**Riscos identificados:**
- Concorrência maior para vagas senior
- Processo mais longo de entrevistas`
    }

    // Entrevista
    if (message.includes('entrevista') || message.includes('preparar') || message.includes('preparação')) {
      return `Para se preparar para entrevistas, recomendo:

**Antes da entrevista:**
1. Pesquise a empresa e seus produtos
2. Revise seu currículo e projetos relevantes
3. Prepare exemplos usando o método STAR

**Durante a entrevista:**
- Seja específico com exemplos
- Faça perguntas sobre a equipe e cultura
- Demonstre interesse genuíno

Quer dicas específicas para alguma empresa?`
    }

    // Quantas aplicações
    if (message.includes('quantas') && message.includes('aplica')) {
      return `Você tem um total de **8 aplicações** registradas:

- **3** aguardando resposta
- **2** em processo de entrevista
- **2** rejeitadas
- **1** oferta recebida

Seu ritmo de aplicações está bom! Continue assim.`
    }

    // Status geral
    if (message.includes('status') || message.includes('como estou') || message.includes('como está')) {
      return `Aqui está um resumo do seu status atual:

📊 **Métricas:**
- Total de aplicações: 8
- Taxa de conversão: 28%
- Tempo médio de resposta: 6 dias

🎯 **Processos ativos:**
- 2 entrevistas agendadas
- 1 aguardando feedback

💡 **Ação recomendada:**
Faça follow-up com TechCorp (12 dias sem resposta)`
    }

    // Resposta genérica para perguntas de carreira
    return `Entendi sua pergunta sobre sua busca de emprego.

Baseado nos seus dados atuais:
- Você tem **8 aplicações** no total
- **3** estão aguardando resposta
- **2** processos ativos

Posso te ajudar com:
- Análise da taxa de conversão
- Quais empresas fazer follow-up
- Dicas de preparação para entrevistas
- Seus insights anteriores

O que você gostaria de saber?`
  }
}
