/** Converts a book title to a URL-safe slug, stripping diacritics. */
export function slugify(title: string): string {
  return title
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll(/\s/g, '-');
}
