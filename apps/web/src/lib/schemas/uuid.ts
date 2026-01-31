import { z } from 'zod'

/**
 * Schema Zod para validacao de UUID
 * Usado para validar IDs antes de queries no banco
 */
export const uuidSchema = z.string().uuid('ID inválido')

/**
 * Valida um UUID e retorna o resultado
 * @returns { success: true, data: string } ou { success: false, error: string }
 */
export function validateUUID(id: string): { success: true; data: string } | { success: false; error: string } {
  const result = uuidSchema.safeParse(id)
  
  if (!result.success) {
    return { success: false, error: 'ID inválido' }
  }
  
  return { success: true, data: result.data }
}
