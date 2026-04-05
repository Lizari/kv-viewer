import type { PreviewWarning } from '@/types'

interface Props {
  warnings: PreviewWarning[]
  title?: string
}

export function WarningList({ warnings, title = '警告' }: Props) {
  if (warnings.length === 0) return null

  return (
    <div className="warning-list">
      <h4>{title}</h4>
      <ul>
        {warnings.map((w, i) => (
          <li key={i} className={`warning-item warning-${w.severity}`}>
            {w.severity === 'error' ? '[エラー]' : '[警告]'}
            {w.field ? ` (${w.field})` : ''} {w.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
