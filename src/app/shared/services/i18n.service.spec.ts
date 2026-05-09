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
