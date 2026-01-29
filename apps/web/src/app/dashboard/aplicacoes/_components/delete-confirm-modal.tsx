'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@ui/components'
import { X, AlertTriangle } from 'lucide-react'
import { deleteApplication } from '../actions'

interface DeleteConfirmModalProps {
  applicationId: string
  companyName: string
  isOpen: boolean
  onClose: () => void
}

export function DeleteConfirmModal({
  applicationId,
  companyName,
  isOpen,
  onClose,
}: DeleteConfirmModalProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const handleDelete = () => {
    setError(null)

    startTransition(async () => {
      const result = await deleteApplication(applicationId)

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
        router.push('/dashboard/aplicacoes')
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

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-navy">Excluir Aplicacao</h2>
        </div>

        <p className="text-navy/70 mb-6">
          Tem certeza que deseja excluir a aplicacao para <strong>{companyName}</strong>? 
          Esta acao nao pode ser desfeita e todo o historico de status sera perdido.
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            isLoading={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}
