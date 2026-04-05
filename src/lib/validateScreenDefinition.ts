import type { ScreenDefinition } from '@/types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateScreenDefinition(raw: unknown): ValidationResult {
  const errors: string[] = []

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, errors: ['JSON のルートはオブジェクトである必要があります'] }
  }

  const obj = raw as Record<string, unknown>

  if (!('version' in obj) || typeof obj.version !== 'string') {
    errors.push('version が存在しないか文字列ではありません')
  }

  if (!('screenName' in obj) || typeof obj.screenName !== 'string' || obj.screenName.trim() === '') {
    errors.push('screenName が空または存在しません')
  }

  if (!('screenType' in obj) || (obj.screenType !== 'list' && obj.screenType !== 'detail')) {
    errors.push('screenType は "list" または "detail" である必要があります')
  }

  if (!('fields' in obj) || !Array.isArray(obj.fields)) {
    errors.push('fields が配列ではありません')
    return { valid: errors.length === 0, errors }
  }

  const fields = obj.fields as unknown[]
  fields.forEach((f, i) => {
    if (typeof f !== 'object' || f === null || Array.isArray(f)) {
      errors.push(`fields[${i}] がオブジェクトではありません`)
      return
    }
    const fd = f as Record<string, unknown>
    if (typeof fd.sourceField !== 'string' || fd.sourceField.trim() === '') {
      errors.push(`fields[${i}].sourceField が未設定または空です`)
    }
    if (typeof fd.label !== 'string') {
      errors.push(`fields[${i}].label が文字列ではありません`)
    }
    if (typeof fd.order !== 'number') {
      errors.push(`fields[${i}].order が数値ではありません`)
    }
    if (typeof fd.visible !== 'boolean') {
      errors.push(`fields[${i}].visible が boolean ではありません`)
    }
    if ('converter' in fd && typeof fd.converter !== 'string') {
      errors.push(`fields[${i}].converter は文字列である必要があります`)
    }
  })

  return { valid: errors.length === 0, errors }
}

export function parseScreenDefinition(raw: unknown): ScreenDefinition {
  return raw as ScreenDefinition
}
