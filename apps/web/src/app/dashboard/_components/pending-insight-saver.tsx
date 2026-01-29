'use client'

import { useEffect, useState } from 'react'
import { saveInsight, type InsightData } from '@/app/insight/actions'
import { Card } from '@ui/components'
import { CheckCircle } from 'lucide-react'

export function PendingInsightSaver() {
  const [savedPending, setSavedPending] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const pendingInsight = sessionStorage.getItem('pendingInsight')
    
    if (pendingInsight && !saving) {
      setSaving(true)
      
      try {
        const data = JSON.parse(pendingInsight) as InsightData
        
        saveInsight(data).then((result) => {
          if (result.success) {
            sessionStorage.removeItem('pendingInsight')
            sessionStorage.removeItem('entryFlowData')
            setSavedPending(true)
          }
          setSaving(false)
        })
      } catch {
        setSaving(false)
      }
    }
  }, [saving])

  if (savedPending) {
    return (
      <Card className="p-4 bg-teal/10 border-teal/30 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-teal" />
          <p className="text-navy font-medium">
            Seu insight anterior foi salvo automaticamente!
          </p>
        </div>
      </Card>
    )
  }

  return null
}
