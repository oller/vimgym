import { parseAsInteger, useQueryState } from "nuqs";

export const useLevelId = () => {
  return useQueryState(
    "levelId",
    parseAsInteger.withDefault(1).withOptions({
      history: "replace",
      shallow: false,
    }),
  );
};
