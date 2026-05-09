import { slugify } from './slugify';

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Geneza')).toBe('geneza');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('1 Cronici')).toBe('1-cronici');
  });

  it('strips diacritics', () => {
    expect(slugify('Împărați')).toBe('imparati');
  });

  it('handles multiple spaces', () => {
    expect(slugify('Cântarea Cântărilor')).toBe('cantarea-cantarilor');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });

  it('handles mixed diacritics and spaces', () => {
    expect(slugify('2 Împăraţi')).toBe('2-imparati');
  });
});
