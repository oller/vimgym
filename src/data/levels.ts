export type Level = {
  id: number;
  name: string;
  startText: string;
  targetText: string;
  description: string;
};

export const LEVELS = [
  {
    id: 1,
    name: "Delete Words",
    startText: "The quick brown fox jumps over the lazy dog.",
    targetText: "The quick brown fox jumps.",
    description: "Delete 'over the lazy dog' from the sentence",
  },
  {
    id: 2,
    name: "Flip Ternary",
    startText: "const activity = isSunny ? 'xbox' : 'golf'",
    targetText: "const activity = isSunny ? 'golf' : 'xbox'",
    description: "Swap 'golf' and 'xbox' in the ternary",
  },
  {
    id: 3,
    name: "Remove the hiccups!",
    startText: "The 2nd best time to hiccup plant a tree hiccup is now hiccup.",
    targetText: "The 2nd best time to plant a tree is now.",
    description: "The hiccups are annoying, remove them all",
  },
  {
    id: 4,
    name: "Extract Domain",
    startText: "Visit us at https://www.example.com/about for more info.",
    targetText: "Visit us at example.com for more info.",
    description: "Extract the domain from the URL",
  },
  {
    id: 5,
    name: "Quote Wrapping",
    startText: 'const greeting = "Hello World"; const name = "John";',
    targetText: 'const greeting = "Hi"; const name = "Jane";',
    description: "Change text inside quotes using text objects",
  },
  {
    id: 6,
    name: "Function Parameters",
    startText: "function greet(name, age, city) { return name; }",
    targetText: "function greet(x, y, z) { return x; }",
    description: "Change function parameters using parenthesis text objects",
  },
  {
    id: 7,
    name: "Tag Switcheroo",
    startText: "<div>Hello</div>",
    targetText: "<article>Hello</article>",
    description:
      "Change the wrapping tag (note codemirror doesn't support all text objects 😢)",
  },
  {
    id: 8,
    name: "Argument Swap",
    startText: 'display(data, "Result")',
    targetText: 'display("Result", data)',
    description: "Swap the function arguments",
  },
  {
    id: 9,
    name: "Typos Galore",
    startText: "const valeu = 1;",
    targetText: "const value = 1;",
    description: "Fix the typo using 'xp' (transpose)",
  },
  {
    id: 10,
    name: "Snake to Kebab",
    startText: 'class="menu_item_active"',
    targetText: 'class="menu-item-active"',
    description: "Convert snake_case to kebab-case using find and repeat",
  },
  {
    id: 11,
    name: "Unwrap Block",
    startText: "if (isValid) { save(); }",
    targetText: "save();",
    description: "Remove the if statement wrapper",
  },
  {
    id: 12,
    name: "Semicolon Appender",
    startText: "const a = 1\nconst b = 2\nconst c = 3",
    targetText: "const a = 1;\nconst b = 2;\nconst c = 3;",
    description: "Append semicolons to end of lines",
  },
  {
    id: 13,
    name: "Markdown Header",
    startText: "Title\nSubtitle\nSection",
    targetText: "## Title\n## Subtitle\n## Section",
    description: "Add markdown headers to lines",
  },
  {
    id: 14,
    name: "Object Property",
    startText: 'const color = "red"',
    targetText: 'const color = { value: "red" }',
    description: "Wrap the value in an object",
  },
  {
    id: 15,
    name: "Inner HTML Clear",
    startText: '<div id="app"><span>Loading...</span></div>',
    targetText: '<div id="app"></div>',
    description: "Clear the inner HTML of the div",
  },
  {
    id: 16,
    name: "Clean Up List",
    startText: "- Apples\n- Bananas\n- Oranges\n- Grapes\n- Mangoes",
    targetText: "Apples, Bananas, Oranges, Grapes, Mangoes",
    description: "Convert the list into a comma-separated line",
  },
  {
    id: 17,
    name: "Comment Block",
    startText: "const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;",
    targetText:
      "// const a = 1;\n// const b = 2;\n// const c = 3;\n// const d = 4;",
    description: "Comment out all lines using Visual Block mode",
  },
  {
    id: 18,
    name: "JSONify",
    startText: "name: John\nage: 30\ncity: New York",
    targetText: '"name": "John",\n"age": "30",\n"city": "New York",',
    description: "Convert yaml-like key-values to JSON format",
  },
  {
    id: 19,
    name: "Snake to Camel",
    startText: 'const user_first_name = "John";\nconst user_last_name = "Doe";',
    targetText: 'const userFirstName = "John";\nconst userLastName = "Doe";',
    description: "Convert snake_case variables to camelCase",
  },
] as const satisfies Level[];

export const getLevel = (id: number) => {
  return LEVELS.find((level) => level.id === id);
};
