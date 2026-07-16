import { render } from "../render";
import { RECOMMENDED } from "../stack-data";
import { state } from "../state";

export const loadRec = (): void => {
  state.sel = new Set(RECOMMENDED);
  render();
};
