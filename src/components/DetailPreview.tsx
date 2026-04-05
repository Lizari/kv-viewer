import type { PreviewResult } from '@/types'
import { WarningList } from '@/components/WarningList'

interface Props {
  result: PreviewResult
  showSource: boolean
}

export function DetailPreview({ result, showSource }: Props) {
  const { visibleFields, rows, warnings } = result

  const cellWarnings = rows.flatMap(row => row.cells.flatMap(cell => cell.warnings))
  const allWarnings = [...warnings, ...cellWarnings]

  const row = rows[0]

  return (
    <div>
      <WarningList warnings={allWarnings} />
      {!row ? (
        <p className="no-data">表示するデータがありません</p>
      ) : (
        <table className="preview-table detail-table">
          <tbody>
            {visibleFields.map((f, fieldIndex) => {
              const cell = row.cells[fieldIndex]
              const hasWarn = cell?.warnings.length > 0
              const value = showSource ? cell?.sourceValue : cell?.displayValue
              return (
                <tr key={`${f.sourceField}:${f.order}:${fieldIndex}`}>
                  <th>{f.label}</th>
                  <td
                    className={hasWarn && !showSource ? 'cell-warn' : ''}
                    title={hasWarn && !showSource ? cell.warnings.map(w => w.message).join('\n') : undefined}
                  >
                    {value ?? ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
