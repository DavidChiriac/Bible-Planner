import { Injectable, signal } from '@angular/core';
import BOOKS from '../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import BIBLE from '../../../assets/jsons/cornilescu.json';

export interface BibleVerse {
  verse: number;
  text: string;
  comment?: string;
}

export interface BibleChapter {
  bookName: string;
  chapterNumber: number;
  verses: BibleVerse[];
}

export interface BibleTranslation {
  id: string;
  name: string;
  language: string;
  isLocal?: boolean;
}

export const TRANSLATIONS: BibleTranslation[] = [
  // Romanian Română
  { id: 'local-cornilescu', name: 'Cornilescu 1924', language: 'Română', isLocal: true },
  { id: 'VDCR', name: 'Cornilescu Revizuită', language: 'Română' },
  { id: 'VDCL', name: 'Traducere Literală Cornilescu 1931', language: 'Română' },
  { id: 'NTR', name: 'Noua Traducere Românească, 2016', language: 'Română' },

  // English
  { id: 'KJV', name: 'King James Version 1769', language: 'English' },
  { id: 'NKJV', name: 'New King James Version, 1982', language: 'English' },
  { id: 'NIV', name: 'New International Version, 1984', language: 'English' },
  { id: 'NIV2011', name: 'New International Version, 2011', language: 'English' },
  { id: 'ESV', name: 'English Standard Version', language: 'English' },
  { id: 'NASB', name: 'New American Standard Bible, 1995', language: 'English' },
  { id: 'NLT', name: 'New Living Translation, 2015', language: 'English' },
  { id: 'NET', name: 'New English Translation, 2007', language: 'English' },
  { id: 'CSB17', name: 'Christian Standard Bible, 2017', language: 'English' },
  { id: 'AMP', name: 'Amplified Bible, 2015', language: 'English' },
  { id: 'MSG', name: 'The Message, 2002', language: 'English' },
  { id: 'BSB', name: 'Berean Standard Bible', language: 'English' },
  { id: 'LSB', name: 'The Legacy Standard Bible', language: 'English' },
  { id: 'RSV', name: 'Revised Standard Version, 1952', language: 'English' },
  { id: 'RSV2CE', name: 'Revised Standard Version Catholic Edition', language: 'English' },
  { id: 'NRSVCE', name: 'New Revised Standard Version Catholic Edition, 1993', language: 'English' },
  { id: 'NABRE', name: 'New American Bible (Revised Edition)', language: 'English' },
  { id: 'WEB', name: 'World English Bible', language: 'English' },
  { id: 'YLT', name: "Young's Literal Translation, 1898", language: 'English' },
  { id: 'CJB', name: 'The Complete Jewish Bible, 1998', language: 'English' },
  { id: 'TLV', name: 'Tree of Life Version', language: 'English' },
  { id: 'LSV', name: 'Literal Standard Version', language: 'English' },
  { id: 'MEV', name: 'Modern English Version', language: 'English' },
  { id: 'DRB', name: 'Douay Rheims Bible', language: 'English' },
  { id: 'GNV', name: 'Geneva Bible, 1599', language: 'English' },
  { id: 'NJB1985', name: 'New Jerusalem Bible, 1985', language: 'English' },
  { id: 'TS2009', name: 'The Scriptures 2009', language: 'English' },
  { id: 'LXXE', name: 'English Septuagint, 1851', language: 'English' },
  { id: 'LBP', name: 'Aramaic Peshitta: Lamsa, 1933', language: 'English' },
  { id: 'SPE', name: 'Samaritan Pentateuch in English, 2013', language: 'English' },
  { id: 'CEVD', name: 'Contemporary English Version, 2006', language: 'English' },
  { id: 'CEB', name: 'Common English Bible, 2011', language: 'English' },
  { id: 'GNTD', name: 'Good News Translation, 2001', language: 'English' },
  { id: 'GNT', name: 'Good News Bible, 1976', language: 'English' },
  { id: 'ERV', name: 'Easy-to-Read Version, 2006', language: 'English' },
  { id: 'ASV', name: 'American Standard Version 1901', language: 'English' },
  { id: 'AUV', name: 'An Understandable Version, 1995', language: 'English' },
  { id: 'ISV', name: 'International Standard Version, 2011', language: 'English' },
  { id: 'NLV', name: 'New Life Version, 1969', language: 'English' },

  // Spanish Español
  { id: 'RV1960', name: 'Reina-Valera 1960', language: 'Español' },
  { id: 'RV2004', name: 'Reina Valera Gómez 2004', language: 'Español' },
  { id: 'NVI', name: 'Nueva Versión Internacional, 2015', language: 'Español' },
  { id: 'NTV', name: 'Nueva Traducción Viviente, 2009', language: 'Español' },
  { id: 'LBLA', name: 'La Biblia de las Américas, 1997', language: 'Español' },
  { id: 'BTX3', name: 'La Biblia Textual 3ra Edición', language: 'Español' },
  { id: 'PDT', name: 'Palabra de Dios para Todos', language: 'Español' },

  // Portuguese Português
  { id: 'ARA', name: 'Almeida Revista e Atualizada, 1993', language: 'Português' },
  { id: 'NVIPT', name: 'Nova Versão Internacional', language: 'Português' },
  { id: 'NVT', name: 'Nova Versão Transformadora, 2016', language: 'Português' },
  { id: 'NTLH', name: 'Nova Tradução na Linguagem de Hoje, 2000', language: 'Português' },
  { id: 'NAA', name: 'Nova Almeida Atualizada 2017', language: 'Português' },
  { id: 'KJA', name: 'Bíblia King James Atualizada, 2001', language: 'Português' },
  { id: 'OL', name: 'O Livro', language: 'Português' },
  { id: 'NTJud', name: 'Novo Testamento Judaico', language: 'Português' },
  { id: 'TB10', name: 'Tradução Brasileira, 2010', language: 'Português' },
  { id: 'VFL', name: 'Versão Fácil de Ler', language: 'Português' },
  { id: 'CNBB', name: 'Bíblia CNBB, 2002', language: 'Português' },
  { id: 'NBV07', name: 'Nova Bíblia Viva, 2007', language: 'Português' },
  { id: 'ALM21', name: 'Bíblia Almeida Século 21', language: 'Português' },
  { id: 'ARC09', name: 'Almeida Revista e Corrigida, 2009', language: 'Português' },
  { id: 'ACF11', name: 'Almeida Corrigida Fiel, 2011', language: 'Português' },
  { id: 'MENS', name: 'Bíblia A Mensagem', language: 'Português' },

  // French Français
  { id: 'NBS', name: 'Nouvelle Bible Segond, 2002', language: 'Français' },
  { id: 'FRDBY', name: 'La Bible de Darby, 1890', language: 'Français' },
  { id: 'FRLSG', name: 'Bible Segond 1910', language: 'Français' },
  { id: 'FRPDV17', name: 'Parole de Vie 2017', language: 'Français' },
  { id: 'BDS', name: 'La Bible du Semeur, 2015', language: 'Français' },

  // German Deutsch
  { id: 'LUT', name: 'Luther, 1912', language: 'Deutsch' },
  { id: 'SCH', name: 'Schlachter, 1951', language: 'Deutsch' },
  { id: 'S00', name: 'Schlachter 2000', language: 'Deutsch' },
  { id: 'ELB', name: 'Elberfelder Bibel, 1871', language: 'Deutsch' },
  { id: 'MB', name: 'Menge-Bibel', language: 'Deutsch' },
  { id: 'HFA', name: 'Hoffnung für Alle, 2015', language: 'Deutsch' },

  // Ukrainian Українська
  { id: 'UBIO', name: 'Біблія, Іван Огієнко 1962', language: 'Українська' },
  { id: 'UKRK', name: 'Біблія, Куліш/Нечуй-Левицький/Пулюй, 1903', language: 'Українська' },
  { id: 'HOM', name: 'Святе Письмо, Хоменко, 1963', language: 'Українська' },
  { id: 'UTT', name: 'Біблія Турконяка (2011)', language: 'Українська' },
  { id: 'UMT', name: 'Свята Біблія: Сучасною мовою', language: 'Українська' },
  { id: 'CUV23', name: 'БІБЛІЯ Сучасний переклад УБТ', language: 'Українська' },
  { id: 'PPCH', name: 'Новий Завіт, Юрій Попченко', language: 'Українська' },
  { id: 'GYZ', name: 'Переклад Олександра Гижі, 2019', language: 'Українська' },
  { id: 'UKDER', name: 'Велике Відкриття, Діана Деркач, 1992', language: 'Українська' },
  { id: 'TUB', name: 'Біблія Турконяка (1997-2007)', language: 'Українська' },
  { id: 'PHIL', name: 'Біблія Патріарха Філарета, 2004', language: 'Українська' },

  // Russian Русский
  { id: 'SYNOD', name: 'Синодальный Перевод', language: 'Русский' },
  { id: 'NRT', name: 'Новый русский Перевод', language: 'Русский' },
  { id: 'RBS2', name: 'Современный русский перевод, 2015', language: 'Русский' },
  { id: 'BTI', name: 'Библия Кулакова, 2015', language: 'Русский' },
  { id: 'JNT', name: 'Еврейский Новый Завет, Стерн', language: 'Русский' },
  { id: 'TNHR', name: 'ТаНаХ, Йосифон, 1975', language: 'Русский' },
  { id: 'DESN', name: 'Переводы Андрея Десницкого', language: 'Русский' },

  // Dutch Nederlands
  { id: 'NLD', name: 'Petrus Canisiusvertaling, 1939', language: 'Nederlands' },
  { id: 'DSV', name: 'Statenvertaling met Strong\'s, 1619', language: 'Nederlands' },
  { id: 'SVRJ', name: 'Statenvertaling Jongbloed-editie, 1995', language: 'Nederlands' },
  { id: 'HSV17', name: 'Herziene Statenvertaling, 2017', language: 'Nederlands' },

  // Polish Polska
  { id: 'BG', name: 'Biblia gdańska, 1881', language: 'Polska' },
  { id: 'UBG18', name: 'Uwspółcześniona Biblia Gdańska, 2018', language: 'Polska' },
  { id: 'BW', name: 'Biblia warszawska, 1975', language: 'Polska' },

  // Hungarian Magyar
  { id: 'RUF', name: 'Magyar Bibliatársulat újfordítása, 2014', language: 'Magyar' },
  { id: 'KB', name: 'Karoli Bible 1908', language: 'Magyar' },

  // Czech Ceský
  { id: 'CSP09', name: 'Ceský studijní preklad', language: 'Ceský' },

  // Swedish Svenska
  { id: 'SFB2015', name: 'Svenska Folkbibeln 2015', language: 'Svenska' },

  // Norwegian Norsk
  { id: 'DNB', name: 'Det Norsk Bibelselskap, 1930', language: 'Norsk' },

  // Latin / Italian
  { id: 'VULG', name: 'Biblia Sacra Vulgata Clementina', language: 'Latin' },
  { id: 'NR06', name: 'Nuova Riveduta, 2006', language: 'Italiano' },

  // Greek Ελληνικά
  { id: 'LXX', name: 'Septuagint', language: 'Ελληνικά' },
  { id: 'TR', name: 'Elzevir Textus Receptus, 1624', language: 'Ελληνικά' },
  { id: 'TISCH', name: 'Tischendorf 8th Ed. (w/ Strong\'s)', language: 'Ελληνικά' },
  { id: 'NTGT', name: 'Greek NT: Tischendorf 8th Ed.', language: 'Ελληνικά' },

  // Hebrew עברית
  { id: 'WLC', name: 'Westminster Leningrad Codex (Vowels)', language: 'עברית' },
  { id: 'WLCa', name: 'Westminster Leningrad Codex (w/ Strong\'s)', language: 'עברית' },
  { id: 'WLCC', name: 'Westminster Leningrad Codex (Consonants)', language: 'עברית' },
  { id: 'HAC', name: 'Tanah Aleppo Codex', language: 'עברית' },
  { id: 'DHNT', name: 'Delitzsch Hebrew NT 1877', language: 'עברית' },

  // Arabic العربية
  { id: 'NAV', name: 'كتاب الحياة', language: 'العربية' },
  { id: 'SVD', name: 'Smith and Van Dyke', language: 'العربية' },

  // Farsi فارسی
  { id: 'POV', name: 'Persian Old Version', language: 'فارسی' },
  { id: 'FACB', name: 'Farsi Contemporary Bible', language: 'فارسی' },

  // Chinese 中文
  { id: 'CUV', name: 'Chinese Union (Traditional) 和合本', language: '中文' },
  { id: 'CUNP', name: '新標點和合本串珠, 1988', language: '中文' },
  { id: 'CUNPS', name: '新标点和合本 (Simplified), 1988', language: '中文' },
  { id: 'PCB', name: '京委本聖經, 1899', language: '中文' },
  { id: 'ChiSB', name: '中文思高聖經', language: '中文' },

  // Japanese 日本語
  { id: 'NJB', name: '新改訳聖書 Shinkai-yaku, 2003', language: '日本語' },
  { id: 'JPNICT', name: '新共同訳聖書 Shinkyodo-yaku, 1987', language: '日本語' },
  { id: 'JPKJV', name: '口語訳聖書 Kougo-yaku, 1954', language: '日本語' },

  // Korean 한국어
  { id: 'KRV', name: '개역한글', language: '한국어' },
  { id: 'RNKSV', name: '새번역', language: '한국어' },

  // Hindi हिन्दी
  { id: 'HIOV', name: 'Hindi O.V. (BSI)', language: 'हिन्दी' },

  // Tamil தமிழ்
  { id: 'TBSI', name: 'Tamil Older Version Bible', language: 'தமிழ்' },
  { id: 'TAMBL98', name: 'பரிசுத்த பைபிள்', language: 'தமிழ்' },
  { id: 'TAMOVR', name: 'பரிசுத்த வேதாகமம் O.V.', language: 'தமிழ்' },

  // Kannada ಕನ್ನಡ
  { id: 'KNCL', name: 'ಕನ್ನಡ ಸತ್ಯವೇದವು C.L. (BSI)', language: 'ಕನ್ನಡ' },
  { id: 'ERVKN', name: 'Kannada Easy-to-Read Version, 2007', language: 'ಕನ್ನಡ' },

  // Malayalam മലയാളം
  { id: 'MOV', name: 'സത്യവേദപുസ്തകം O.V.', language: 'മലയാളം' },

  // Nepali नेपाली
  { id: 'NNRV', name: 'Nepali New Revised Version, 2012', language: 'नेपाली' },
  { id: 'NEPS', name: 'सरल नेपाली पवित्र बाइबल', language: 'नेपाली' },

  // Indonesian
  { id: 'TB', name: 'Terjemahan Baru', language: 'Indonesian' },

  // Vietnamese Tiếng Việt
  { id: 'VI1934', name: 'Kinh Thánh, 1934', language: 'Tiếng Việt' },

  // Afrikaans
  { id: 'AFR53', name: 'Afrikaans 1933/1953', language: 'Afrikaans' },

  // Swahili
  { id: 'SUV', name: 'Swahili Union Version, 1997', language: 'Swahili' },
];

export const TRANSLATION_LANGUAGES: string[] = [...new Set(TRANSLATIONS.map(t => t.language))];

/** Map Romanian book titles → book number (1-66) */
const BOOK_NUMBER_MAP: Record<string, number> = {};
BOOKS.forEach((book, index) => {
  BOOK_NUMBER_MAP[book.title] = index + 1;
});

export function getBookNameByNumber(bookNr: number): string | null {
  return BOOKS[bookNr - 1]?.title ?? null;
}

/** Map book number → bible-api.com 3-letter book ID (for VDCR) */
const BIBLE_API_BOOK_IDS: string[] = [
  '', // 0 unused
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA',
  '1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO',
  'ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO',
  'OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL',
  'MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH',
  'PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS',
  '1PE','2PE','1JN','2JN','3JN','JUD','REV',
];

const BIBLE_DATA = BIBLE as { verses: { book: number; chapter: number; verse: number; text: string }[] };

/** Pre-index verses by "bookNr:chapter" for O(1) lookup */
const VERSE_INDEX = new Map<string, { verse: number; text: string }[]>();
for (const v of BIBLE_DATA.verses) {
  const key = `${v.book}:${v.chapter}`;
  let arr = VERSE_INDEX.get(key);
  if (!arr) {
    arr = [];
    VERSE_INDEX.set(key, arr);
  }
  arr.push({ verse: v.verse, text: decodeUnicodeEscapes(v.text) });
}

function decodeUnicodeEscapes(str: string): string {
  return str.replaceAll(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));
}

/** Strip Strong's numbers and brackets, keep <br>, <i>, <em>, <sup> */
function cleanVerseHtml(html: string): string {
  return html
    .replaceAll(/<S>\d+<\/S>/gi, '')
    .replaceAll(/<sup>\[(\d+)\]<\/sup>/gi, '<sup>$1</sup>')
    .replaceAll(/\[[^\]]*\]/g, '')
    .trim();
}

/** Strip all HTML to plain text (for local data) */
export function stripHtml(html: string): string {
  return html.replaceAll(/<S>\d+<\/S>/gi, '').replaceAll(/<[^>]*>/g, '').replaceAll(/\[[^\]]*\]/g, '').replaceAll(/[\u2460-\u24FF\u2776-\u2793\uFF10-\uFF19\u{1F150}-\u{1F19A}]/gu, '').trim();
}

@Injectable({ providedIn: 'root' })
export class BibleTextService {
  private readonly apiCache = new Map<string, BibleChapter>();
  private readonly crossRefCache = new Map<string, Map<number, string>>();

  selectedTranslation = signal<string | null>(null);

  setTranslation(id: string) {
    this.selectedTranslation.set(id);
  }

  /**
   * Get chapter text for a label like "Geneza 1".
   * Uses local data for Cornilescu, Bolls.life API for others.
   */
  async getChapter(chapterLabel: string, translationId?: string): Promise<BibleChapter | null> {
    const tid = translationId ?? this.selectedTranslation();
    if (!tid) return null;
    const { bookName, chapterNumber } = this.parseChapterLabel(chapterLabel);
    if (!bookName || !chapterNumber) return null;

    const bookNr = BOOK_NUMBER_MAP[bookName];
    if (!bookNr) return null;

    if (tid === 'local-cornilescu') {
      const cacheKey = `local-cornilescu:${bookNr}:${chapterNumber}`;
      if (this.apiCache.has(cacheKey)) return this.apiCache.get(cacheKey)!;
      const chapter = this.getLocalChapter(bookName, chapterNumber, bookNr);
      if (chapter) {
        await this.addCrossReferences(chapter, bookNr);
        this.apiCache.set(cacheKey, chapter);
      }
      return chapter;
    }

    if (tid === 'VDCR') {
      const chapter = await this.getBibleApiChapter(bookName, chapterNumber, bookNr);
      if (chapter) await this.addCrossReferences(chapter, bookNr);
      return chapter;
    }

    return this.getApiChapter(bookName, chapterNumber, bookNr, tid);
  }

  private getLocalChapter(bookName: string, chapterNumber: number, bookNr: number): BibleChapter | null {
    const raw = VERSE_INDEX.get(`${bookNr}:${chapterNumber}`);
    if (!raw || raw.length === 0) return null;

    const verses: BibleVerse[] = raw.map(v => ({
      verse: v.verse,
      text: v.text.trim(),
    }));

    return { bookName, chapterNumber, verses };
  }

  private async getApiChapter(bookName: string, chapterNumber: number, bookNr: number, translationId: string): Promise<BibleChapter | null> {
    const cacheKey = `${translationId}:${bookNr}:${chapterNumber}`;
    if (this.apiCache.has(cacheKey)) {
      return this.apiCache.get(cacheKey)!;
    }

    try {
      const res = await fetch(`https://bolls.life/get-chapter/${translationId}/${bookNr}/${chapterNumber}/`);
      if (!res.ok) return null;

      const data: { verse: number; text: string; comment?: string }[] = await res.json();
      const verses: BibleVerse[] = data.map(v => ({
        verse: v.verse,
        text: cleanVerseHtml(v.text),
        ...(v.comment ? { comment: v.comment } : {}),
      }));

      const chapter: BibleChapter = { bookName, chapterNumber, verses };
      this.apiCache.set(cacheKey, chapter);
      return chapter;
    } catch {
      return null;
    }
  }

  private async getBibleApiChapter(bookName: string, chapterNumber: number, bookNr: number): Promise<BibleChapter | null> {
    const cacheKey = `VDCR:${bookNr}:${chapterNumber}`;
    if (this.apiCache.has(cacheKey)) {
      return this.apiCache.get(cacheKey)!;
    }

    const bookId = BIBLE_API_BOOK_IDS[bookNr];
    if (!bookId) return null;

    try {
      const res = await fetch(`https://bible-api.com/data/rccv/${bookId}/${chapterNumber}`);
      if (!res.ok) return null;

      const data: { verses: { verse: number; text: string }[] } = await res.json();
      const verses: BibleVerse[] = data.verses.map(v => ({
        verse: v.verse,
        text: v.text.trim(),
      }));

      const chapter: BibleChapter = { bookName, chapterNumber, verses };
      this.apiCache.set(cacheKey, chapter);
      return chapter;
    } catch {
      return null;
    }
  }

  private async addCrossReferences(chapter: BibleChapter, bookNr: number): Promise<void> {
    const refs = await this.fetchCrossReferences(bookNr, chapter.chapterNumber);
    if (!refs) return;
    for (const verse of chapter.verses) {
      const comment = refs.get(verse.verse);
      if (comment) verse.comment = comment;
    }
  }

  private async fetchCrossReferences(bookNr: number, chapterNr: number): Promise<Map<number, string> | null> {
    const cacheKey = `${bookNr}:${chapterNr}`;
    if (this.crossRefCache.has(cacheKey)) {
      return this.crossRefCache.get(cacheKey)!;
    }

    try {
      const res = await fetch(`https://bolls.life/get-chapter/VDCL/${bookNr}/${chapterNr}/`);
      if (!res.ok) return null;

      const data: { verse: number; comment?: string }[] = await res.json();
      const refs = new Map<number, string>();
      for (const v of data) {
        if (v.comment) refs.set(v.verse, v.comment.replaceAll(/[\u2460-\u24FF\u2776-\u2793\u{1F150}-\u{1F19A}]/gu, ''));
      }
      this.crossRefCache.set(cacheKey, refs);
      return refs;
    } catch {
      return null;
    }
  }

  /**
   * Parse "Geneza 1" → { bookName: "Geneza", chapterNumber: 1 }
   * Handles multi-word names like "1 Samuel 3" or "Cântarea Cântărilor 2".
   */
  private parseChapterLabel(label: string): { bookName: string; chapterNumber: number } {
    const parts = label.trim().split(' ');
    const chapterNumber = Number(parts.pop());
    const bookName = parts.join(' ');
    return { bookName, chapterNumber };
  }

  /**
   * Get next/previous chapter label relative to the current one.
   * Returns null if at the boundary.
   */
  getAdjacentChapter(currentLabel: string, direction: 'next' | 'prev'): string | null {
    const { bookName, chapterNumber } = this.parseChapterLabel(currentLabel);
    const bookNr = BOOK_NUMBER_MAP[bookName];
    if (!bookNr) return null;

    const bookIndex = bookNr - 1;
    const book = BOOKS[bookIndex];

    if (direction === 'next') {
      if (chapterNumber < book.chapters.length) {
        return `${bookName} ${chapterNumber + 1}`;
      }
      // Move to next book
      if (bookIndex + 1 < BOOKS.length) {
        return BOOKS[bookIndex + 1].chapters[0];
      }
      return null;
    } else {
      if (chapterNumber > 1) {
        return `${bookName} ${chapterNumber - 1}`;
      }
      // Move to previous book's last chapter
      if (bookIndex > 0) {
        const prevBook = BOOKS[bookIndex - 1];
        return prevBook.chapters.at(-1)!;
      }
      return null;
    }
  }
}
