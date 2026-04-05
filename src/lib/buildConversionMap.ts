import type { ConversionDefinition, ConversionMap } from '@/types'

export interface ConversionMapResult {
  map: ConversionMap
  warnings: string[]
}

/**
 * ConversionDefinition[] から変換辞書を構築する
 * 重複エントリは最初のものを採用し、警告を追加する
 */
export function buildConversionMap(defs: ConversionDefinition[]): ConversionMapResult {
  const map: ConversionMap = {}
  const warnings: string[] = []

  for (const def of defs) {
    if (!map[def.codeType]) {
      map[def.codeType] = {}
    }
    if (def.codeValue in map[def.codeType]) {
      warnings.push(
        `コード変換重複 (最初の定義を使用): code_type="${def.codeType}", code_value="${def.codeValue}"`
      )
    } else {
      map[def.codeType][def.codeValue] = def.codeLabel
    }
  }

  return { map, warnings }
}
