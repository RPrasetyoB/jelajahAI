const CACHE_VERSION_KEY = "jelajahai-admin-content-cache-version";
const CACHE_SEEN_KEY = "jelajahai-admin-content-cache-seen";
const CACHE_CHANNEL = "jelajahai-admin-content-cache";

let started = false;

const isContentManagerRoute = () => window.location.pathname.includes("/admin/content-manager/");

const getCurrentVersion = () => window.localStorage.getItem(CACHE_VERSION_KEY) ?? "";

const getSeenVersion = () => window.sessionStorage.getItem(CACHE_SEEN_KEY) ?? "";

const markSeenVersion = (version: string) => {
  window.sessionStorage.setItem(CACHE_SEEN_KEY, version);
};

const reloadIfStale = () => {
  if (!isContentManagerRoute()) {
    return;
  }

  const currentVersion = getCurrentVersion();

  if (!currentVersion) {
    return;
  }

  const seenVersion = getSeenVersion();

  if (seenVersion === currentVersion) {
    return;
  }

  markSeenVersion(currentVersion);
  window.location.reload();
};

export const invalidateAdminContentCache = () => {
  const version = `${Date.now()}`;
  window.localStorage.setItem(CACHE_VERSION_KEY, version);

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CACHE_CHANNEL);
    channel.postMessage({ type: "invalidate", version });
    channel.close();
  }
};

export const installAdminContentCacheListener = () => {
  if (started || typeof window === "undefined") {
    return;
  }

  started = true;

  window.addEventListener("storage", (event) => {
    if (event.key === CACHE_VERSION_KEY) {
      reloadIfStale();
    }
  });

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CACHE_CHANNEL);
    channel.addEventListener("message", (event) => {
      if ((event.data as { type?: string } | null)?.type === "invalidate") {
        reloadIfStale();
      }
    });
  }

  window.addEventListener("focus", reloadIfStale);
  window.addEventListener("pageshow", reloadIfStale);

  window.setInterval(reloadIfStale, 1000);
  window.setTimeout(reloadIfStale, 0);
};
