import type { Level, LevelCategory } from "../data/levels";

export const CATEGORY_ORDER: LevelCategory[] = [
  "Deletion & Insertion",
  "Text Objects",
  "Visual Mode",
  "Search & Replace",
  "Navigation & Editing",
  "Macros & Registers",
];

type LevelGroup = {
  category: LevelCategory;
  levels: Level[];
};

export const groupLevelsByCategory = (levels: Level[]): LevelGroup[] => {
  const map = new Map<LevelCategory, Level[]>();

  for (const level of levels) {
    const existing = map.get(level.category) ?? [];
    map.set(level.category, [...existing, level]);
  }

  return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
    category: cat,
    // biome-ignore lint/style/noNonNullAssertion: filtered by map.has above
    levels: map.get(cat)!,
  }));
};
