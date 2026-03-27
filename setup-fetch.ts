// Polyfill fetch for Firebase compatibility in Jest (Node 18+ has fetch on globalThis)
const g = globalThis as Record<string, unknown>;
if (!g['fetch']) {
  // Node 22 exposes fetch on globalThis — copy to global for Jest's module context
  try {
    const { default: nodeFetch, Headers, Request, Response } = await import('node-fetch' as string);
    Object.assign(g, { fetch: nodeFetch, Headers, Request, Response });
  } catch {
    // node-fetch not available, fetch may already be present or not needed
  }
}
