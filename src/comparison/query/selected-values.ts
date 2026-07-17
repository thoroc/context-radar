import { el } from "../dom";

// Read the checked values of a dropdown multiselect group.
export const selectedValues = (id: string): Set<string> => {
  const set = new Set<string>();
  for (const cb of el(id).querySelectorAll<HTMLInputElement>("input[type=checkbox]")) {
    if (cb.checked) set.add(cb.value);
  }
  return set;
};
