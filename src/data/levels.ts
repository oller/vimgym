export type Level = {
  id: number;
  name: string;
  startText: string;
  targetText: string;
  description: string;
  perfectScore?: number;
};

export const LEVELS = [
  {
    id: 1,
    name: "Delete Words",
    startText: "The quick brown fox jumps over the lazy dog.",
    targetText: "The quick brown fox jumps.",
    description: "Delete 'over the lazy dog' from the sentence",
    perfectScore: 6,
  },
  {
    id: 2,
    name: "Flip Ternary",
    startText: "const activity = isSunny ? 'xbox' : 'golf'",
    targetText: "const activity = isSunny ? 'golf' : 'xbox'",
    description: "Swap 'golf' and 'xbox' in the ternary",
    perfectScore: 13,
  },
  {
    id: 3,
    name: "Remove the hiccups!",
    startText: "The 2nd best time to hiccup plant a tree hiccup is now hiccup.",
    targetText: "The 2nd best time to plant a tree is now.",
    description: "The hiccups are annoying, remove them all",
    perfectScore: 16,
  },
  {
    id: 4,
    name: "Extract Domain",
    startText: "Visit us at https://www.example.com/about for more info.",
    targetText: "Visit us at example.com for more info.",
    description: "Extract the domain from the URL",
    perfectScore: 11,
  },
  {
    id: 5,
    name: "Clean Up List",
    startText: "- Apples\n- Bananas\n- Oranges\n- Grapes\n- Mangoes",
    targetText: "Apples, Bananas, Oranges, Grapes, Mangoes",
    description: "Convert the list into a comma-separated line",
    perfectScore: 8,
  },
  {
    id: 6,
    name: "Comment Block",
    startText: "const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;",
    targetText:
      "// const a = 1;\n// const b = 2;\n// const c = 3;\n// const d = 4;",
    description: "Comment out all lines using Visual Block mode",
    perfectScore: 10,
  },
  {
    id: 7,
    name: "JSONify",
    startText: "name: John\nage: 30\ncity: New York",
    targetText: '"name": "John",\n"age": "30",\n"city": "New York",',
    description: "Convert yaml-like key-values to JSON format",
    perfectScore: 18,
  },
  {
    id: 8,
    name: "Snake to Camel",
    startText: 'const user_first_name = "John";\nconst user_last_name = "Doe";',
    targetText: 'const userFirstName = "John";\nconst userLastName = "Doe";',
    description: "Convert snake_case variables to camelCase",
    perfectScore: 12,
  },
] as const satisfies Level[];

export const getLevel = (id: number) => {
  return LEVELS.find((level) => level.id === id);
};
