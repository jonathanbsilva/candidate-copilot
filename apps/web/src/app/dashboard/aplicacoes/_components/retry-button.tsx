'use client'

import { Button } from '@ui/components'

export function RetryButton() {
  return (
    <Button variant="secondary" onClick={() => window.location.reload()}>
      Tentar novamente
    </Button>
  )
}
