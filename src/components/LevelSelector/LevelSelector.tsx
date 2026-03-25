import { useEffect, useState } from "react";
import type { LevelCategory } from "../../data/levels";
import { LEVELS } from "../../data/levels";
import { usePlayerDashboard } from "../../hooks/api";
import { useLevelId } from "../../hooks/useLevelId";
import { useScrollIntoView } from "../../hooks/useScrollIntoView";
import { getUserId } from "../../lib/analytics";
import { useGameStore } from "../../store/useGameStore";
import { groupLevelsByCategory } from "../../utils/groupLevelsByCategory";
import { LevelSelectorCategoryGroup } from "./LevelSelectorCategoryGroup";
import { LevelSelectorContext } from "./LevelSelectorContext";

const STORAGE_KEY = "vimgym:category-collapsed";

const loadCollapsedState = (): Set<LevelCategory> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Set();
    return new Set(JSON.parse(stored) as LevelCategory[]);
  } catch {
    return new Set();
  }
};

const saveCollapsedState = (collapsed: Set<LevelCategory>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsed]));
  } catch {
    // ignore storage errors
  }
};

export const LevelSelector = () => {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const [, setLevelId] = useLevelId();

  const userId = getUserId();
  const { data: dashboard = {} } = usePlayerDashboard(userId);

  const scrollRef = useScrollIntoView<HTMLDivElement>(currentLevel, {
    behavior: "smooth",
    block: "center",
  });

  const groups = groupLevelsByCategory(LEVELS);
  const currentCategory = LEVELS.find((l) => l.id === currentLevel)?.category;

  const [collapsedCategories, setCollapsedCategories] =
    useState<Set<LevelCategory>>(loadCollapsedState);

  useEffect(() => {
    if (currentCategory) {
      setCollapsedCategories((prev) => {
        if (prev.has(currentCategory)) {
          const next = new Set(prev);
          next.delete(currentCategory);
          saveCollapsedState(next);
          return next;
        }
        return prev;
      });
    }
  }, [currentLevel, currentCategory]);

  const handleToggle = (category: LevelCategory) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      saveCollapsedState(next);
      return next;
    });
  };

  return (
    <LevelSelectorContext
      value={{ currentLevel, dashboard, onSelect: setLevelId, scrollRef }}
    >
      <div className="w-full md:border-l font-roboto-mono border-gray-800 h-full flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent divide-y divide-gray-800">
          {groups.map((group) => {
            // Derive isOpen: a category is open unless explicitly collapsed.
            const isOpen = !collapsedCategories.has(group.category);

            return (
              <LevelSelectorCategoryGroup
                isOpen={isOpen}
                key={group.category}
                levels={group.levels}
                onToggle={() => handleToggle(group.category)}
              />
            );
          })}
        </div>
      </div>
    </LevelSelectorContext>
  );
};
