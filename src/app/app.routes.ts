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
  {
    path: 'locator',
    loadComponent: () =>
      import('./features/eci-locator/eci-locator.component').then((m) => m.EciLocatorComponent),
  },
  {
    path: 'assistant',
    loadComponent: () =>
      import('./features/election-assistant/election-assistant.component').then(
        (m) => m.ElectionAssistantComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
