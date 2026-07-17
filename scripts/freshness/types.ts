export interface Version {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
}

export type Bucket =
  | "verdict-moving"
  | "observed-only"
  | "no-drift"
  | "structural-skip"
  | "unparseable"
  | "transient-error";

export interface Classification {
  bucket: Bucket;
  reason: string;
}
