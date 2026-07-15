#!/usr/bin/env node
// Validate that the CSV source of truth and the JSON mirror agree, and that
// every record carries exactly the 14 fields declared in the schema.
// Exits non-zero on any failure. Run with: node scripts/validate-data.mjs
import { readFileSync } from "node:fs";

let ok = true;
const fail = (msg) => {
  ok = false;
  console.error("FAIL:", msg);
};

// Minimal RFC 4180 CSV parser: handles quoted fields with embedded commas,
// quotes ("" escape), and newlines.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // ignore; handled by \n
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const schema = JSON.parse(readFileSync("schema/tool-record.schema.json", "utf8"));
const columns = Object.keys(schema.properties);
const required = [...schema.required].sort();

const csv = parseCsv(readFileSync("data/context-reduction-tools.csv", "utf8"));
const header = csv[0];
const dataRows = csv.slice(1);
const mirror = JSON.parse(readFileSync("data/context-reduction-tools.json", "utf8"));

// 1. CSV header and JSON meta.columns match the schema, in order.
if (JSON.stringify(header) !== JSON.stringify(columns)) {
  fail(`CSV header does not match schema properties\n  header: ${JSON.stringify(header)}`);
}
if (JSON.stringify(mirror.meta.columns) !== JSON.stringify(columns)) {
  fail("JSON meta.columns does not match schema properties");
}

// 2. Every CSV data row has exactly the declared number of fields.
const wrongWidth = dataRows.map((r, i) => [i + 2, r.length]).filter(([, n]) => n !== columns.length);
if (wrongWidth.length) {
  fail(`${wrongWidth.length} CSV row(s) do not have ${columns.length} fields (first at line ${wrongWidth[0][0]})`);
}

// 3. Row counts agree across CSV, JSON tools, and meta.tool_count.
if (dataRows.length !== mirror.tools.length) {
  fail(`CSV rows (${dataRows.length}) != JSON tools (${mirror.tools.length})`);
}
if (mirror.meta.tool_count !== mirror.tools.length) {
  fail(`JSON meta.tool_count (${mirror.meta.tool_count}) != tools length (${mirror.tools.length})`);
}

// 4. Each JSON record has exactly the schema's required keys.
mirror.tools.forEach((t, i) => {
  const keys = Object.keys(t).sort();
  if (JSON.stringify(keys) !== JSON.stringify(required)) {
    fail(`JSON tool[${i}] (${t.Tool ?? "?"}) keys do not match schema required`);
  }
});

// 5. Tool-name sets agree between CSV and JSON.
const csvNames = new Set(dataRows.map((r) => r[0]));
const jsonNames = new Set(mirror.tools.map((t) => t.Tool));
const onlyCsv = [...csvNames].filter((n) => !jsonNames.has(n));
const onlyJson = [...jsonNames].filter((n) => !csvNames.has(n));
if (onlyCsv.length || onlyJson.length) {
  fail(`tool-name mismatch. only in CSV: ${onlyCsv}. only in JSON: ${onlyJson}`);
}

if (ok) {
  console.log(`OK: ${dataRows.length} tools, ${columns.length} columns, CSV and JSON mirror agree`);
} else {
  console.error("data validation failed");
  process.exit(1);
}
