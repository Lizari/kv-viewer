import { useRef } from 'react'
import type { ConversionMap } from '@/types'
import { parseCsvToConversions } from '@/lib/parseCsv'
import { buildConversionMap } from '@/lib/buildConversionMap'

interface Props {
  conversionMap: ConversionMap
  onMapChange: (map: ConversionMap) => void
  onWarnings: (warnings: string[]) => void
  onError: (msg: string) => void
}

const SAMPLE_CSV = `code_type,code_value,code_label
status_cd,1,申請中
status_cd,2,承認済
status_cd,9,取消
gender_cd,1,男性
gender_cd,2,女性`

export function ConversionPanel({ conversionMap, onMapChange, onWarnings, onError }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const codeTypes = Object.keys(conversionMap)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const parsed = parseCsvToConversions(text)
      if (parsed.errors.length > 0) {
        onError('コード変換 CSV エラー:\n' + parsed.errors.join('\n'))
        return
      }
      const built = buildConversionMap(parsed.data)
      onMapChange(built.map)
      onWarnings([...parsed.warnings, ...built.warnings])
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  return (
    <section className="editor-section">
      <h3>コード変換定義</h3>

      <p className="conv-note">
        コード値（数値・コードなど）を画面表示用ラベルへ変換するための定義です。<br />
        画面定義の <code>converter</code> 欄に <code>code_type</code> 名を指定すると変換が適用されます。
      </p>

      <div className="conv-sample">
        <span className="conv-sample-label">CSV フォーマット例:</span>
        <pre className="conv-sample-pre">{SAMPLE_CSV}</pre>
        <p className="conv-sample-hint">
          必須列: <code>code_type</code>（変換種別名）, <code>code_value</code>（元の値）,{' '}
          <code>code_label</code>（表示ラベル）
        </p>
      </div>

      <button type="button" onClick={() => fileRef.current?.click()}>
        変換 CSV を選択
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      {codeTypes.length > 0 && (
        <p className="data-summary">
          読み込み済み code_type: {codeTypes.join(', ')}
        </p>
      )}
    </section>
  )
}
