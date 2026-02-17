import { get, ref, runTransaction, update } from 'firebase/database';
import { CHAPTER_COUNT } from './firebase.service';

const CURRENT_MIGRATION_VERSION = 1;

type BookNode = { __all?: boolean; [k: string]: any };
type ChaptersNew = Record<string, BookNode>;

function isNumericKey(k: string) {
  return /^[0-9]+$/.test(k);
}

// Old: array OR {"0":"Geneza 1", "1":"Geneza 2"} OR mix that looks array-like
function isOldArrayLike(val: unknown): boolean {
  if (Array.isArray(val)) return true;
  if (val && typeof val === 'object') {
    const keys = Object.keys(val as Record<string, unknown>);
    return keys.length > 0 && keys.every(isNumericKey);
  }
  return false;
}

// New: {"Geneza": {"1":true, "2":true} } or {"Geneza": {"__all":true}}
function isNewBookMap(val: unknown): boolean {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return false;

  const obj = val as Record<string, unknown>;
  if (Object.keys(obj).length === 0) return false;

  // if any value looks like a book node object with numeric keys or __all
  return Object.values(obj).some((v) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
    const vn = v as Record<string, unknown>;
    return vn['__all'] === true || Object.keys(vn).some(isNumericKey);
  });
}

function normalizeOldList(val: unknown): string[] {
  if (val == null) return [];
  if (Array.isArray(val))
    return val.filter((x): x is string => typeof x === 'string');

  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (Object.keys(obj).every(isNumericKey)) {
      return Object.keys(obj)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => obj[k])
        .filter((x): x is string => typeof x === 'string');
    }
  }
  return [];
}

/**
 * Parses:
 * - "Plângerile lui Ieremia 1"
 * - "Geneza-1"
 * - "1 Împărați 2"
 * Rule: last number is chapter, everything before is book.
 */
function parseChapterFlexible(
  label: string,
): { book: string; chapter: number } | null {
  const s = (label ?? '').trim();
  if (!s) return null;

  // last digits at end, allow optional separators before them
  const m = s.match(/^(.*?)(?:\s*[-#:]?\s*)(\d+)$/);
  if (!m) return null;

  const rawBook = m[1].trim().replace(/[-#:\s]+$/g, '').trim();
  const chapter = Number(m[2]);

  if (!rawBook || !Number.isInteger(chapter) || chapter <= 0) return null;
  return { book: rawBook, chapter };
}

// RTDB key safety (book titles usually fine, but keep this for correctness)
function safeKey(key: string): string {
  return key.replace(/[.#$\[\]\/]/g, '_');
}

function mergeChapterIntoNew(
  target: ChaptersNew,
  bookRaw: string,
  chapter: number,
) {
  const bookKey = safeKey(bookRaw);

  const node = (target[bookKey] ?? {}) as BookNode;

  // If already all-read, nothing to do
  if (node.__all === true) {
    target[bookKey] = node;
    return;
  }

  node[String(chapter)] = true;

  // Collapse if complete
  const total = CHAPTER_COUNT[bookRaw];
  if (total && total > 0) {
    let readCount = 0;
    for (const k of Object.keys(node)) {
      if (isNumericKey(k) && node[k] === true) readCount++;
    }
    if (readCount >= total) {
      target[bookKey] = { __all: true };
      return;
    }
  }

  target[bookKey] = node;
}

/**
 * In-place migration at:
 *   users/{uid}/chapters
 *
 * Guarded by:
 *   users/{uid}/migrationVersion
 *
 * - If migrationVersion === CURRENT_MIGRATION_VERSION -> no-op (no transaction run)
 * - If it's old array-like -> converts to new object-by-book
 * - If it's already new -> does nothing, but still stamps migrationVersion
 * - If it's mixed/unknown -> attempts a safe merge, otherwise leaves it
 */
export async function migrateChaptersSameRefIfNeeded(db: any, uid: string) {
  const migrationVersionRef = ref(db, `users/${uid}/migrationVersion`);

  // ✅ Version gate: if already migrated, skip everything
  const versionSnap = await get(migrationVersionRef);
  if (versionSnap.exists() && versionSnap.val() === CURRENT_MIGRATION_VERSION) {
    return {
      committed: false,
      migrated: false,
      skipped: true,
      reason: 'migrationVersion already up to date',
      valueType: 'unknown',
      migrationVersion: CURRENT_MIGRATION_VERSION,
    };
  }

  const chaptersRef = ref(db, `users/${uid}/chapters`);

  // Transaction protects you from races (user checks/unchecks while migrating)
  const res = await runTransaction(chaptersRef, (current: any) => {
    if (current == null) return current;

    // ✅ already new format => no-op
    if (isNewBookMap(current)) {
      return current;
    }

    // ✅ old format => convert
    if (isOldArrayLike(current)) {
      const list = normalizeOldList(current);

      const next: ChaptersNew = {}; // new format

      for (const item of list) {
        const parsed = parseChapterFlexible(item);
        if (!parsed) continue;

        // ignore obviously invalid chapters if we know book totals
        const max = CHAPTER_COUNT[parsed.book];
        if (max && parsed.chapter > max) continue;

        mergeChapterIntoNew(next, parsed.book, parsed.chapter);
      }

      return next;
    }

    // 🔸 Unknown/mixed: try best-effort merge if it looks like an object of strings
    if (typeof current === 'object' && !Array.isArray(current)) {
      const obj = current as Record<string, unknown>;
      const maybeStrings = Object.values(obj).filter(
        (v) => typeof v === 'string',
      ) as string[];

      if (maybeStrings.length > 0) {
        const next: ChaptersNew = {};
        for (const item of maybeStrings) {
          const parsed = parseChapterFlexible(item);
          if (!parsed) continue;
          const max = CHAPTER_COUNT[parsed.book];
          if (max && parsed.chapter > max) continue;
          mergeChapterIntoNew(next, parsed.book, parsed.chapter);
        }
        // Only replace if we managed to parse at least something
        if (Object.keys(next).length > 0) return next;
      }
    }

    // fallback: leave as-is
    return current;
  });

  const value = res.snapshot.val();
  const valueType = Array.isArray(value)
    ? 'array'
    : value === null
      ? 'null'
      : typeof value;

  // ✅ Stamp migrationVersion after the transaction attempt.
  // - If committed and data is now new -> set version
  // - If data was already new and transaction committed (no changes) -> set version
  // - If chapters node is null (nothing to migrate) -> still set version to avoid rechecking forever
  const shouldStamp =
    res.committed &&
    (value == null || isNewBookMap(value) || isOldArrayLike(value) === false);

  if (shouldStamp) {
    await update(ref(db, `users/${uid}`), {
      migrationVersion: CURRENT_MIGRATION_VERSION,
    });
  }

  return {
    committed: res.committed,
    migrated: res.committed && (value == null ? false : isNewBookMap(value)),
    skipped: false,
    valueType,
    migrationVersion: shouldStamp ? CURRENT_MIGRATION_VERSION : versionSnap.val(),
  };
}
