/** Convert a nav label like "Contracts & Licenses" to a route slug like "contracts-licenses" */
export function labelToSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
