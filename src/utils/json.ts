export interface ParseResult {
  success: true;
  data: unknown;
}

export interface ParseError {
  success: false;
  message: string;
  position?: { line: number; column: number };
}

export type JsonParseResult = ParseResult | ParseError;

export function parseJson(input: string): JsonParseResult {
  try {
    const data = JSON.parse(input);
    return { success: true, data };
  } catch (e) {
    const error = e as SyntaxError;
    const match = error.message.match(/at position (\d+)/);
    let position: { line: number; column: number } | undefined;

    if (match) {
      const pos = parseInt(match[1]!, 10);
      const lines = input.substring(0, pos).split("\n");
      position = {
        line: lines.length,
        column: (lines[lines.length - 1]?.length ?? 0) + 1,
      };
    }

    return {
      success: false,
      message: error.message,
      position,
    };
  }
}

export function formatJson(
  data: unknown,
  indent: number | "tab" = 2,
  sortKeys = false
): string {
  const processed = sortKeys ? sortObjectKeys(data) : data;
  const indentStr = indent === "tab" ? "\t" : indent;
  return JSON.stringify(processed, null, indentStr);
}

export function compressJson(data: unknown): string {
  return JSON.stringify(data);
}

function sortObjectKeys(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(value as Record<string, unknown>).sort();
  for (const key of keys) {
    sorted[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
  }
  return sorted;
}

export function getJsonStats(data: unknown): {
  type: string;
  keys: number;
  depth: number;
  size: number;
} {
  const type = Array.isArray(data)
    ? "Array"
    : data === null
      ? "Null"
      : typeof data === "object"
        ? "Object"
        : typeof data;

  return {
    type,
    keys: countKeys(data),
    depth: getDepth(data),
    size: JSON.stringify(data).length,
  };
}

function countKeys(value: unknown): number {
  if (value === null || typeof value !== "object") return 0;
  if (Array.isArray(value)) {
    return value.reduce((acc: number, v) => acc + countKeys(v), value.length);
  }
  const obj = value as Record<string, unknown>;
  return Object.keys(obj).reduce(
    (acc, key) => acc + 1 + countKeys(obj[key]),
    0
  );
}

function getDepth(value: unknown): number {
  if (value === null || typeof value !== "object") return 0;
  if (Array.isArray(value)) {
    if (value.length === 0) return 1;
    return 1 + Math.max(...value.map(getDepth));
  }
  const obj = value as Record<string, unknown>;
  const values = Object.values(obj);
  if (values.length === 0) return 1;
  return 1 + Math.max(...values.map(getDepth));
}
