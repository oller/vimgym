import type { DailyAttempt, DailyAttemptOutcome } from "../schemas/daily";
import { MAX_DAILY_ATTEMPTS } from "../schemas/daily";

type ParTier = "under_par" | "par" | "close" | "over" | "abandoned";

export const TIER_META: Record<
  ParTier,
  {
    label: string;
    emoji: string;
    textClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  under_par: {
    label: "Under Par",
    emoji: "🟪",
    textClass: "text-tokyo-night-lavender",
    bgClass: "bg-tokyo-night-lavender/15",
    borderClass: "border-tokyo-night-lavender/60",
  },
  par: {
    label: "Par",
    emoji: "🟩",
    textClass: "text-tokyo-night-turquoise",
    bgClass: "bg-tokyo-night-turquoise/15",
    borderClass: "border-tokyo-night-turquoise/60",
  },
  close: {
    label: "Close",
    emoji: "🟨",
    textClass: "text-tokyo-night-gold",
    bgClass: "bg-tokyo-night-gold/15",
    borderClass: "border-tokyo-night-gold/60",
  },
  over: {
    label: "Over Par",
    emoji: "🟥",
    textClass: "text-tokyo-night-peach",
    bgClass: "bg-tokyo-night-peach/15",
    borderClass: "border-tokyo-night-peach/60",
  },
  abandoned: {
    label: "Reset",
    emoji: "⬛",
    textClass: "text-gray-500",
    bgClass: "bg-gray-800/60",
    borderClass: "border-gray-700",
  },
};

const ATTEMPT_NUMBER_EMOJIS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"] as const;

export function getUtcDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function getMsUntilNextUtcMidnight(now: Date = new Date()): number {
  const nextMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  );
  return Math.max(0, nextMidnight - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function normalizeForMatch(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n$/, "");
}

export function isExactDailyMatch(
  currentText: string,
  targetText: string,
): boolean {
  return normalizeForMatch(currentText) === normalizeForMatch(targetText);
}

export function getScoreTier(score: number, par: number): ParTier {
  if (score < par) return "under_par";
  if (score === par) return "par";
  if (score <= par + 3) return "close";
  return "over";
}

export function getAttemptTier(
  attempt: { outcome: DailyAttemptOutcome; keystrokes_count: number },
  par: number,
): ParTier {
  if (attempt.outcome === "abandoned") return "abandoned";
  return getScoreTier(attempt.keystrokes_count, par);
}

type DiffLineStatus = "same" | "modified" | "missing" | "extra";

type DiffLine = {
  lineNumber: number;
  current: string | null;
  target: string | null;
  status: DiffLineStatus;
};

export function computeLineDiff(
  currentText: string,
  targetText: string,
): DiffLine[] {
  const currentLines = normalizeForMatch(currentText).split("\n");
  const targetLines = normalizeForMatch(targetText).split("\n");
  const maxLen = Math.max(currentLines.length, targetLines.length);
  const lines: DiffLine[] = [];

  for (let i = 0; i < maxLen; i++) {
    const cur = i < currentLines.length ? currentLines[i] : null;
    const tgt = i < targetLines.length ? targetLines[i] : null;

    let status: DiffLineStatus;
    if (cur === tgt) {
      status = "same";
    } else if (cur === null) {
      status = "missing";
    } else if (tgt === null) {
      status = "extra";
    } else {
      status = "modified";
    }

    lines.push({
      lineNumber: i + 1,
      current: cur,
      target: tgt,
      status,
    });
  }

  return lines;
}

type FormatShareParams = {
  puzzleNumber: number;
  par: number;
  bestScore: number | null;
  attempts: DailyAttempt[];
  currentStreak: number;
  url?: string;
};

function getDefaultDailyUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/daily`;
  }
  return "https://vim-gym.netlify.app/daily";
}

export function formatDailyShareText({
  puzzleNumber,
  par,
  bestScore,
  attempts,
  currentStreak,
  url = getDefaultDailyUrl(),
}: FormatShareParams): string {
  const header =
    bestScore !== null
      ? `Vimdle #${puzzleNumber} · ${bestScore} keys (Par ${par}) ${TIER_META[getScoreTier(bestScore, par)].emoji}`
      : `Vimdle #${puzzleNumber} · X/${MAX_DAILY_ATTEMPTS} (Par ${par}) ${TIER_META.abandoned.emoji}`;

  const subParts: string[] = [];
  if (currentStreak > 0) {
    subParts.push(`🔥 ${currentStreak}-day streak`);
  }
  subParts.push(`${attempts.length}/${MAX_DAILY_ATTEMPTS} tries`);

  const rows = attempts.map((attempt, idx) => {
    const numEmoji = ATTEMPT_NUMBER_EMOJIS[idx] ?? `${attempt.attempt_number}.`;
    const tier = getAttemptTier(attempt, par);
    const scoreLabel =
      attempt.outcome === "abandoned" ? "—" : `${attempt.keystrokes_count}`;
    return `${numEmoji} ${TIER_META[tier].emoji} ${scoreLabel}`;
  });

  return [header, subParts.join(" · "), "", ...rows, "", url].join("\n");
}
