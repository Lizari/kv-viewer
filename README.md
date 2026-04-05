# kv-view

CSV または手入力で与えたデータをもとに、一覧画面または単票画面の表示結果を簡易プレビューするツールです。

## 起動方法

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm dev
# → http://localhost:5173 でアクセス
```

## コマンド一覧

| コマンド | 説明 |
|---|---|
| `pnpm dev` | 開発サーバー起動 (`vp dev` 相当) |
| `pnpm build` | プロダクションビルド (`vp build` 相当) |
| `pnpm check` | 型チェック (`vp check` 相当) |
| `pnpm test` | 単体テスト実行 (`vp test` 相当) |

> **補足**: vite-plus (`vp` コマンド) は Node.js 20.12+ が必要です。  
> Node.js 20.11 の場合は上記の `pnpm` コマンドを使用してください。

## 操作手順

1. **入力データを用意する**
   - 「CSV 読込」タブで CSV ファイルを選択、または
   - 「手入力」タブで列名とデータを直接入力

2. **コード変換定義を読み込む（任意）**
   - 「変換 CSV を選択」ボタンで変換定義 CSV を読み込む

3. **画面定義を作成または読み込む**
   - 「JSON インポート」でサンプル JSON を読み込む、または
   - 画面名・画面種別・項目を手動で設定する

4. **「プレビュー実行」ボタンを押す**
   - 右側のプレビューエリアに結果が表示される
   - 未定義コードや不足項目は警告として表示される

## サンプルファイル

`public/samples/` に以下のサンプルファイルがあります。

| ファイル | 説明 |
|---|---|
| `input-data.csv` | サンプル入力データ (ユーザー情報) |
| `conversions.csv` | サンプルコード変換定義 |
| `screen-list.json` | 一覧画面の画面定義サンプル |
| `screen-detail.json` | 単票画面の画面定義サンプル |

## 技術スタック

- React 18 + TypeScript
- Vite 5
- Vitest (テスト)
- pnpm

## プロジェクト構成

```
src/
  components/       # 共通 UI コンポーネント
  features/
    screen-definition/  # 画面定義編集
    input-data/         # 入力データ取込・手入力
    conversions/        # コード変換定義取込
    preview/            # プレビュー表示
  lib/              # コアロジック (純粋関数)
  types/            # 型定義
  test/             # テスト設定
```
