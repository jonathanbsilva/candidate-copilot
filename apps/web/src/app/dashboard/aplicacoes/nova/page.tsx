'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Input, Textarea } from '@ui/components'
import { Sparkles, LogOut, ArrowLeft } from 'lucide-react'
import { createApplication } from '../actions'
import { createApplicationSchema } from '@/lib/schemas/application'

export default function NovaAplicacaoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setGeneralError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      company: formData.get('company') as string,
      title: formData.get('title') as string,
      url: formData.get('url') as string,
      location: formData.get('location') as string,
      salary_range: formData.get('salary_range') as string,
      job_description: formData.get('job_description') as string,
      notes: formData.get('notes') as string,
    }

    const validated = createApplicationSchema.safeParse(data)
    if (!validated.success) {
      const fieldErrors: Record<string, string> = {}
      validated.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    startTransition(async () => {
      const result = await createApplication(validated.data)
      if (result.error) {
        setGeneralError(result.error)
      } else {
        router.push('/dashboard/aplicacoes')
      }
    })
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
          </Link>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </form>
        </div>
      </header>

      <main className="container-narrow py-8 sm:py-12">
        {/* Back link */}
        <Link 
          href="/dashboard/aplicacoes" 
          className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para lista
        </Link>

        <h1 className="text-2xl sm:text-3xl font-semibold text-navy mb-8">
          Nova Aplicacao
        </h1>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                name="company"
                label="Empresa *"
                placeholder="Ex: Google, Nubank, etc."
                error={errors.company}
              />
              <Input
                name="title"
                label="Cargo *"
                placeholder="Ex: Desenvolvedor Senior"
                error={errors.title}
              />
            </div>

            {/* Optional fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                name="url"
                label="URL da vaga"
                placeholder="https://..."
                error={errors.url}
              />
              <Input
                name="location"
                label="Localizacao"
                placeholder="Ex: Remoto, Sao Paulo, etc."
              />
            </div>

            <Input
              name="salary_range"
              label="Faixa salarial"
              placeholder="Ex: R$ 15.000 - R$ 20.000"
            />

            <Textarea
              name="job_description"
              label="Descricao da vaga"
              placeholder="Cole aqui a descricao da vaga para referencia futura..."
              className="min-h-[120px]"
            />

            <Textarea
              name="notes"
              label="Notas pessoais"
              placeholder="Adicione suas anotacoes sobre esta aplicacao..."
              className="min-h-[100px]"
            />

            {generalError && (
              <p className="text-sm text-red-600">{generalError}</p>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Link href="/dashboard/aplicacoes">
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" isLoading={isPending}>
                Salvar aplicacao
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
