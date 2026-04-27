import { routes } from './app.routes';

describe('app.routes', () => {
  it('has default empty path', () => {
    expect(routes.some((r) => r.path === '')).toBe(true);
  });
  it('has glossary path', () => {
    expect(routes.some((r) => r.path === 'glossary')).toBe(true);
  });
  it('has wildcard redirect', () => {
    const w = routes.find((r) => r.path === '**');
    expect(w?.redirectTo).toBe('');
  });
  it('route count at least 3', () => {
    expect(routes.length).toBeGreaterThanOrEqual(3);
  });
  it('home route uses loadComponent', () => {
    const h = routes.find((r) => r.path === '');
    expect(typeof h?.loadComponent).toBe('function');
  });
  it('glossary route uses loadComponent', () => {
    const g = routes.find((r) => r.path === 'glossary');
    expect(typeof g?.loadComponent).toBe('function');
  });
  it('wildcard is last', () => {
    expect(routes[routes.length - 1]?.path).toBe('**');
  });
  it('no duplicate empty paths', () => {
    const empties = routes.filter((r) => r.path === '');
    expect(empties.length).toBe(1);
  });
  it('glossary path string exact', () => {
    expect(routes.find((r) => r.path === 'glossary')?.path).toBe('glossary');
  });
  it('home path string exact', () => {
    expect(routes.find((r) => r.path === '')?.path).toBe('');
  });
  it('routes is array', () => {
    expect(Array.isArray(routes)).toBe(true);
  });
  it('every route has path or matcher', () => {
    for (const r of routes) {
      expect(r.path !== undefined || r.matcher !== undefined).toBe(true);
    }
  });
  it('wildcard has no loadComponent', () => {
    const w = routes.find((r) => r.path === '**');
    expect(w?.loadComponent).toBeUndefined();
  });
  it('home has no redirectTo', () => {
    const h = routes.find((r) => r.path === '');
    expect(h?.redirectTo).toBeUndefined();
  });
  it('glossary has no redirectTo', () => {
    const g = routes.find((r) => r.path === 'glossary');
    expect(g?.redirectTo).toBeUndefined();
  });
  it('contains three entries', () => {
    expect(routes.length).toBe(3);
  });
  it('first route is home', () => {
    expect(routes[0]?.path).toBe('');
  });
  it('second route is glossary', () => {
    expect(routes[1]?.path).toBe('glossary');
  });
  it('third route is wildcard', () => {
    expect(routes[2]?.path).toBe('**');
  });
  it('home loadComponent returns promise', async () => {
    const h = routes.find((r) => r.path === '');
    const m = await h!.loadComponent!();
    expect(m).toBeTruthy();
  });
  it('glossary loadComponent returns promise', async () => {
    const g = routes.find((r) => r.path === 'glossary');
    const m = await g!.loadComponent!();
    expect(m).toBeTruthy();
  });
});
