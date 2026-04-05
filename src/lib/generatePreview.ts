import type {
  ScreenDefinition,
  InputRecord,
  ConversionMap,
  PreviewResult,
  PreviewRow,
  PreviewCell,
  PreviewWarning,
  FieldDefinition,
} from '@/types'

export function generatePreview(
  definition: ScreenDefinition,
  records: InputRecord[],
  conversionMap: ConversionMap
): PreviewResult {
  const globalWarnings: PreviewWarning[] = []

  // detail の場合は先頭行のみ採用
  let targetRecords = records
  if (definition.screenType === 'detail') {
    if (records.length === 0) {
      globalWarnings.push({
        severity: 'error',
        message: '単票画面ですがデータが 0 件です',
      })
    } else if (records.length > 1) {
      globalWarnings.push({
        severity: 'warn',
        message: `単票画面に複数行 (${records.length} 件) が入力されています。先頭行のみ使用します`,
      })
      targetRecords = [records[0]]
    }
  }

  // visible: true のフィールドを order 昇順で並べる
  const visibleFields = definition.fields
    .filter(f => f.visible)
    .sort((a, b) => a.order - b.order)

  // 入力データのヘッダを特定
  const inputHeaders = targetRecords.length > 0 ? Object.keys(targetRecords[0]) : []

  // sourceField の不足チェック
  for (const field of visibleFields) {
    if (inputHeaders.length > 0 && !inputHeaders.includes(field.sourceField)) {
      globalWarnings.push({
        severity: 'warn',
        field: field.sourceField,
        message: `入力データに項目 "${field.sourceField}" が存在しません`,
      })
    }
  }

  const rows: PreviewRow[] = targetRecords.map(record => {
    const cells = visibleFields.map(field => {
      const sourceValue = record[field.sourceField] ?? ''
      return resolveCell(field, sourceValue, conversionMap)
    })

    return { cells }
  })

  return { visibleFields, rows, warnings: globalWarnings }
}

function resolveCell(
  field: FieldDefinition,
  sourceValue: string,
  conversionMap: ConversionMap
): PreviewCell {
  const warnings: PreviewWarning[] = []

  if (!field.converter) {
    return { sourceValue, displayValue: sourceValue, warnings }
  }

  const typeMap = conversionMap[field.converter]
  if (!typeMap) {
    warnings.push({
      severity: 'warn',
      field: field.sourceField,
      message: `コード変換定義 "${field.converter}" が見つかりません`,
    })
    return { sourceValue, displayValue: sourceValue, warnings }
  }

  if (sourceValue === '') {
    return { sourceValue, displayValue: '', warnings }
  }

  const label = typeMap[sourceValue]
  if (label === undefined) {
    warnings.push({
      severity: 'warn',
      field: field.sourceField,
      message: `未定義コード: ${field.converter}="${sourceValue}"`,
    })
    return { sourceValue, displayValue: sourceValue, warnings }
  }

  return { sourceValue, displayValue: label, warnings }
}
