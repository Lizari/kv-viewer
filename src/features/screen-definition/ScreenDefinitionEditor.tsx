import { useRef, useState } from "react";
import type {
  ScreenDefinition,
  FieldDefinition,
  ScreenType,
} from '@/types'
import { validateScreenDefinition } from '@/lib/validateScreenDefinition'

interface Props {
  definition: ScreenDefinition;
  availableColumns: string[];
  onChange: (def: ScreenDefinition) => void;
  onImportError: (msg: string) => void;
}

/** フィールド名・ラベルの未入力チェック。エラー行インデックスの配列を返す */
export function getIncompleteFieldIndexes(
  definition: ScreenDefinition,
): number[] {
  return definition.fields.reduce<number[]>((acc, f, i) => {
    if (!f.sourceField.trim() || !f.label.trim()) acc.push(i);
    return acc;
  }, []);
}

export function ScreenDefinitionEditor({
  definition,
  availableColumns,
  onChange,
  onImportError,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [addFieldError, setAddFieldError] = useState<string | null>(null);

  function updateRoot<K extends keyof ScreenDefinition>(
    key: K,
    value: ScreenDefinition[K],
  ) {
    onChange({ ...definition, [key]: value });
  }

  function updateField(index: number, patch: Partial<FieldDefinition>) {
    setAddFieldError(null);
    const fields = definition.fields.map((f, i) =>
      i === index ? { ...f, ...patch } : f,
    );
    onChange({ ...definition, fields });
  }

  function addField() {
    const incomplete = getIncompleteFieldIndexes(definition);
    if (incomplete.length > 0) {
      const rows = incomplete.map((i) => `${i + 1} 行目`).join("、");
      setAddFieldError(
        `フィールド名・ラベルを入力してください（未入力: ${rows}）`,
      );
      return;
    }
    setAddFieldError(null);
    const maxOrder = definition.fields.reduce(
      (m, f) => Math.max(m, f.order),
      0,
    );
    const newField: FieldDefinition = {
      sourceField: "",
      label: "",
      order: maxOrder + 1,
      visible: true,
    };
    onChange({ ...definition, fields: [...definition.fields, newField] });
  }

  function removeField(index: number) {
    setAddFieldError(null);
    onChange({
      ...definition,
      fields: definition.fields.filter((_, i) => i !== index),
    });
  }

  function exportJson() {
    const json = JSON.stringify(definition, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${definition.screenName || "screen-definition"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const result = validateScreenDefinition(raw);
        if (!result.valid) {
          onImportError(
            "画面定義 JSON が不正です:\n" + result.errors.join("\n"),
          );
          return;
        }
        setAddFieldError(null);
        onChange(raw as ScreenDefinition);
      } catch {
        onImportError("JSON のパースに失敗しました");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const incompleteIndexes = new Set(getIncompleteFieldIndexes(definition));

  return (
    <section className="editor-section">
      <h3>画面定義編集</h3>

      <div className="field-row">
        <label>画面名</label>
        <input
          value={definition.screenName}
          onChange={(e) => updateRoot("screenName", e.target.value)}
          placeholder="例: ユーザー一覧"
        />
      </div>

      <div className="field-row">
        <label>画面種別</label>
        <select
          value={definition.screenType}
          onChange={(e) =>
            updateRoot("screenType", e.target.value as ScreenType)
          }
        >
          <option value="list">一覧</option>
          <option value="detail">単票</option>
        </select>
      </div>

      <div className="import-export-row">
        <button onClick={() => fileRef.current?.click()} type="button">
          JSON インポート
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
        <button onClick={exportJson} type="button">
          JSON エクスポート
        </button>
      </div>

      <h4>項目定義</h4>
      <div className="table-wrapper">
        <table className="field-def-table">
          <thead>
            <tr>
              <th>
                <span className="required-mark">*</span> フィールド名
              </th>
              <th>
                <span className="required-mark">*</span> ラベル
              </th>
              <th>順列</th>
              <th>表示</th>
              <th>コード定義</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {definition.fields.map((f, i) => {
              const isIncomplete = incompleteIndexes.has(i);
              return (
                <tr key={i} className={isIncomplete ? "row-incomplete" : ""}>
                  <td>
                    {availableColumns.length > 0 ? (
                      <select
                        value={f.sourceField}
                        className={!f.sourceField.trim() ? "input-error" : ""}
                        onChange={(e) =>
                          updateField(i, { sourceField: e.target.value })
                        }
                      >
                        <option value="">-- 選択 --</option>
                        {availableColumns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                        {!availableColumns.includes(f.sourceField) &&
                          f.sourceField && (
                            <option value={f.sourceField}>
                              {f.sourceField} (手入力)
                            </option>
                          )}
                      </select>
                    ) : (
                      <input
                        value={f.sourceField}
                        className={!f.sourceField.trim() ? "input-error" : ""}
                        onChange={(e) =>
                          updateField(i, { sourceField: e.target.value })
                        }
                        placeholder="必須"
                      />
                    )}
                  </td>
                  <td>
                    <input
                      value={f.label}
                      className={!f.label.trim() ? "input-error" : ""}
                      onChange={(e) =>
                        updateField(i, { label: e.target.value })
                      }
                      placeholder="必須"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={f.order}
                      onChange={(e) =>
                        updateField(i, { order: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={f.visible}
                      onChange={(e) =>
                        updateField(i, { visible: e.target.checked })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={f.converter ?? ""}
                      onChange={(e) =>
                        updateField(i, {
                          converter: e.target.value || undefined,
                        })
                      }
                      placeholder="コード変換名"
                    />
                  </td>
                  <td>
                    <button onClick={() => removeField(i)} type="button">
                      削除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {addFieldError && <p className="field-error">{addFieldError}</p>}
      <button onClick={addField} type="button" className="add-btn">
        + 項目追加
      </button>
    </section>
  );
}
