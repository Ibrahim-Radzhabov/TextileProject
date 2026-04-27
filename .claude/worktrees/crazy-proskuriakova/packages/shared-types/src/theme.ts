export type ThemeColors = {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentSoft: string;
  border: string;
  input: string;
  ring: string;
  card: string;
  cardForeground: string;
};

export type ThemeRadii = {
  xl: number;
  lg: number;
  md: number;
  sm: number;
};

export type ThemeShadows = {
  soft: string;
  softSubtle: string;
  ring: string;
};

export type ThemeTypography = {
  fontSans: string;
  baseFontSize: number;
  scaleRatio: number;
};

export type ThemeTokens = {
  id: string;
  name: string;
  colors: ThemeColors;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  typography: ThemeTypography;
  gradients: {
    hero: string;
    surface: string;
  };
};

export type ThemeVariant = ThemeTokens;

export type ThemeConfig = ThemeTokens & {
  defaultVariant?: string;
  variants?: ThemeVariant[];
};
