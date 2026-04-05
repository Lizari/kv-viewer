import { describe, it, expect } from 'vitest'
import { parseCsvToRecords, parseCsvToConversions, parseCsvLine } from '@/lib/parseCsv'

describe('parseCsvLine', () => {
  it('カンマ区切りを分割する', () => {
    expect(parseCsvLine('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('ダブルクォート内のカンマは無視する', () => {
    expect(parseCsvLine('"a,b",c')).toEqual(['a,b', 'c'])
  })

  it('ダブルクォートのエスケープ', () => {
    expect(parseCsvLine('"a""b",c')).toEqual(['a"b', 'c'])
  })

  it('空フィールド', () => {
    expect(parseCsvLine('a,,c')).toEqual(['a', '', 'c'])
  })
})

describe('parseCsvToRecords', () => {
  it('正常 CSV を InputRecord[] に変換', () => {
    const csv = 'user_id,user_name\nU001,山田\nU002,佐藤'
    const result = parseCsvToRecords(csv)
    expect(result.errors).toHaveLength(0)
    expect(result.data).toHaveLength(2)
    expect(result.data[0]).toEqual({ user_id: 'U001', user_name: '山田' })
  })

  it('空 CSV はエラー', () => {
    const result = parseCsvToRecords('')
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('ヘッダのみはデータ 0 件の警告', () => {
    const result = parseCsvToRecords('user_id,user_name')
    expect(result.errors).toHaveLength(0)
    expect(result.data).toHaveLength(0)
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('不足列は空文字', () => {
    const csv = 'a,b,c\n1,2'
    const result = parseCsvToRecords(csv)
    expect(result.data[0].c).toBe('')
  })

  it('UTF-8 BOM 付きヘッダを正しく扱う', () => {
    const csv = '\uFEFFuser_id,user_name\nU001,山田'
    const result = parseCsvToRecords(csv)
    expect(result.errors).toHaveLength(0)
    expect(result.data[0]).toEqual({ user_id: 'U001', user_name: '山田' })
  })

  it('quoted field 内の改行を保持する', () => {
    const csv = 'memo,user_name\n"1行目\n2行目",山田'
    const result = parseCsvToRecords(csv)
    expect(result.errors).toHaveLength(0)
    expect(result.data[0].memo).toBe('1行目\n2行目')
  })

  it('列数不一致の行は警告する', () => {
    const csv = 'a,b,c\n1,2\n3,4,5,6'
    const result = parseCsvToRecords(csv)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(2)
  })

  it('閉じていない quote はエラー', () => {
    const csv = 'a,b\n"1,2'
    const result = parseCsvToRecords(csv)
    expect(result.errors.some(error => error.includes('閉じられていません'))).toBe(true)
  })
})

describe('parseCsvToConversions', () => {
  it('正常 CSV を変換', () => {
    const csv = 'code_type,code_value,code_label\nstatus_cd,1,申請中\nstatus_cd,2,承認済'
    const result = parseCsvToConversions(csv)
    expect(result.errors).toHaveLength(0)
    expect(result.data).toHaveLength(2)
    expect(result.data[0]).toEqual({ codeType: 'status_cd', codeValue: '1', codeLabel: '申請中' })
  })

  it('必須列不足はエラー', () => {
    const csv = 'code_type,code_value\nstatus_cd,1'
    const result = parseCsvToConversions(csv)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('重複エントリは警告', () => {
    const csv = 'code_type,code_value,code_label\nstatus_cd,1,申請中\nstatus_cd,1,重複'
    const result = parseCsvToConversions(csv)
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('変換 CSV の BOM 付きヘッダを正しく扱う', () => {
    const csv = '\uFEFFcode_type,code_value,code_label\nstatus_cd,1,申請中'
    const result = parseCsvToConversions(csv)
    expect(result.errors).toHaveLength(0)
    expect(result.data[0]).toEqual({ codeType: 'status_cd', codeValue: '1', codeLabel: '申請中' })
  })

  it('変換 CSV の列数不一致は警告する', () => {
    const csv = 'code_type,code_value,code_label\nstatus_cd,1\nstatus_cd,2,承認済,extra'
    const result = parseCsvToConversions(csv)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(2)
  })
})
