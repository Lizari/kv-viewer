import type { InputRecord, ConversionDefinition } from '@/types'

export interface CsvParseResult<T> {
  data: T[];
  errors: string[];
  warnings: string[];
}

/**
 * シンプルな CSV パーサ（ダブルクォート対応）
 * ヘッダ行必須
 */
export function parseCsvToRecords(text: string): CsvParseResult<InputRecord> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!text || text.trim() === "") {
    return { data: [], errors: ["CSV が空です"], warnings };
  }

  const parsed = parseCsvRows(text);
  if (parsed.errors.length > 0) {
    return { data: [], errors: parsed.errors, warnings };
  }

  const rows = parsed.rows;
  const headers = sanitizeHeaders(rows[0] ?? []);
  if (headers.length === 0) {
    return { data: [], errors: ["ヘッダ行が空です"], warnings };
  }
  if (headers.every((header) => header === "")) {
    return { data: [], errors: ["ヘッダ行が空です"], warnings };
  }

  const data: InputRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    if (values.length !== headers.length) {
      warnings.push(
        `データ行 ${i + 1} の列数がヘッダと一致しません (expected: ${headers.length}, actual: ${values.length})`,
      );
    }
    const record: InputRecord = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] ?? "";
    });
    data.push(record);
  }

  if (data.length === 0) {
    warnings.push("データ行が 0 件です");
  }

  return { data, errors, warnings };
}

/**
 * コード変換 CSV パーサ
 * 必須列: code_type, code_value, code_label
 */
export function parseCsvToConversions(
  text: string,
): CsvParseResult<ConversionDefinition> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (text.trim() === "") {
    return { data: [], errors: ["CSV が空です"], warnings };
  }

  const parsed = parseCsvRows(text);
  if (parsed.errors.length > 0) {
    return { data: [], errors: parsed.errors, warnings };
  }

  const rows = parsed.rows;
  if (rows.length === 0) {
    return { data: [], errors: ["CSV が空です"], warnings };
  }

  const headers = sanitizeHeaders(rows[0]).map((h) => h.trim());
  const typeIdx = headers.indexOf("code_type");
  const valueIdx = headers.indexOf("code_value");
  const labelIdx = headers.indexOf("code_label");

  if (typeIdx === -1 || valueIdx === -1 || labelIdx === -1) {
    const missing = ["code_type", "code_value", "code_label"].filter(
      (col) => !headers.includes(col),
    );
    return {
      data: [],
      errors: [`必須列が不足しています: ${missing.join(", ")}`],
      warnings,
    };
  }

  const data: ConversionDefinition[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    if (values.length !== headers.length) {
      warnings.push(
        `データ行 ${i + 1} の列数がヘッダと一致しません (expected: ${headers.length}, actual: ${values.length})`,
      );
    }
    const codeType = (values[typeIdx] ?? "").trim();
    const codeValue = (values[valueIdx] ?? "").trim();
    const codeLabel = (values[labelIdx] ?? "").trim();

    const key = `${codeType}::${codeValue}`;
    if (seen.has(key)) {
      warnings.push(
        `コード変換定義の重複: code_type="${codeType}", code_value="${codeValue}"`,
      );
    } else {
      seen.add(key);
    }

    data.push({ codeType, codeValue, codeLabel });
  }

  return { data, errors, warnings };
}

function sanitizeHeaders(headers: string[]): string[] {
  return headers.map((header, index) =>
    index === 0 ? stripBom(header) : header,
  );
}

function stripBom(text: string): string {
  return text.replace(/^\uFEFF/, "");
}

interface ParsedCsvRows {
  rows: string[][];
  errors: string[];
}

function parseCsvRows(text: string): ParsedCsvRows {
  const rows: string[][] = [];
  const errors: string[] = [];

  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let afterClosingQuote = false;
  let recordStarted = false;
  let fieldStarted = false;

  function pushField() {
    row.push(field);
    field = "";
    fieldStarted = false;
    afterClosingQuote = false;
    recordStarted = true;
  }

  function pushRow() {
    rows.push(row);
    row = [];
    recordStarted = false;
    fieldStarted = false;
    afterClosingQuote = false;
  }

  function consumeNewline(index: number): number {
    if (text[index] === "\r" && text[index + 1] === "\n") {
      return index + 1;
    }
    return index;
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
          afterClosingQuote = true;
        }
      } else if (char === "\r") {
        field += "\n";
        i = consumeNewline(i);
      } else if (char === "\n") {
        field += "\n";
      } else {
        field += char;
      }
      continue;
    }

    if (afterClosingQuote) {
      if (char === " " || char === "\t") {
        continue;
      }
      if (char === ",") {
        pushField();
        continue;
      }
      if (char === "\r" || char === "\n") {
        pushField();
        pushRow();
        i = consumeNewline(i);
        continue;
      }
      return {
        rows: [],
        errors: [
          `不正な CSV です: ダブルクォート閉じ後に不正な文字 "${char}" があります`,
        ],
      };
    }

    if (char === '"') {
      if (fieldStarted) {
        return {
          rows: [],
          errors: [
            "不正な CSV です: クォートされていない項目内にダブルクォートがあります",
          ],
        };
      }
      inQuotes = true;
      fieldStarted = true;
      recordStarted = true;
      continue;
    }

    if (char === ",") {
      pushField();
      continue;
    }

    if (char === "\r" || char === "\n") {
      if (recordStarted || row.length > 0 || fieldStarted || field !== "") {
        pushField();
        pushRow();
      }
      i = consumeNewline(i);
      continue;
    }

    field += char;
    fieldStarted = true;
    recordStarted = true;
  }

  if (inQuotes) {
    errors.push("不正な CSV です: ダブルクォートが閉じられていません");
    return { rows: [], errors };
  }

  if (
    afterClosingQuote ||
    recordStarted ||
    row.length > 0 ||
    fieldStarted ||
    field !== ""
  ) {
    pushField();
    pushRow();
  }

  return { rows, errors };
}

/**
 * 単一行の CSV レコードを分割する
 */
export function parseCsvLine(line: string): string[] {
  const parsed = parseCsvRows(line);
  if (parsed.errors.length > 0 || parsed.rows.length === 0) {
    return [];
  }
  return parsed.rows[0];
}
