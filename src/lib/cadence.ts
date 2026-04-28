export function daysSince(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function cadenceHealth(lastContactedAt: string | null, cadenceDays: number) {
  const since = daysSince(lastContactedAt);
  if (since === null) return { status: "new" as const, ratio: 0, overdueDays: 0 };
  const ratio = since / cadenceDays;
  if (ratio < 0.6) return { status: "fresh" as const, ratio, overdueDays: since - cadenceDays };
  if (ratio < 1) return { status: "due-soon" as const, ratio, overdueDays: since - cadenceDays };
  return { status: "overdue" as const, ratio, overdueDays: since - cadenceDays };
}

export const tierColorClass: Record<string, string> = {
  forest: "bg-[oklch(0.572_0.058_145)] text-cream",
  sage: "bg-sage text-ink",
  clay: "bg-[oklch(0.660_0.090_50)] text-cream",
  slate: "bg-[oklch(0.520_0.018_110)] text-cream",
  sand: "bg-[oklch(0.910_0.020_100)] text-ink",
};

export const tierDotClass: Record<string, string> = {
  forest: "bg-[oklch(0.572_0.058_145)]",
  sage: "bg-[oklch(0.785_0.043_140)]",
  clay: "bg-[oklch(0.660_0.090_50)]",
  slate: "bg-[oklch(0.520_0.018_110)]",
  sand: "bg-[oklch(0.760_0.030_95)]",
};
