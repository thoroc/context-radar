import { render } from "../render";
import { state } from "../state";

export const toggle = (id: string): void => {
  if (state.sel.has(id)) state.sel.delete(id);
  else state.sel.add(id);
  render();
};
