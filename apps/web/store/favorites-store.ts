"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FavoritesState = {
  productIds: string[];
  toggleProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clearFavorites: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      productIds: [],

      toggleProduct(productId) {
        set((state) => {
          if (state.productIds.includes(productId)) {
            return {
              productIds: state.productIds.filter((id) => id !== productId)
            };
          }

          return {
            productIds: [productId, ...state.productIds].slice(0, 200)
          };
        });
      },

      removeProduct(productId) {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId)
        }));
      },

      clearFavorites() {
        set({ productIds: [] });
      }
    }),
    {
      name: "store-platform-favorites-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        productIds: state.productIds
      })
    }
  )
);
