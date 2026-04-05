export type ScreenType = "list" | "detail";

/**
 * 項目定義の型
 * @property sourceField - フィールド名（必須項目）
 * @property label - ラベル名（必須項目）
 * @property order - 順列
 * @property visible - 項目の表示/非表示
 * @property converter - コード定義のコードID
 */
export interface FieldDefinition {
  sourceField: string;
  label: string;
  order: number;
  visible: boolean;
  converter?: string;
}

/**
 * プレビュー画面定義の型
 * @property version - バージョン
 * @property screenName - 画面名
 * @property fields - 項目定義リスト
 */
export interface ScreenDefinition {
  version: string;
  screenName: string;
  screenType: ScreenType;
  fields: FieldDefinition[];
}

/**
 * コード定義の型
 * @property codeType - コードタイプ
 * @property codeValue - コード値
 * @property codeLabel - コードラベル名
 */
export interface ConversionDefinition {
  codeType: string;
  codeValue: string;
  codeLabel: string;
}

/** key: codeType -> codeValue -> codeLabel */
export type ConversionMap = Record<string, Record<string, string>>;

/** 1 レコードのフラットなデータ */
export type InputRecord = Record<string, string>;

export type WarningSeverity = "warn" | "error";

/**
 * 項目定義のエラー表示型
 * @property severity - エラーレベル
 * @property field - エラー項目
 * @property message - エラーメッセージ
 */
export interface PreviewWarning {
  severity: WarningSeverity;
  field?: string;
  message: string;
}

/**
 * プレビュー項目の型
 * @property sourceValue - コード変換前の値
 * @property displayValue - コード変換後の値
 * @property warnings - エラーメッセージリスト
 */
export interface PreviewCell {
  sourceValue: string;
  displayValue: string;
  warnings: PreviewWarning[];
}

/**
 * プレビュー行の型
 * @property cells - プレビュー項目リスト
 */
export interface PreviewRow {
  cells: PreviewCell[];
}

/**
 * プレビュー結果のリスト
 * @property visibleFields - 項目定義リスト
 * @property rows - プレビュー行リスト
 * @property warnings - エラーメッセージリスト
 */
export interface PreviewResult {
  visibleFields: FieldDefinition[];
  rows: PreviewRow[];
  warnings: PreviewWarning[];
}
