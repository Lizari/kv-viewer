import { describe, it, expect } from 'vitest'
import { buildConversionMap } from '@/lib/buildConversionMap'
import type { ConversionDefinition } from '@/types'

describe('buildConversionMap', () => {
  it('変換辞書を正しく構築する', () => {
    const defs: ConversionDefinition[] = [
      { codeType: 'status_cd', codeValue: '1', codeLabel: '申請中' },
      { codeType: 'status_cd', codeValue: '2', codeLabel: '承認済' },
      { codeType: 'gender_cd', codeValue: '1', codeLabel: '男性' },
    ]
    const { map } = buildConversionMap(defs)
    expect(map['status_cd']['1']).toBe('申請中')
    expect(map['status_cd']['2']).toBe('承認済')
    expect(map['gender_cd']['1']).toBe('男性')
  })

  it('重複エントリは最初の値を使用し警告', () => {
    const defs: ConversionDefinition[] = [
      { codeType: 'status_cd', codeValue: '1', codeLabel: '申請中' },
      { codeType: 'status_cd', codeValue: '1', codeLabel: '重複' },
    ]
    const { map, warnings } = buildConversionMap(defs)
    expect(map['status_cd']['1']).toBe('申請中')
    expect(warnings.length).toBeGreaterThan(0)
  })

  it('空配列は空の辞書を返す', () => {
    const { map } = buildConversionMap([])
    expect(map).toEqual({})
  })
})
