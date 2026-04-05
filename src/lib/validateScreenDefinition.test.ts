import { describe, it, expect } from 'vitest'
import { validateScreenDefinition } from '@/lib/validateScreenDefinition'

const VALID: unknown = {
  version: '1.0',
  screenName: 'テスト',
  screenType: 'list',
  fields: [
    { sourceField: 'id', label: 'ID', order: 1, visible: true },
  ],
}

describe('validateScreenDefinition', () => {
  it('正常な定義を valid と判定する', () => {
    const result = validateScreenDefinition(VALID)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('version なしはエラー', () => {
    const r = validateScreenDefinition({ ...VALID as object, version: undefined })
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.includes('version'))).toBe(true)
  })

  it('screenName 空はエラー', () => {
    const r = validateScreenDefinition({ ...VALID as object, screenName: '' })
    expect(r.valid).toBe(false)
    expect(r.errors.some(e => e.includes('screenName'))).toBe(true)
  })

  it('screenType 不正値はエラー', () => {
    const r = validateScreenDefinition({ ...VALID as object, screenType: 'invalid' })
    expect(r.valid).toBe(false)
  })

  it('fields が配列でないはエラー', () => {
    const r = validateScreenDefinition({ ...VALID as object, fields: 'bad' })
    expect(r.valid).toBe(false)
  })

  it('field に sourceField なしはエラー', () => {
    const r = validateScreenDefinition({
      ...VALID as object,
      fields: [{ label: 'ID', order: 1, visible: true }],
    })
    expect(r.valid).toBe(false)
  })

  it('visible が boolean でないはエラー', () => {
    const r = validateScreenDefinition({
      ...VALID as object,
      fields: [{ sourceField: 'id', label: 'ID', order: 1, visible: 'yes' }],
    })
    expect(r.valid).toBe(false)
  })

  it('detail の screenType は valid', () => {
    const r = validateScreenDefinition({ ...VALID as object, screenType: 'detail' })
    expect(r.valid).toBe(true)
  })

  it('null はエラー', () => {
    const r = validateScreenDefinition(null)
    expect(r.valid).toBe(false)
  })
})
