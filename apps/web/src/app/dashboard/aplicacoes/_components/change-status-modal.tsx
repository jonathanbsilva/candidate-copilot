'use client'

import { useState, useTransition } from 'react'
import { Button, Select, Textarea } from '@ui/components'
import { X } from 'lucide-react'
import { changeStatus } from '../actions'
import { statusOptions, type ApplicationStatus } from '@/lib/types/application'

interface ChangeStatusModalProps {
  applicationId: string
  currentStatus: ApplicationStatus
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ChangeStatusModal({
  applicationId,
  currentStatus,
  isOpen,
  onClose,
  onSuccess,
}: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState<ApplicationStatus>(currentStatus)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newStatus === currentStatus) {
      setError('Selecione um status diferente do atual')
      return
    }

    startTransition(async () => {
      const result = await changeStatus({
        id: applicationId,
        status: newStatus,
        notes: notes || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
        onSuccess?.()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-navy/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-navy/50 hover:text-navy transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-navy mb-4">Mudar Status</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Novo status"
            options={statusOptions.map(opt => ({ value: opt.value, label: opt.label }))}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
          />

          <Textarea
            label="Notas (opcional)"
            placeholder="Adicione uma nota sobre esta mudanca..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending}>
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
