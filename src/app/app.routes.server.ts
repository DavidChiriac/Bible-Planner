import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'settings', renderMode: RenderMode.Server },
  { path: 'books', renderMode: RenderMode.Server },
  { path: 'books/:id', renderMode: RenderMode.Server },

  { path: 'login', renderMode: RenderMode.Client },

  { path: '**', renderMode: RenderMode.Server },
];
