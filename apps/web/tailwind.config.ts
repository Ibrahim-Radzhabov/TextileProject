import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
        accent: "var(--color-accent)",
        "accent-soft": "var(--color-accent-soft)",
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        card: "var(--color-card)",
        "card-foreground": "var(--color-card-foreground)"
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)"
      },
      boxShadow: {
        soft: "0 24px 60px rgba(15, 23, 42, 0.26)",
        "soft-subtle": "0 18px 45px rgba(15, 23, 42, 0.18)",
        ring: "0 0 0 1px rgba(148, 163, 184, 0.3)"
      }
    }
  },
  plugins: []
};

export default config;
