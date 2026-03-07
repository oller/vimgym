type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

let currentLevel: LogLevel = "info";

export const logger = {
  setLevel: (level: LogLevel) => {
    currentLevel = level;
  },
  debug: (...args: unknown[]) => {
    if (LEVELS[currentLevel] <= LEVELS.debug) {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (LEVELS[currentLevel] <= LEVELS.info) {
      console.info(...args);
    }
  },
  log: (...args: unknown[]) => {
    if (LEVELS[currentLevel] <= LEVELS.info) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (LEVELS[currentLevel] <= LEVELS.warn) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (LEVELS[currentLevel] <= LEVELS.error) {
      console.error(...args);
    }
  },
};
