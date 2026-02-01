import Link from 'next/link'
import { Button } from '@ui/components'
import { Sparkles, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidade | GoHire Copilot',
  description: 'Política de Privacidade do GoHire Copilot - Como coletamos, usamos e protegemos seus dados.',
}

export default function PrivacidadePage() {
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy mb-8">
            Política de Privacidade
          </h1>
          
          <div className="prose prose-navy max-w-none space-y-8">
            <p className="text-navy/70 text-lg">
              Última atualização: Janeiro de 2026
            </p>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">1. Introdução</h2>
              <p className="text-navy/80 leading-relaxed">
                O GoHire Copilot (&quot;nós&quot;, &quot;nosso&quot; ou &quot;Copilot&quot;) está comprometido em proteger sua privacidade. 
                Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações 
                quando você utiliza nossa plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">2. Dados Coletados</h2>
              <p className="text-navy/80 leading-relaxed mb-4">
                Coletamos os seguintes tipos de dados:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-2 text-navy/80">
                <li><strong>Dados de Cadastro:</strong> E-mail fornecido durante a criação da conta.</li>
                <li><strong>Dados de Carreira:</strong> Cargo, área de atuação, senioridade, objetivos profissionais e informações sobre vagas que você acompanha.</li>
                <li><strong>Dados de Uso:</strong> Interações com o Copilot, análises geradas, sessões de entrevista simulada.</li>
                <li><strong>Dados de Pagamento:</strong> Processados diretamente pelo Stripe (não armazenamos dados de cartão).</li>
                <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, páginas visitadas (via cookies analíticos).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">3. Finalidade do Tratamento</h2>
              <p className="text-navy/80 leading-relaxed mb-4">
                Utilizamos seus dados para:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-2 text-navy/80">
                <li>Fornecer análises personalizadas de carreira</li>
                <li>Processar sessões de entrevista simulada</li>
                <li>Permitir o acompanhamento de candidaturas</li>
                <li>Melhorar a qualidade das respostas do Copilot</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar comunicações relacionadas ao serviço</li>
                <li>Analisar uso para melhorias do produto</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">4. Base Legal (LGPD)</h2>
              <p className="text-navy/80 leading-relaxed mb-4">
                O tratamento de seus dados pessoais está fundamentado nas seguintes bases legais:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-2 text-navy/80">
                <li><strong>Execução de Contrato:</strong> Para fornecer os serviços contratados.</li>
                <li><strong>Consentimento:</strong> Para cookies analíticos e de marketing.</li>
                <li><strong>Legítimo Interesse:</strong> Para melhorias do produto e segurança.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">5. Compartilhamento com Terceiros</h2>
              <p className="text-navy/80 leading-relaxed mb-4">
                Seus dados podem ser compartilhados com:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-2 text-navy/80">
                <li><strong>OpenAI:</strong> Para processamento de linguagem natural nas análises e entrevistas (dados anonimizados quando possível).</li>
                <li><strong>Stripe:</strong> Para processamento seguro de pagamentos.</li>
                <li><strong>Supabase:</strong> Para armazenamento seguro de dados.</li>
                <li><strong>PostHog:</strong> Para análise de uso do produto (mediante consentimento).</li>
                <li><strong>Google Analytics:</strong> Para análise de tráfego (mediante consentimento).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">6. Seus Direitos (LGPD)</h2>
              <p className="text-navy/80 leading-relaxed mb-4">
                Como titular dos dados, você tem direito a:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-2 text-navy/80">
                <li>Confirmar a existência de tratamento</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar anonimização, bloqueio ou eliminação</li>
                <li>Solicitar portabilidade dos dados</li>
                <li>Revogar consentimento a qualquer momento</li>
                <li>Solicitar informação sobre compartilhamento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">7. Retenção de Dados</h2>
              <p className="text-navy/80 leading-relaxed">
                Mantemos seus dados pessoais enquanto sua conta estiver ativa ou conforme necessário para 
                fornecer nossos serviços. Você pode solicitar a exclusão de sua conta e dados a qualquer momento 
                através das configurações ou entrando em contato conosco.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">8. Segurança</h2>
              <p className="text-navy/80 leading-relaxed">
                Implementamos medidas técnicas e organizacionais para proteger seus dados, incluindo 
                criptografia em trânsito (HTTPS), controle de acesso baseado em funções (RLS), 
                e auditorias regulares de segurança.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">9. Cookies</h2>
              <p className="text-navy/80 leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento do site e cookies analíticos 
                (PostHog, Google Analytics) apenas com seu consentimento. Você pode gerenciar suas 
                preferências de cookies a qualquer momento através do banner de consentimento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">10. Contato do Encarregado (DPO)</h2>
              <p className="text-navy/80 leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados, entre em contato:
              </p>
              <p className="text-navy/80 leading-relaxed mt-2">
                <strong>E-mail:</strong> privacidade@gohire.work
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">11. Alterações nesta Política</h2>
              <p className="text-navy/80 leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre 
                mudanças significativas através do e-mail cadastrado ou por aviso em destaque na plataforma.
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
