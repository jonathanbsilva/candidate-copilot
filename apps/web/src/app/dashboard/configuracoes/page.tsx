import { Card } from '@ui/components'
import { Settings, Bell, User, Shield } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="container-narrow py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-stone/20 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-navy" />
          </div>
          <h1 className="text-2xl font-semibold text-navy">
            Configurações
          </h1>
        </div>
        <p className="text-navy/70">
          Gerencie suas preferências e configurações da conta.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-6 opacity-60">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-stone/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-navy/60" />
            </div>
            <div>
              <h2 className="font-medium text-navy mb-1">Perfil</h2>
              <p className="text-sm text-navy/60">
                Atualize suas informações pessoais e foto de perfil.
              </p>
              <span className="inline-block mt-2 text-xs text-navy/40 bg-stone/20 px-2 py-1 rounded">
                Em breve
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 opacity-60">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-stone/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-navy/60" />
            </div>
            <div>
              <h2 className="font-medium text-navy mb-1">Notificações</h2>
              <p className="text-sm text-navy/60">
                Configure como e quando você recebe notificações.
              </p>
              <span className="inline-block mt-2 text-xs text-navy/40 bg-stone/20 px-2 py-1 rounded">
                Em breve
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 opacity-60">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-stone/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-navy/60" />
            </div>
            <div>
              <h2 className="font-medium text-navy mb-1">Privacidade</h2>
              <p className="text-sm text-navy/60">
                Gerencie suas configuracoes de privacidade e dados.
              </p>
              <span className="inline-block mt-2 text-xs text-navy/40 bg-stone/20 px-2 py-1 rounded">
                Em breve
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
