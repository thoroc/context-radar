/** Fetch an element by id, throwing if it is missing (a wiring bug, not a
 * runtime condition). */
export const el = <T extends HTMLElement>(id: string): T => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
};
