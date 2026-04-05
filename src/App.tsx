import { useState } from "react";
import type { ScreenDefinition, InputRecord, ConversionMap } from '@/types'
import { ScreenDefinitionEditor, getIncompleteFieldIndexes } from '@/features/screen-definition/ScreenDefinitionEditor'
import { InputDataPanel } from '@/features/input-data/InputDataPanel'
import { ConversionPanel } from '@/features/conversions/ConversionPanel'
import { PreviewPanel } from '@/features/preview/PreviewPanel'
import "./App.css";

const DEFAULT_DEFINITION: ScreenDefinition = {
  version: "1.0",
  screenName: "サンプル一覧",
  screenType: "list",
  fields: [],
};

export default function App() {
  const [definition, setDefinition] =
    useState<ScreenDefinition>(DEFAULT_DEFINITION);
  const [records, setRecords] = useState<InputRecord[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [conversionMap, setConversionMap] = useState<ConversionMap>({});
  const [convWarnings, setConvWarnings] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  function addError(msg: string) {
    setErrorMsg(msg);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>画面プレビューツール</h1>
      </header>

      <main className="app-main">
        {errorMsg && (
          <div className="error-banner">
            <div className="error-item">
              <pre>{errorMsg}</pre>
              <button type="button" onClick={() => setErrorMsg(null)}>✕</button>
            </div>
          </div>
        )}

        {convWarnings.length > 0 && (
          <div className="warn-banner">
            {convWarnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        )}

        <div className="layout">
          <div className="left-pane">
            <InputDataPanel
              records={records}
              onRecordsChange={setRecords}
              onColumnsChange={setColumns}
              onError={addError}
            />

            <ConversionPanel
              conversionMap={conversionMap}
              onMapChange={setConversionMap}
              onWarnings={setConvWarnings}
              onError={addError}
            />

            <ScreenDefinitionEditor
              definition={definition}
              availableColumns={columns}
              onChange={setDefinition}
              onImportError={addError}
            />

          </div>

          <div className="right-pane">
            <div className="preview-action">
              <button
                type="button"
                className="preview-btn"
                onClick={() => {
                  const incomplete = getIncompleteFieldIndexes(definition);
                  if (incomplete.length > 0) {
                    const rows = incomplete.map((i) => `${i + 1} 行目`).join("、");
                    addError(
                      `項目定義にフィールド名・ラベルが未入力の行があります（${rows}）`,
                    );
                    return;
                  }
                  setShowPreview(true);
                }}
              >
                プレビュー実行
              </button>
            </div>
            {showPreview ? (
              <PreviewPanel
                definition={definition}
                records={records}
                conversionMap={conversionMap}
              />
            ) : (
              <p className="no-data">
                「プレビュー実行」ボタンを押すと表示されます
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
