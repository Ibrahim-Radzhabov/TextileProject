export const pwaInstallMetrics = [
  "prompt_available",
  "ios_hint_shown",
  "prompt_opened",
  "installed",
  "prompt_accepted",
  "prompt_dismissed",
  "banner_dismissed"
] as const;

export type PwaInstallMetric = (typeof pwaInstallMetrics)[number];
export type PwaInstallSource = "web";

export type PwaInstallEventPayload = {
  metric: PwaInstallMetric;
  path: string;
  timestamp: string;
  source?: PwaInstallSource;
};
