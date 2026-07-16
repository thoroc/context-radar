// Shared selection state for the stack builder. One-function-per-module splits
// the selectors, actions, and render functions across files, so the mutable
// selection set and active filter they all touch live here. `sel` is reassigned
// wholesale by loadRec, hence a mutable field rather than a const set.
export const state: { sel: Set<string>; fActive: string } = {
  sel: new Set<string>(),
  fActive: "all",
};
