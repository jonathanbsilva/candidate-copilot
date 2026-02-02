'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button, Card, StepProgress, Input, Select, RadioGroup, Textarea } from '@ui/components'
import { ArrowLeft, ArrowRight, Sparkles, Target } from 'lucide-react'
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  senioridadeOptions,
  areaOptions,
  statusOptions,
  tempoSituacaoOptions,
  objetivoOptions,
  followUpLabels,
  bloqueioDecisaoOptions,
  gargaloEntrevistasOptions,
  faseMaximaOptions,
  sinaisAlavancaOptions,
  tipoPivotOptions,
  type EntryFlowData,
  type Step1Data,
  type Step2Data,
  type Step3Data,
  type Step4Data,
} from '@/lib/schemas/entry-flow'

const TOTAL_STEPS = 4
const stepLabels = ['Contexto', 'Situação', 'Objetivo', 'Detalhes']

export default function ComecarPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<EntryFlowData>>({
    urgencia: 3,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = (stepData: Step1Data | Step2Data | Step3Data | Step4Data) => {
    const newFormData = { ...formData, ...stepData }
    setFormData(newFormData)

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit and redirect to insight page
      setIsSubmitting(true)
      // Store data in sessionStorage for the insight page
      sessionStorage.setItem('entryFlowData', JSON.stringify(newFormData))
      router.push('/insight')
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <header className="border-b border-stone/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-lg text-navy">GoHire Copilot</span>
          </Link>
        </div>
      </header>

      <main className="container-narrow py-8 sm:py-12">
        {/* Progress */}
        <div className="mb-8">
          <StepProgress
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            labels={stepLabels}
          />
        </div>

        {/* Steps */}
        <Card variant="elevated" className="p-6 sm:p-8">
          {currentStep === 1 && (
            <Step1Form
              defaultValues={formData as Partial<Step1Data>}
              onSubmit={handleNext}
            />
          )}
          {currentStep === 2 && (
            <Step2Form
              defaultValues={formData as Partial<Step2Data>}
              onSubmit={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <Step3Form
              defaultValues={formData as Partial<Step3Data>}
              onSubmit={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <Step4Form
              objetivo={formData.objetivo!}
              defaultValues={formData as Partial<Step4Data>}
              onSubmit={handleNext}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          )}
        </Card>
      </main>
    </div>
  )
}

// Step 1: Contexto Profissional
function Step1Form({
  defaultValues,
  onSubmit,
}: {
  defaultValues: Partial<Step1Data>
  onSubmit: (data: Step1Data) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  })

  const senioridade = watch('senioridade')
  const area = watch('area')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-navy mb-2">
          Seu contexto profissional
        </h2>
        <p className="text-navy/70">
          Conte um pouco sobre sua situação atual ou mais recente.
        </p>
      </div>

      <Input
        label="Cargo atual (ou último)"
        placeholder="Ex: Desenvolvedor Backend, Product Manager..."
        error={errors.cargo?.message}
        {...register('cargo')}
      />

      <Select
        label="Senioridade"
        options={senioridadeOptions}
        placeholder="Selecione..."
        error={errors.senioridade?.message}
        value={senioridade || ''}
        onChange={(e) => setValue('senioridade', e.target.value as Step1Data['senioridade'])}
      />

      <Select
        label="Área de atuação"
        options={areaOptions}
        placeholder="Selecione..."
        error={errors.area?.message}
        value={area || ''}
        onChange={(e) => setValue('area', e.target.value as Step1Data['area'])}
      />

      <div className="pt-4">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Continuar
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </form>
  )
}

// Step 2: Situacao Atual
function Step2Form({
  defaultValues,
  onSubmit,
  onBack,
}: {
  defaultValues: Partial<Step2Data>
  onSubmit: (data: Step2Data) => void
  onBack: () => void
}) {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      ...defaultValues,
      urgencia: defaultValues.urgencia ?? 3,
    },
  })

  const status = watch('status')
  const tempoSituacao = watch('tempoSituacao')
  const urgencia = watch('urgencia') ?? 3

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-navy mb-2">
          Sua situação atual
        </h2>
        <p className="text-navy/70">
          Entenda onde você está agora para dar direcionamentos melhores.
        </p>
      </div>

      <RadioGroup
        name="status"
        label="Status atual"
        options={statusOptions}
        value={status}
        onChange={(value) => setValue('status', value as Step2Data['status'])}
        error={errors.status?.message}
      />

      <Select
        label="Há quanto tempo nessa situação?"
        options={tempoSituacaoOptions}
        placeholder="Selecione..."
        error={errors.tempoSituacao?.message}
        value={tempoSituacao || ''}
        onChange={(e) => setValue('tempoSituacao', e.target.value as Step2Data['tempoSituacao'])}
      />

      <div>
        <label className="block text-sm font-medium text-navy mb-3">
          Qual a urgência para resolver isso? (1 = Baixa, 5 = Alta)
        </label>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('urgencia', value)}
              className={`w-12 h-12 rounded-lg border-2 font-medium transition-colors ${
                urgencia === value
                  ? 'border-teal bg-teal/10 text-teal'
                  : 'border-stone/40 text-navy/70 hover:border-stone'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        {errors.urgencia?.message && (
          <p role="alert" className="mt-2 text-sm text-red-600">{errors.urgencia.message}</p>
        )}
      </div>

      <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
        <Button type="button" variant="ghost" size="lg" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Voltar
        </Button>
        <Button type="submit" size="lg" className="w-full sm:flex-1 sm:w-auto">
          Continuar
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </form>
  )
}

// Step 3: Objetivo (only selection)
function Step3Form({
  defaultValues,
  onSubmit,
  onBack,
}: {
  defaultValues: Partial<Step3Data>
  onSubmit: (data: Step3Data) => void
  onBack: () => void
}) {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues,
  })

  const objetivo = watch('objetivo')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-navy mb-2">
          Seu objetivo principal
        </h2>
        <p className="text-navy/70">
          O que você quer resolver agora?
        </p>
      </div>

      <RadioGroup
        name="objetivo"
        label="Selecione seu foco"
        options={objetivoOptions}
        value={objetivo}
        onChange={(value) => setValue('objetivo', value as Step3Data['objetivo'])}
        error={errors.objetivo?.message}
      />

      <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
        <Button type="button" variant="ghost" size="lg" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Voltar
        </Button>
        <Button type="submit" size="lg" className="w-full sm:flex-1 sm:w-auto">
          Continuar
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </form>
  )
}

// Step 4: Contextual follow-up based on objetivo
function Step4Form({
  objetivo,
  defaultValues,
  onSubmit,
  onBack,
  isSubmitting,
}: {
  objetivo: Step3Data['objetivo']
  defaultValues: Partial<Step4Data>
  onSubmit: (data: Step4Data) => void
  onBack: () => void
  isSubmitting: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      ...defaultValues,
      objetivo, // Pass objetivo to schema for validation
    },
  })

  // Get the label for the selected objetivo
  const objetivoLabel = objetivoOptions.find(o => o.value === objetivo)?.label || ''
  const followUpQuestion = followUpLabels[objetivo]

  // Get the right options based on objetivo
  const getOptionsForObjetivo = () => {
    switch (objetivo) {
      case 'avaliar_proposta':
        return { field: 'bloqueioDecisao' as const, options: bloqueioDecisaoOptions }
      case 'mais_entrevistas':
        return { field: 'gargaloEntrevistas' as const, options: gargaloEntrevistasOptions }
      case 'avancar_processos':
        return { field: 'faseMaxima' as const, options: faseMaximaOptions }
      case 'negociar_salario':
        return { field: 'sinaisAlavanca' as const, options: sinaisAlavancaOptions }
      case 'mudar_area':
        return { field: 'tipoPivot' as const, options: tipoPivotOptions }
      default:
        return null
    }
  }

  const followUpConfig = getOptionsForObjetivo()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Context header showing selected objetivo */}
      <div className="bg-teal/5 border border-teal/20 rounded-lg p-4 flex items-start gap-3">
        <Target className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-navy/60 mb-1">Seu objetivo</p>
          <p className="font-medium text-navy">{objetivoLabel}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-navy mb-2">
          Mais um detalhe
        </h2>
        <p className="text-navy/70">
          Isso vai direcionar sua análise de forma personalizada.
        </p>
      </div>

      {/* Follow-up question for non-outro objetivos */}
      {followUpConfig && (
        <RadioGroup
          name={followUpConfig.field}
          label={followUpQuestion}
          options={followUpConfig.options}
          value={watch(followUpConfig.field) as string | undefined}
          onChange={(value) => setValue(followUpConfig.field, value as never)}
          error={errors[followUpConfig.field]?.message}
        />
      )}

      {/* Additional text field for mudar_area */}
      {objetivo === 'mudar_area' && watch('tipoPivot') && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <Input
            label="Quais forças você traz da sua experiência atual? (breve)"
            placeholder="Ex: gestão de stakeholders, análise de dados..."
            {...register('forcasTransferiveis')}
          />
        </div>
      )}

      {/* Text area for outro */}
      {objetivo === 'outro' && (
        <Textarea
          label={followUpQuestion}
          placeholder="Descreva o que te incomoda, mas você não está enfrentando..."
          error={errors.decisaoEvitando?.message}
          {...register('decisaoEvitando')}
        />
      )}

      <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
        <Button type="button" variant="ghost" size="lg" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Voltar
        </Button>
        <Button
          type="submit"
          size="lg"
          className="w-full sm:flex-1 sm:w-auto"
          isLoading={isSubmitting}
        >
          Ver minha análise
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </form>
  )
}
