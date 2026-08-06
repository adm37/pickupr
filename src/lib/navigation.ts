export function navigateTo(path: string, options: { replace?: boolean } = {}) {
  if (typeof window === 'undefined') return;

  const nextPath = path.startsWith('/') ? path : `/${path}`;
  if (options.replace) {
    window.history.replaceState({}, '', nextPath);
  } else {
    window.history.pushState({}, '', nextPath);
  }

  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function getCurrentPath() {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}` || '/';
}

export function scrollToSection(sectionId: string) {
  if (typeof document === 'undefined') return;

  window.setTimeout(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}