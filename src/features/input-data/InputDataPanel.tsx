import { useRef, useState } from 'react'
import type { InputRecord } from '@/types'
import { parseCsvToRecords } from '@/lib/parseCsv'
import { ManualInputEditor } from '@/features/input-data/ManualInputEditor'

interface Props {
  records: InputRecord[]
  onRecordsChange: (records: InputRecord[]) => void
  onColumnsChange: (cols: string[]) => void
  onError: (msg: string) => void
}

export function InputDataPanel({ records, onRecordsChange, onColumnsChange, onError }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'csv' | 'manual'>('csv')
  const [csvWarnings, setCsvWarnings] = useState<string[]>([])

  const columns = records.length > 0 ? Object.keys(records[0]) : []

  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const result = parseCsvToRecords(text)
      if (result.errors.length > 0) {
        onError('CSV 読込エラー:\n' + result.errors.join('\n'))
        return
      }
      setCsvWarnings(result.warnings)
      onRecordsChange(result.data)
      onColumnsChange(result.data.length > 0 ? Object.keys(result.data[0]) : [])
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  return (
    <section className="editor-section">
      <h3>入力データ</h3>

      <div className="tab-row">
        <button
          type="button"
          className={mode === 'csv' ? 'tab active' : 'tab'}
          onClick={() => setMode('csv')}
        >
          CSV 読込
        </button>
        <button
          type="button"
          className={mode === 'manual' ? 'tab active' : 'tab'}
          onClick={() => setMode('manual')}
        >
          手入力
        </button>
      </div>

      {mode === 'csv' && (
        <div>
          <button type="button" onClick={() => fileRef.current?.click()}>
            CSV ファイルを選択
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleCsvFile}
          />
          {csvWarnings.map((w, i) => (
            <p key={i} className="inline-warn">{w}</p>
          ))}
        </div>
      )}

      {mode === 'manual' && (
        <ManualInputEditor
          records={records}
          onChange={recs => {
            onRecordsChange(recs)
            onColumnsChange(recs.length > 0 ? Object.keys(recs[0]) : [])
          }}
        />
      )}

      {records.length > 0 && (
        <p className="data-summary">
          読み込み済み: {records.length} 件 / 列: {columns.join(', ')}
        </p>
      )}
    </section>
  )
}
