import { describe, it, expect } from 'vitest'
import { generatePreview } from '@/lib/generatePreview'
import type { ScreenDefinition, InputRecord, ConversionMap } from '@/types'

const DEFINITION: ScreenDefinition = {
  version: '1.0',
  screenName: 'ユーザー一覧',
  screenType: 'list',
  fields: [
    { sourceField: 'user_id', label: 'ユーザーID', order: 1, visible: true },
    { sourceField: 'user_name', label: '氏名', order: 2, visible: true },
    { sourceField: 'status_cd', label: 'ステータス', order: 3, visible: true, converter: 'status_cd' },
    { sourceField: 'hidden_col', label: '非表示', order: 4, visible: false },
  ],
}

const RECORDS: InputRecord[] = [
  { user_id: 'U001', user_name: '山田太郎', status_cd: '1', hidden_col: 'x' },
  { user_id: 'U002', user_name: '佐藤花子', status_cd: '2', hidden_col: 'y' },
]

const CONV_MAP: ConversionMap = {
  status_cd: { '1': '申請中', '2': '承認済' },
}

describe('generatePreview (list)', () => {
  it('visible: false の項目は含まれない', () => {
    const result = generatePreview(DEFINITION, RECORDS, CONV_MAP)
    const fields = result.visibleFields.map(f => f.sourceField)
    expect(fields).not.toContain('hidden_col')
  })

  it('order 昇順で並ぶ', () => {
    const result = generatePreview(DEFINITION, RECORDS, CONV_MAP)
    const orders = result.visibleFields.map(f => f.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('コード変換が適用される', () => {
    const result = generatePreview(DEFINITION, RECORDS, CONV_MAP)
    expect(result.rows[0].cells[2].displayValue).toBe('申請中')
    expect(result.rows[1].cells[2].displayValue).toBe('承認済')
  })

  it('元データ値が保持される', () => {
    const result = generatePreview(DEFINITION, RECORDS, CONV_MAP)
    expect(result.rows[0].cells[2].sourceValue).toBe('1')
  })

  it('未定義コードは警告を出し元値のまま', () => {
    const result = generatePreview(DEFINITION, [
      { user_id: 'U003', user_name: 'X', status_cd: '99', hidden_col: '' },
    ], CONV_MAP)
    const cell = result.rows[0].cells[2]
    expect(cell.displayValue).toBe('99')
    expect(cell.warnings.length).toBeGreaterThan(0)
  })

  it('sourceField が存在しない場合は globalWarnings に追加', () => {
    const defWithMissing: ScreenDefinition = {
      ...DEFINITION,
      fields: [
        ...DEFINITION.fields,
        { sourceField: 'missing_col', label: '不足', order: 5, visible: true },
      ],
    }
    const result = generatePreview(defWithMissing, RECORDS, CONV_MAP)
    expect(result.warnings.some(w => w.field === 'missing_col')).toBe(true)
  })

  it('converter 未指定は元値をそのまま表示', () => {
    const result = generatePreview(DEFINITION, RECORDS, CONV_MAP)
    expect(result.rows[0].cells[1].displayValue).toBe('山田太郎')
  })

  it('同じ sourceField を複数回使ってもセルが上書きされない', () => {
    const defWithDuplicate: ScreenDefinition = {
      ...DEFINITION,
      fields: [
        { sourceField: 'status_cd', label: '変換後', order: 1, visible: true, converter: 'status_cd' },
        { sourceField: 'status_cd', label: '元値', order: 2, visible: true },
      ],
    }

    const result = generatePreview(defWithDuplicate, RECORDS, CONV_MAP)

    expect(result.rows[0].cells[0].displayValue).toBe('申請中')
    expect(result.rows[0].cells[1].displayValue).toBe('1')
  })
})

describe('generatePreview (detail)', () => {
  const detailDef: ScreenDefinition = { ...DEFINITION, screenType: 'detail' }

  it('先頭 1 行のみ採用する', () => {
    const result = generatePreview(detailDef, RECORDS, CONV_MAP)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].cells[0].displayValue).toBe('U001')
  })

  it('複数行入力時に警告', () => {
    const result = generatePreview(detailDef, RECORDS, CONV_MAP)
    expect(result.warnings.some(w => w.message.includes('複数行'))).toBe(true)
  })

  it('0 件の場合はエラー警告', () => {
    const result = generatePreview(detailDef, [], CONV_MAP)
    expect(result.warnings.some(w => w.severity === 'error')).toBe(true)
  })
})

describe('generatePreview (buildConversionMap)', () => {
  it('変換辞書自体がない code_type は警告', () => {
    const result = generatePreview(DEFINITION, [
      { user_id: 'U001', user_name: 'X', status_cd: '1', hidden_col: '' },
    ], {}) // 空の変換辞書
    const cell = result.rows[0].cells[2]
    expect(cell.warnings.some(w => w.message.includes('見つかりません'))).toBe(true)
  })
})
