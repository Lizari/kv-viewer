import { useState } from 'react'
import type { ScreenDefinition, InputRecord, ConversionMap } from '@/types'
import { generatePreview } from '@/lib/generatePreview'
import { ListPreview } from '@/components/ListPreview'
import { DetailPreview } from '@/components/DetailPreview'

interface Props {
  definition: ScreenDefinition
  records: InputRecord[]
  conversionMap: ConversionMap
}

export function PreviewPanel({ definition, records, conversionMap }: Props) {
  const [showSource, setShowSource] = useState(false)

  if (definition.fields.length === 0) {
    return <p className="no-data">画面定義に項目が設定されていません</p>
  }

  const result = generatePreview(definition, records, conversionMap)

  return (
    <div>
      <div className="preview-header">
        <h3>
          プレビュー: {definition.screenName || '(未設定)'}
          <span className="screen-type-badge">
            {definition.screenType === 'list' ? 'リスト' : '単票'}
          </span>
        </h3>
        <div className="value-toggle">
          <button
            type="button"
            className={!showSource ? 'tab active' : 'tab'}
            onClick={() => setShowSource(false)}
          >
            変換後
          </button>
          <button
            type="button"
            className={showSource ? 'tab active' : 'tab'}
            onClick={() => setShowSource(true)}
          >
            変換前
          </button>
        </div>
      </div>
      {definition.screenType === 'list' ? (
        <ListPreview result={result} showSource={showSource} />
      ) : (
        <DetailPreview result={result} showSource={showSource} />
      )}
    </div>
  )
}
