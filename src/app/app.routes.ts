import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/timeline/timeline.component').then((m) => m.TimelineComponent),
  },
  {
    path: 'glossary',
    loadComponent: () =>
      import('./features/glossary/glossary-page.component').then((m) => m.GlossaryPageComponent),
  },
  { path: '**', redirectTo: '' },
];
