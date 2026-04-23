/*
 * Centralized route-level prefetch for the bottom NavBar destinations.
 *
 * Because every page is code-split via React.lazy(), a naive nav-tap would
 * trigger a fresh `import()` network + parse before the next screen can render,
 * which feels sluggish. We mitigate this in two ways:
 *
 *   1. `prefetchNavbarRoutes()` runs once at idle after the app mounts so the
 *      four NavBar chunks are already cached in memory by the time the user
 *      taps them.
 *   2. `prefetchRouteChunk(id)` fires on the NavBar tap itself — webpack
 *      dedupes the import promise, so if the chunk isn't cached yet we at
 *      least kick off the fetch concurrently with the tap animation instead
 *      of waiting for route mount.
 *
 * Keeping this map here (rather than inline in NavBar) means any future
 * navbar destination can be warmed up from a single place.
 */

const ROUTE_LOADERS = {
  home: () => import('../pages/HomePage'),
  packages: () => import('../pages/PackagesPage'),
  'super-club': () => import('../pages/SuperClubPage/SuperClubPlaylistPage'),
  'super-sync': () => import('../pages/DoctorsPage'),
};

export const prefetchRouteChunk = (id) => {
  const loader = ROUTE_LOADERS[id];
  if (!loader) {
    return;
  }

  try {
    // Intentionally ignore the returned promise — webpack caches the module
    // and subsequent React.lazy() resolves synchronously.
    loader();
  } catch (error) {
    // Network failures are non-fatal; React.lazy will retry on actual mount.
    console.warn('Route prefetch failed:', id, error);
  }
};

export const prefetchNavbarRoutes = () => {
  Object.keys(ROUTE_LOADERS).forEach(prefetchRouteChunk);
};
