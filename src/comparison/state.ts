// Shared sort state for the comparison table. One-function-per-module splits the
// render and event-wiring functions across files, so the mutable sort selection
// they all read lives here.
export const sortState: { col: string | null; dir: number } = { col: null, dir: 1 };
