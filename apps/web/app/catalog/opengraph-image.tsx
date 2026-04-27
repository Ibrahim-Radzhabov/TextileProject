import { ImageResponse } from "next/og";
import { getStorefrontConfig } from "@/lib/get-storefront-config";

export const runtime = "edge";
export const alt = "Каталог штор и тюля — Velura";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const config = await getStorefrontConfig().catch(() => null);
  const shopName = config?.shop.name ?? "Velura";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px 72px",
          background: "linear-gradient(160deg, #F6F4F1 0%, #EDE9E4 60%, #D9D2C8 100%)",
          fontFamily: "serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 72,
            fontSize: 13,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#8C8278",
            fontFamily: "sans-serif"
          }}
        >
          {shopName} / Каталог
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "42%",
            height: "100%",
            background: "linear-gradient(135deg, #E8E2D9 0%, #D4CCC0 100%)",
            opacity: 0.6
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 16, zIndex: 1 }}>
          <div
            style={{
              fontSize: 58,
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "#221C18",
              maxWidth: 660
            }}
          >
            Полная коллекция штор и тюля
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#6B6258",
              fontFamily: "sans-serif",
              fontWeight: 400,
              lineHeight: 1.5,
              maxWidth: 560
            }}
          >
            Blackout, day-night, voile, лён, бархат — всё для вашего окна
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
