'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Input, Textarea, RadioGroup } from '@ui/components'
import { createApplication } from '../actions'
import { createApplicationSchema } from '@/lib/schemas/application'
import { track } from '@/lib/analytics/track'
import { statusConfig, type ApplicationStatus } from '@/lib/types/application'

const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
  value,
  label: config.label,
}))

export function FormFlow() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [status, setStatus] = useState<ApplicationStatus>('aplicado')

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
      status,
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
        track('application_created', {
          company: validated.data.company,
          status: validated.data.status || 'aplicado',
          source: 'form_flow',
        })
        router.push('/dashboard/aplicacoes')
      }
    })
  }

  return (
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
          placeholder="Ex: Desenvolvedor Sênior"
          error={errors.title}
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-navy mb-2">Status atual</label>
        <RadioGroup
          name="status"
          options={statusOptions}
          value={status}
          onChange={(value) => setStatus(value as ApplicationStatus)}
          orientation="horizontal"
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
          label="Localização"
          placeholder="Ex: Remoto, São Paulo, etc."
        />
      </div>

      <Input
        name="salary_range"
        label="Faixa salarial"
        placeholder="Ex: R$ 15.000 - R$ 20.000"
      />

      <Textarea
        name="job_description"
        label="Descrição da vaga"
        placeholder="Cole aqui a descrição da vaga para referência futura..."
        className="min-h-[120px]"
      />

      <Textarea
        name="notes"
        label="Notas pessoais"
        placeholder="Adicione suas anotações sobre esta candidatura..."
        className="min-h-[100px]"
      />

      {generalError && (
        <p role="alert" className="text-sm text-red-600">{generalError}</p>
      )}

      <div className="flex gap-3 justify-end pt-4">
        <Link href="/dashboard/aplicacoes">
          <Button type="button" variant="ghost">
            Cancelar
          </Button>
        </Link>
        <Button type="submit" isLoading={isPending}>
          Salvar candidatura
        </Button>
      </div>
    </form>
  )
}
