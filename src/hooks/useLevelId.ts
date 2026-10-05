import { parseAsString, useQueryState } from "nuqs";
import { useCallback } from "react";
import { useGameStore } from "../store/useGameStore";

export const useLevelId = () => {
  const [levelId, setQueryLevelId] = useQueryState(
    "levelId",
    parseAsString.withDefault("delete-words").withOptions({
      history: "replace",
      shallow: false,
    }),
  );

  const setLevel = useGameStore((state) => state.setLevel);

  const setLevelId = useCallback(
    (id: string) => {
      setQueryLevelId(id);
      setLevel(id);
    },
    [setQueryLevelId, setLevel],
  );

  return [levelId, setLevelId] as const;
};
