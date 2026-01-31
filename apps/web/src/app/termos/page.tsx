import Link from 'next/link'
import { Button } from '@ui/components'
import { Sparkles, ArrowLeft, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Termos de Uso | GoHire Copilot',
  description: 'Termos de Uso do GoHire Copilot - Condições para utilização da plataforma.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-sand">
      {/* Header */}
      <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12 sm:py-16">
        <div className="container-narrow">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-8">
            Termos de Uso
          </h1>
          
          <div className="prose prose-navy max-w-none space-y-8">
            <p className="text-navy/70 text-lg">
              Última atualização: Janeiro de 2026
            </p>

            {/* Important AI Warning */}
            <div className="bg-amber/10 border border-amber/30 rounded-lg p-6 flex gap-4">
              <AlertTriangle className="w-6 h-6 text-amber flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-navy mb-2">Aviso Importante sobre Uso de IA</h3>
                <p className="text-navy/80 text-sm leading-relaxed">
                  O GoHire Copilot utiliza inteligência artificial para gerar insights e recomendações. 
                  Estes conteúdos são <strong>orientativos e não substituem</strong> aconselhamento profissional 
                  de carreira, jurídico ou financeiro. As decisões finais são sempre suas.
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">1. Aceitação dos Termos</h2>
              <p className="text-navy/80 leading-relaxed">
                Ao acessar ou usar o GoHire Copilot (&quot;Serviço&quot;), você concorda em estar vinculado 
                a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, 
                não poderá acessar o Serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">2. Descrição do Serviço</h2>
              <p className="text-navy/80 leading-relaxed mb-4">
                O GoHire Copilot é uma plataforma que oferece:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-navy/80">
                <li>Insights personalizados de carreira gerados por IA</li>
                <li>Acompanhamento de candidaturas a vagas</li>
                <li>Entrevistas simuladas com feedback automático</li>
                <li>Assistente de carreira (Copilot) para dúvidas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">3. Conta de Usuário</h2>
              <p className="text-navy/80 leading-relaxed mb-4">
                Para usar determinadas funcionalidades, você deve criar uma conta. Você é responsável por:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-navy/80">
                <li>Manter a confidencialidade de sua conta</li>
                <li>Todas as atividades realizadas em sua conta</li>
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Notificar imediatamente qualquer uso não autorizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">4. Uso de Inteligência Artificial</h2>
              <p className="text-navy/80 leading-relaxed mb-4">
                Você reconhece e concorda que:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-navy/80">
                <li>Os insights e recomendações são gerados por IA e podem conter imprecisões</li>
                <li>O conteúdo gerado não constitui aconselhamento profissional</li>
                <li>Você é responsável por validar informações antes de tomar decisões</li>
                <li>A IA pode não estar atualizada com as últimas tendências do mercado</li>
                <li>Resultados variam e não garantimos sucesso em processos seletivos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">5. Planos e Pagamentos</h2>
              <p className="text-navy/80 leading-relaxed mb-4">
                O Serviço oferece planos gratuitos e pagos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-navy/80">
                <li><strong>Plano Free:</strong> Acesso limitado a funcionalidades básicas</li>
                <li><strong>Plano Pro:</strong> Acesso ilimitado mediante assinatura mensal</li>
                <li>Pagamentos são processados pelo Stripe de forma segura</li>
                <li>Cancelamentos podem ser feitos a qualquer momento</li>
                <li>Não há reembolso para períodos parciais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">6. Uso Aceitável</h2>
              <p className="text-navy/80 leading-relaxed mb-4">
                Você concorda em NÃO usar o Serviço para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-navy/80">
                <li>Violar leis ou regulamentos aplicáveis</li>
                <li>Transmitir conteúdo ilegal, ofensivo ou prejudicial</li>
                <li>Tentar acessar sistemas ou dados não autorizados</li>
                <li>Interferir no funcionamento do Serviço</li>
                <li>Criar múltiplas contas para burlar limites</li>
                <li>Revender ou redistribuir o Serviço</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">7. Propriedade Intelectual</h2>
              <p className="text-navy/80 leading-relaxed">
                O Serviço e seu conteúdo original são propriedade do GoHire Copilot e estão 
                protegidos por leis de propriedade intelectual. Você mantém a propriedade 
                dos dados que insere na plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">8. Limitação de Responsabilidade</h2>
              <p className="text-navy/80 leading-relaxed mb-4">
                Na extensão máxima permitida por lei:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-navy/80">
                <li>O Serviço é fornecido &quot;como está&quot; sem garantias</li>
                <li>Não garantimos resultados específicos de carreira</li>
                <li>Não somos responsáveis por decisões tomadas com base em nossos insights</li>
                <li>Nossa responsabilidade é limitada ao valor pago pelo Serviço</li>
                <li>Não somos responsáveis por danos indiretos ou consequenciais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">9. Disponibilidade</h2>
              <p className="text-navy/80 leading-relaxed">
                Nos esforçamos para manter o Serviço disponível, mas não garantimos 
                disponibilidade ininterrupta. Podemos modificar, suspender ou descontinuar 
                funcionalidades com aviso prévio razoável.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">10. Rescisão</h2>
              <p className="text-navy/80 leading-relaxed">
                Podemos encerrar ou suspender seu acesso imediatamente, sem aviso prévio, 
                por qualquer violação destes Termos. Você pode encerrar sua conta a qualquer 
                momento através das configurações ou entrando em contato conosco.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">11. Lei Aplicável</h2>
              <p className="text-navy/80 leading-relaxed">
                Estes Termos são regidos pelas leis da República Federativa do Brasil. 
                Qualquer disputa será resolvida nos tribunais da cidade de São Paulo, SP.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">12. Alterações nos Termos</h2>
              <p className="text-navy/80 leading-relaxed">
                Reservamo-nos o direito de modificar estes Termos a qualquer momento. 
                Notificaremos sobre mudanças significativas através do e-mail cadastrado 
                ou por aviso na plataforma. O uso continuado após alterações constitui 
                aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">13. Contato</h2>
              <p className="text-navy/80 leading-relaxed">
                Para dúvidas sobre estes Termos de Uso, entre em contato:
              </p>
              <p className="text-navy/80 leading-relaxed mt-2">
                <strong>E-mail:</strong> suporte@gohire.work
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone/30 py-8">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-navy" />
            </div>
            <span className="text-sm text-navy/70">GoHire Copilot</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-navy/60">
            <Link href="/" className="hover:text-navy transition-colors">
              Início
            </Link>
            <Link href="/privacidade" className="hover:text-navy transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-navy transition-colors">
              Termos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
