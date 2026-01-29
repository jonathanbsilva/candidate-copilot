'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@ui/components'
import { Edit, RefreshCw, Trash2 } from 'lucide-react'
import { ChangeStatusModal } from '../_components/change-status-modal'
import { DeleteConfirmModal } from '../_components/delete-confirm-modal'
import type { Application } from '@/lib/types/application'

interface ApplicationActionsProps {
  application: Application
}

export function ApplicationActions({ application }: ApplicationActionsProps) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <Link href={`/dashboard/aplicacoes/${application.id}/editar`}>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsStatusModalOpen(true)}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Mudar Status
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </Button>
      </div>

      <ChangeStatusModal
        applicationId={application.id}
        currentStatus={application.status}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />

      <DeleteConfirmModal
        applicationId={application.id}
        companyName={application.company}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  )
}
