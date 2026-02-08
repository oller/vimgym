import { parseAsString, useQueryState } from "nuqs";

export const useLevelId = () => {
  return useQueryState(
    "levelId",
    parseAsString.withDefault("delete-words").withOptions({
      history: "replace",
      shallow: false,
    }),
  );
};
