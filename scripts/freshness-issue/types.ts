export interface Entry {
  id: string;
  tool: string;
  githubUrl: string;
  recorded?: string;
  upstream: string | null;
  reason: string;
}

export interface Report {
  generatedOn: string;
  counts: Record<string, number>;
  verdictMoving: Entry[];
  observedOnly: Entry[];
  /** Tools confirmed current with upstream this run; drives resolved-issue closing. */
  noDrift: Entry[];
  unparseable: Entry[];
  structuralSkip: Entry[];
  transientError: Entry[];
}

export interface Marker {
  id: string;
  upstream: string | null;
}

export interface Issue {
  number: number;
  state: string;
  body: string;
}
