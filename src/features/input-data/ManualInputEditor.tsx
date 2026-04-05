import { useState } from 'react'
import type { InputRecord } from '@/types'

interface Props {
  records: InputRecord[]
  onChange: (records: InputRecord[]) => void
}

export function ManualInputEditor({ records, onChange }: Props) {
  const [headerText, setHeaderText] = useState(
    records.length > 0 ? Object.keys(records[0]).join(',') : 'user_id,user_name,status_cd'
  )

  function getColumns(): string[] {
    return headerText
      .split(',')
      .map(h => h.trim())
      .filter(Boolean)
  }

  const columns = getColumns()

  function updateCell(rowIndex: number, col: string, value: string) {
    const next = records.map((r, i) => (i === rowIndex ? { ...r, [col]: value } : r))
    onChange(next)
  }

  function addRow() {
    const empty: InputRecord = {}
    columns.forEach(col => {
      empty[col] = ''
    })
    onChange([...records, empty])
  }

  function removeRow(index: number) {
    onChange(records.filter((_, i) => i !== index))
  }

  function applyHeader() {
    const cols = getColumns()
    const next = records.map(r => {
      const updated: InputRecord = {}
      cols.forEach(col => {
        updated[col] = r[col] ?? ''
      })
      return updated
    })
    if (next.length === 0) {
      addRowWithCols(cols)
    } else {
      onChange(next)
    }
  }

  function addRowWithCols(cols: string[]) {
    const empty: InputRecord = {}
    cols.forEach(col => {
      empty[col] = ''
    })
    onChange([empty])
  }

  return (
    <div className="manual-editor">
      <div className="field-row">
        <label>列名 (カンマ区切り)</label>
        <input
          value={headerText}
          onChange={e => setHeaderText(e.target.value)}
          placeholder="col1,col2,col3"
          style={{ width: '300px' }}
        />
        <button type="button" onClick={applyHeader}>
          列を適用
        </button>
      </div>

      {columns.length > 0 && (
        <>
          <table className="manual-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map((row, ri) => (
                <tr key={ri}>
                  {columns.map(col => (
                    <td key={col}>
                      <input
                        value={row[col] ?? ''}
                        onChange={e => updateCell(ri, col, e.target.value)}
                      />
                    </td>
                  ))}
                  <td>
                    <button type="button" onClick={() => removeRow(ri)}>
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addRow} className="add-btn">
            + 行追加
          </button>
        </>
      )}
    </div>
  )
}
