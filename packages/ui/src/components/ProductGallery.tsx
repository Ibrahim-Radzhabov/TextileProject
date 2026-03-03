"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { ProductMedia } from "@store-platform/shared-types";
import { Surface } from "./Surface";

export type ProductGalleryProps = {
  media: ProductMedia[];
};

export const ProductGallery: React.FC<ProductGalleryProps> = ({ media }) => {
  const [activeId, setActiveId] = React.useState<string | null>(media[0]?.id ?? null);
  const active = media.find((m) => m.id === activeId) ?? media[0];

  return (
    <div className="space-y-3">
      <Surface className="relative overflow-hidden rounded-xl border border-border/45 bg-card/82">
        {active && (
          // eslint-disable-next-line @next/next/no-img-element
          <motion.img
            key={active.id}
            src={active.url}
            alt={active.alt}
            className="h-full w-full max-h-[480px] object-cover"
            initial={{ opacity: 0.6, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </Surface>
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
            className={[
                "relative h-16 w-20 flex-none overflow-hidden rounded-[10px] border transition-all",
                active?.id === item.id
                  ? "border-border/75 bg-card/80"
                  : "border-border/45 hover:border-border/75"
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.alt}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
