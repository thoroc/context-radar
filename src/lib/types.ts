/**
 * Data contract for the context-reduction tools catalogue.
 *
 * The comparison table imports `data/context-reduction-tools.json` directly at
 * build time, so this shape is a contract with the `project-comparison-fetch`
 * skill that generates the data. Keep this file, the JSON schema
 * (`plugin/skills/project-comparison-fetch/schema/tool-record.schema.json`), and
 * the validator (`scripts/validate-data.mjs`) in sync.
 *
 * Each tool is an object whose keys are the CSV column headers, verbatim. One
 * header, `Stars (<snapshot date>)`, carries the refresh date and therefore
 * changes over time, so columns are addressed by position via {@link Column} and
 * `meta.columns` rather than by literal key name.
 */

/** Canonical column order in the CSV and in `meta.columns`. */
export enum Column {
  Tool = 0,
  GitHubUrl = 1,
  Layer = 2,
  WhatItDoes = 3,
  Conflict = 4,
  Runtime = 5,
  Requirements = 6,
  Licence = 7,
  Stars = 8,
  Trend = 9,
  Activity = 10,
  ActivityStatus = 11,
  Verdict = 12,
  DecisionRule = 13,
}

/** Number of columns a valid tool record must have. */
export const COLUMN_COUNT = 14;

/** One tool as stored in the JSON: keys are the CSV headers, values are strings. */
export type ToolRecord = Record<string, string>;

/** A tool projected to a positional row, in {@link Column} order. */
export type ToolRow = string[];

export interface DatasetMeta {
  last_updated: string;
  tool_count: number;
  columns: string[];
}

export interface Dataset {
  meta: DatasetMeta;
  tools: ToolRecord[];
}
