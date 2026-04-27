import { routes } from './app.routes';

describe('app.routes', () => {
  it('has default empty path', (): void => {
    expect(routes.some((r) => r.path === '')).toBe(true);
  });
  it('has glossary path', (): void => {
    expect(routes.some((r) => r.path === 'glossary')).toBe(true);
  });
  it('has locator path', (): void => {
    expect(routes.some((r) => r.path === 'locator')).toBe(true);
  });
  it('has assistant path', (): void => {
    expect(routes.some((r) => r.path === 'assistant')).toBe(true);
  });
  it('has wildcard redirect', (): void => {
    const w = routes.find((r) => r.path === '**');
    expect(w?.redirectTo).toBe('');
  });
  it('route count is five', (): void => {
    expect(routes.length).toBe(5);
  });
  it('home route uses loadComponent', (): void => {
    const h = routes.find((r) => r.path === '');
    expect(typeof h?.loadComponent).toBe('function');
  });
  it('glossary route uses loadComponent', (): void => {
    const g = routes.find((r) => r.path === 'glossary');
    expect(typeof g?.loadComponent).toBe('function');
  });
  it('wildcard is last', (): void => {
    expect(routes[routes.length - 1]?.path).toBe('**');
  });
  it('no duplicate empty paths', (): void => {
    const empties = routes.filter((r) => r.path === '');
    expect(empties.length).toBe(1);
  });
  it('every route has path or matcher', (): void => {
    for (const r of routes) {
      expect(r.path !== undefined || r.matcher !== undefined).toBe(true);
    }
  });
  it('wildcard has no loadComponent', (): void => {
    const w = routes.find((r) => r.path === '**');
    expect(w?.loadComponent).toBeUndefined();
  });
  it('home has no redirectTo', (): void => {
    const h = routes.find((r) => r.path === '');
    expect(h?.redirectTo).toBeUndefined();
  });
  it('home loadComponent returns promise', async (): Promise<void> => {
    const h = routes.find((r) => r.path === '');
    const m = await h!.loadComponent!();
    expect(m).toBeTruthy();
  });
  it('glossary loadComponent returns promise', async (): Promise<void> => {
    const g = routes.find((r) => r.path === 'glossary');
    const m = await g!.loadComponent!();
    expect(m).toBeTruthy();
  });
});
