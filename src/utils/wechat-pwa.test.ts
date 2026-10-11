import { describe, expect, it, vi } from "vitest";
import { isWeChatBrowser, unregisterSitePwa } from "./wechat-pwa";

const scope = "https://tomz.io/";

describe("WeChat PWA policy", () => {
  it("matches WeChat's embedded browser but not Chrome or Edge", () => {
    expect(isWeChatBrowser("Mozilla/5.0 MicroMessenger/8.0.60 Chrome/122")).toBe(true);
    expect(isWeChatBrowser("Mozilla/5.0 micromessenger/8.0 iPhone")).toBe(true);
    expect(isWeChatBrowser("Mozilla/5.0 Chrome/122 Mobile Safari/537")).toBe(false);
    expect(isWeChatBrowser("Mozilla/5.0 Edg/122")).toBe(false);
  });

  it("unregisters only this site's PWA and deletes only its precache", async () => {
    const targetUnregister = vi.fn().mockResolvedValue(true);
    const otherUnregister = vi.fn().mockResolvedValue(true);
    const serviceWorkers = {
      getRegistrations: vi.fn().mockResolvedValue([
        { scope, unregister: targetUnregister },
        { scope: "https://tomz.io/another-app/", unregister: otherUnregister },
      ]),
    } as unknown as Pick<ServiceWorkerContainer, "getRegistrations">;
    const cacheStorage = {
      keys: vi.fn().mockResolvedValue([
        "workbox-precache-v2-https://tomz.io/",
        "workbox-precache-v2-https://tomz.io/another-app/",
        "custom-app-cache",
      ]),
      delete: vi.fn().mockResolvedValue(true),
    } as unknown as Pick<CacheStorage, "keys" | "delete">;

    expect(await unregisterSitePwa(serviceWorkers, scope, cacheStorage)).toBe(true);
    expect(targetUnregister).toHaveBeenCalledOnce();
    expect(otherUnregister).not.toHaveBeenCalled();
    expect(cacheStorage.delete).toHaveBeenCalledExactlyOnceWith(
      "workbox-precache-v2-https://tomz.io/",
    );
  });

  it("does not clear caches if the site has no existing registration", async () => {
    const serviceWorkers = {
      getRegistrations: vi.fn().mockResolvedValue([]),
    } as unknown as Pick<ServiceWorkerContainer, "getRegistrations">;
    const cacheStorage = {
      keys: vi.fn(),
      delete: vi.fn(),
    } as unknown as Pick<CacheStorage, "keys" | "delete">;

    expect(await unregisterSitePwa(serviceWorkers, scope, cacheStorage)).toBe(false);
    expect(cacheStorage.keys).not.toHaveBeenCalled();
  });

  it("handles a WebView that denies registration enumeration", async () => {
    const serviceWorkers = {
      getRegistrations: vi.fn().mockRejectedValue(new Error("blocked")),
    } as unknown as Pick<ServiceWorkerContainer, "getRegistrations">;

    await expect(unregisterSitePwa(serviceWorkers, scope)).resolves.toBe(false);
  });
});
