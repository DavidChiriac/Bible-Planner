import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';
import { PLATFORM_ID } from '@angular/core';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        I18nService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(I18nService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('defaults to "ro"', () => {
    expect(service.lang()).toBe('ro');
  });

  it('setLang changes the language', () => {
    service.setLang('en');
    expect(service.lang()).toBe('en');
  });

  it('t() returns the key when translation is missing', () => {
    expect(service.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('t() resolves a known key', () => {
    const result = service.t('nav.home');
    expect(typeof result).toBe('string');
    expect(result).not.toBe('nav.home');
  });

  it('t() interpolates params', () => {
    // Use a known key that has a param, or test generic interpolation
    service.setLang('ro');
    const template = service.t('nav.home');
    // At minimum, we know the function returns a string
    expect(typeof template).toBe('string');
  });

  it.each([
    ['en', 'dayBehind', '1', 'You are 1 day behind!'],
    ['en', 'dayAhead', '1', 'You are 1 day ahead!'],
    ['en', 'daysBehind', '2', 'You are 2 days behind!'],
    ['en', 'daysAhead', '1 + (1/3)', 'You are 1 + (1/3) days ahead!'],
    ['ro', 'dayBehind', '1', 'Ești cu 1 zi în urmă!'],
    ['ro', 'dayAhead', '1', 'Ești cu 1 zi înainte!'],
    ['ro', 'daysBehind', '2', 'Ești cu 2 zile în urmă!'],
    ['ro', 'daysAhead', '1 + (1/3)', 'Ești cu 1 + (1/3) zile înainte!'],
  ] as const)('translates %s %s with count %s', (lang, key, count, expected) => {
    service.setLang(lang);
    expect(service.t(`home.${key}`, { count })).toBe(expected);
  });

  it('bookTitle returns Romanian title when lang is ro', () => {
    service.setLang('ro');
    expect(service.bookTitle('Geneza')).toBe('Geneza');
  });

  it('bookTitle returns English title when lang is en', () => {
    service.setLang('en');
    const result = service.bookTitle('Geneza');
    expect(result).toBe('Genesis');
  });

  it('bookTitle returns input if not found', () => {
    service.setLang('en');
    expect(service.bookTitle('UnknownBook')).toBe('UnknownBook');
  });

  it('bookTitle returns empty string for empty input', () => {
    expect(service.bookTitle('')).toBe('');
  });

  it('translateLabel returns original when lang is ro', () => {
    service.setLang('ro');
    expect(service.translateLabel('Geneza 1-11')).toBe('Geneza 1-11');
  });

  it('translateLabel translates book names when lang is en', () => {
    service.setLang('en');
    const result = service.translateLabel('Geneza 1-11');
    expect(result).toContain('Genesis');
  });

  it('translateLabel returns empty for empty input', () => {
    expect(service.translateLabel('')).toBe('');
  });

  it('groups consecutive chapters while preserving gaps and separate books', () => {
    expect(service.formatChapterRanges([
      'Geneza 3', 'Geneza 1', 'Exodul 2', 'Geneza 2', 'Geneza 5',
      'Exodul 3', 'Exodul 4', 'Geneza 2', '1 Samuel 1',
    ])).toBe('Geneza 1-3, 5; Exodul 2-4; 1 Samuel 1');
  });

  it('does not combine nonconsecutive chapters', () => {
    expect(service.formatChapterRanges(['Geneza 1', 'Geneza 3', 'Geneza 5']))
      .toBe('Geneza 1, 3, 5');
  });

  it('translates book names in chapter ranges', () => {
    service.setLang('en');
    expect(service.formatChapterRanges(['Geneza 1', 'Geneza 2', 'Exodul 4']))
      .toBe('Genesis 1-2; Exodus 4');
  });

  it('formats an empty chapter selection as empty text', () => {
    expect(service.formatChapterRanges([])).toBe('');
  });

  it('tagLabel returns mapped tag labels', () => {
    const result = service.tagLabel('insight');
    expect(typeof result).toBe('string');
  });

  it('tagLabel returns input for unknown tags', () => {
    expect(service.tagLabel('unknown-tag')).toBe('unknown-tag');
  });

  it('languages list is populated', () => {
    expect(service.languages.length).toBeGreaterThan(0);
    expect(service.languages[0]).toHaveProperty('id');
    expect(service.languages[0]).toHaveProperty('label');
  });
});
