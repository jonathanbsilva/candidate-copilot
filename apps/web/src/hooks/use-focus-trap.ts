import { useEffect, useRef } from 'react'

/**
 * Hook para travar o foco dentro de um container (modal, drawer, etc.)
 * Acessibilidade: Garante que usuarios de teclado nao naveguem para fora do modal
 */
export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Salvar elemento que estava focado antes de abrir
    previousActiveElement.current = document.activeElement as HTMLElement
    
    const container = containerRef.current
    if (!container) return

    // Selecionar todos os elementos focaveis
    const focusableSelector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focar no primeiro elemento focavel
    if (firstElement) {
      // Pequeno delay para garantir que o DOM esta pronto
      requestAnimationFrame(() => {
        firstElement.focus()
      })
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      // Reobter elementos focaveis (podem ter mudado)
      const currentFocusable = container.querySelectorAll<HTMLElement>(focusableSelector)
      const first = currentFocusable[0]
      const last = currentFocusable[currentFocusable.length - 1]

      if (!first || !last) return

      // Shift + Tab no primeiro elemento -> vai para o ultimo
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
      // Tab no ultimo elemento -> volta para o primeiro
      else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    // Prevenir scroll do body
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      
      // Restaurar foco ao elemento anterior
      if (previousActiveElement.current && document.contains(previousActiveElement.current)) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen])

  return containerRef
}
