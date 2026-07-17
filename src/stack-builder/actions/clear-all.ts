import { render } from "../render";
import { state } from "../state";

export const clearAll = (): void => {
  state.sel.clear();
  render();
};
