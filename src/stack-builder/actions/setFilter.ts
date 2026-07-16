import { render } from "../render";
import { state } from "../state";

export const setFilter = (f: string): void => {
  state.fActive = f;
  for (const c of document.querySelectorAll<HTMLElement>(".chip")) {
    c.classList.toggle("active", c.dataset.f === f);
  }
  render();
};
