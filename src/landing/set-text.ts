/** Set an element's text content by id, no-op if the element is absent. */
export const setText = (id: string, text: string): void => {
  const node = document.getElementById(id);
  if (node) node.textContent = text;
};
