/** RFC 4180 quoting: wrap in quotes and double any internal quotes when the
 * value contains a comma, quote, or newline. */
export const csvCell = (value: string): string =>
  /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
