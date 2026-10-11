// WeChat's embedded WebView reads the site as a normal website, not a PWA.
export function isWeChatBrowser(userAgent: string): boolean {
  return /MicroMessenger/i.test(userAgent);
}

// Remove only this deployment's old Workbox registration/cache. Never touch
// unrelated registrations on the same origin (including other base paths).
export async function unregisterSitePwa(
  serviceWorkers: Pick<ServiceWorkerContainer, "getRegistrations">,
  scopeUrl: string,
  cacheStorage?: Pick<CacheStorage, "keys" | "delete">,
): Promise<boolean> {
  let unregistered = false;

  try {
    const registrations = await serviceWorkers.getRegistrations();
    for (const registration of registrations) {
      if (registration.scope !== scopeUrl) continue;
      try {
        unregistered = (await registration.unregister()) || unregistered;
      } catch {
        // An individual unregister failure must not block other registrations.
      }
    }
  } catch {
    // Some WebViews expose the API but deny access; do not break page rendering.
    return false;
  }

  if (unregistered && cacheStorage) {
    try {
      const names = await cacheStorage.keys();
      await Promise.all(
        names
          .filter((name) => name === `workbox-precache-v2-${scopeUrl}`)
          .map((name) => cacheStorage.delete(name)),
      );
    } catch {
      // Cache cleanup is best effort; unregistering is what disables interception.
    }
  }

  return unregistered;
}
