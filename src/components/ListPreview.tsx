import type { PreviewResult } from '@/types'
import { WarningList } from '@/components/WarningList'

interface Props {
  result: PreviewResult
  showSource: boolean
}

export function ListPreview({ result, showSource }: Props) {
  const { visibleFields, rows, warnings } = result

  const cellWarnings = rows.flatMap(row => row.cells.flatMap(cell => cell.warnings))
  const allWarnings = [...warnings, ...cellWarnings]

  if (rows.length === 0) {
    return (
      <div>
        <WarningList warnings={allWarnings} />
        <p className="no-data">表示するデータがありません</p>
      </div>
    )
  }

  return (
    <div>
      <WarningList warnings={allWarnings} />
      <div className="table-wrapper">
        <table className="preview-table">
          <thead>
            <tr>
              {visibleFields.map((f, fieldIndex) => (
                <th key={`${f.sourceField}:${f.order}:${fieldIndex}`}>{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {visibleFields.map((f, fieldIndex) => {
                  const cell = row.cells[fieldIndex]
                  const hasWarn = cell?.warnings.length > 0
                  const value = showSource ? cell?.sourceValue : cell?.displayValue
                  return (
                    <td
                      key={`${f.sourceField}:${f.order}:${fieldIndex}`}
                      className={hasWarn && !showSource ? 'cell-warn' : ''}
                      title={hasWarn && !showSource ? cell.warnings.map(w => w.message).join('\n') : undefined}
                    >
                      {value ?? ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
