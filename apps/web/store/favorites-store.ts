"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  fetchFavoritesSnapshot,
  saveFavoritesSnapshot,
  trackFavoritesMetric
} from "@/lib/api-client";

const FAVORITES_MAX_ITEMS = 200;
const FAVORITES_DEFAULT_SYNC_ID = "anon-fallback";
const FAVORITES_SYNC_ID_STORAGE_KEY = "store-platform-favorites-sync-id";
const FAVORITES_SYNC_ID_COOKIE_NAME = "sp_favorites_sync_id";
const FAVORITES_SYNC_ID_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;
const LEGACY_SYNC_IDS = new Set(["shared"]);

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readSyncIdFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const chunks = document.cookie.split("; ");
  for (const chunk of chunks) {
    const [rawName, ...rest] = chunk.split("=");
    if (rawName !== FAVORITES_SYNC_ID_COOKIE_NAME) {
      continue;
    }
    const rawValue = rest.join("=");
    if (!rawValue) {
      continue;
    }
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return null;
}

function writeSyncIdCookie(syncId: string): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = [
    `${FAVORITES_SYNC_ID_COOKIE_NAME}=${encodeURIComponent(syncId)}`,
    `Max-Age=${FAVORITES_SYNC_ID_COOKIE_MAX_AGE}`,
    "Path=/",
    "SameSite=Lax"
  ].join("; ");
}

function buildAnonSyncId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `anon-${crypto.randomUUID()}`;
  }
  const random = Math.random().toString(36).slice(2, 10);
  return `anon-${Date.now().toString(36)}-${random}`;
}

function normalizeSyncId(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  const value = raw.trim();
  if (!value || value.length > 120 || LEGACY_SYNC_IDS.has(value)) {
    return null;
  }
  return value;
}

function persistSyncId(syncId: string): void {
  if (canUseLocalStorage()) {
    try {
      window.localStorage.setItem(FAVORITES_SYNC_ID_STORAGE_KEY, syncId);
    } catch {
      // Ignore localStorage write failures.
    }
  }
  writeSyncIdCookie(syncId);
}

function readSyncIdFromStorage(): string | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    return normalizeSyncId(window.localStorage.getItem(FAVORITES_SYNC_ID_STORAGE_KEY));
  } catch {
    return null;
  }
}

function normalizeProductIds(rawIds: string[]): string[] {
  const uniqueIds: string[] = [];
  const seen = new Set<string>();

  for (const rawId of rawIds) {
    const productId = rawId.trim();
    if (!productId || seen.has(productId)) {
      continue;
    }

    seen.add(productId);
    uniqueIds.push(productId);
    if (uniqueIds.length >= FAVORITES_MAX_ITEMS) {
      break;
    }
  }

  return uniqueIds;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) {
      return false;
    }
  }
  return true;
}

function resolveSyncId(): string {
  const fromStorage = readSyncIdFromStorage();
  if (fromStorage) {
    writeSyncIdCookie(fromStorage);
    return fromStorage;
  }

  const fromCookie = normalizeSyncId(readSyncIdFromCookie());
  if (fromCookie) {
    persistSyncId(fromCookie);
    return fromCookie;
  }

  const generated = buildAnonSyncId();
  persistSyncId(generated);
  return generated;
}

function currentPathname(): string {
  if (typeof window === "undefined") {
    return "/";
  }
  return window.location.pathname || "/";
}

type FavoritesState = {
  productIds: string[];
  syncId: string;
  syncReady: boolean;
  toggleProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clearFavorites: () => void;
  initSync: () => Promise<void>;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => {
      const pushSnapshot = async (productIds: string[]) => {
        const syncId = get().syncId || FAVORITES_DEFAULT_SYNC_ID;
        try {
          await saveFavoritesSnapshot(syncId, productIds);
          trackFavoritesMetric({
            metric: "favorites_synced_push",
            path: currentPathname(),
            syncId
          });
        } catch {
          // Best effort sync.
        }
      };

      return {
      productIds: [],
      syncId: FAVORITES_DEFAULT_SYNC_ID,
      syncReady: false,

      toggleProduct(productId) {
        const normalizedId = productId.trim();
        if (!normalizedId) {
          return;
        }

        let nextIds: string[] = [];
        let metric: "favorite_added" | "favorite_removed" = "favorite_added";

        set((state) => {
          if (state.productIds.includes(normalizedId)) {
            metric = "favorite_removed";
            nextIds = normalizeProductIds(state.productIds.filter((id) => id !== normalizedId));
            return {
              productIds: nextIds
            };
          }

          metric = "favorite_added";
          nextIds = normalizeProductIds([normalizedId, ...state.productIds]);
          return {
            productIds: nextIds
          };
        });

        const syncId = get().syncId || FAVORITES_DEFAULT_SYNC_ID;
        trackFavoritesMetric({
          metric,
          path: currentPathname(),
          syncId,
          productId: normalizedId
        });
        void pushSnapshot(nextIds);
      },

      removeProduct(productId) {
        const normalizedId = productId.trim();
        if (!normalizedId) {
          return;
        }

        let nextIds: string[] = [];
        set((state) => ({
          productIds: (() => {
            nextIds = normalizeProductIds(state.productIds.filter((id) => id !== normalizedId));
            return nextIds;
          })()
        }));

        const syncId = get().syncId || FAVORITES_DEFAULT_SYNC_ID;
        trackFavoritesMetric({
          metric: "favorite_removed",
          path: currentPathname(),
          syncId,
          productId: normalizedId
        });
        void pushSnapshot(nextIds);
      },

      clearFavorites() {
        const syncId = get().syncId || FAVORITES_DEFAULT_SYNC_ID;
        set({ productIds: [] });
        trackFavoritesMetric({
          metric: "favorites_cleared",
          path: currentPathname(),
          syncId
        });
        void pushSnapshot([]);
      },

      async initSync() {
        if (get().syncReady) {
          return;
        }

        const syncId = resolveSyncId();
        set({ syncId });

        try {
          const remote = await fetchFavoritesSnapshot(syncId);
          const localIds = get().productIds;
          const mergedIds = normalizeProductIds([...localIds, ...remote.productIds]);

          if (!arraysEqual(localIds, mergedIds)) {
            set({ productIds: mergedIds });
          }

          if (!arraysEqual(remote.productIds, mergedIds)) {
            await saveFavoritesSnapshot(syncId, mergedIds);
          }

          trackFavoritesMetric({
            metric: "favorites_synced_pull",
            path: currentPathname(),
            syncId
          });
        } catch {
          // Best effort sync.
        } finally {
          set({ syncReady: true });
        }
      }
    };
    },
    {
      name: "store-platform-favorites-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        productIds: state.productIds,
        syncId: state.syncId
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error(error);
          if (state) {
            state.syncReady = true;
          }
          return;
        }
        if (state) {
          void state.initSync();
        }
      }
    }
  )
);
