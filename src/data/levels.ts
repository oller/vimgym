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
    perfectScore: 6, // fsldt.
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
  {
    id: 9,
    name: "Quote Wrapping",
    startText: 'const greeting = "Hello World"; const name = "John";',
    targetText: 'const greeting = "Hi"; const name = "Jane";',
    description: "Change text inside quotes using text objects",
    perfectScore: 12,
  },
  {
    id: 10,
    name: "Function Parameters",
    startText: "function greet(name, age, city) { return name; }",
    targetText: "function greet(x, y, z) { return x; }",
    description: "Change function parameters using parenthesis text objects",
    perfectScore: 12,
  },
  {
    id: 11,
    name: "Tag Switcheroo",
    startText: "<div>Hello</div>",
    targetText: "<article>Hello</article>",
    description:
      "Change the wrapping tag (note codemirror doesn't support all text objects 😢)",
    perfectScore: 11, // citarticleEsc // UNSURE - cit should change inside tags not surrounding
  },
  {
    id: 12,
    name: "Argument Swap",
    startText: 'display(data, "Result")',
    targetText: 'display("Result", data)',
    description: "Swap the function arguments",
    perfectScore: 12, // fddt,2xea, Escp // UNSURE
  },
  {
    id: 13,
    name: "Typos Galore",
    startText: "const valeu = 1;",
    targetText: "const value = 1;",
    description: "Fix the typo using 'xp' (transpose)",
    perfectScore: 4, // fexp
  },
  {
    id: 14,
    name: "Snake to Kebab",
    startText: 'class="menu_item_active"',
    targetText: 'class="menu-item-active"',
    description: "Convert snake_case to kebab-case using find and repeat",
    perfectScore: 6, // f_r-;.
  },
  {
    id: 15,
    name: "Unwrap Block",
    startText: "if (isValid) { save(); }",
    targetText: "save();",
    description: "Remove the if statement wrapper",
    perfectScore: 5, // di{Vp
  },
  {
    id: 16,
    name: "Semicolon Appender",
    startText: "const a = 1\nconst b = 2\nconst c = 3",
    targetText: "const a = 1;\nconst b = 2;\nconst c = 3;",
    description: "Append semicolons to end of lines",
    perfectScore: 7, // A;Escj.j.
  },
  {
    id: 17,
    name: "Markdown Header",
    startText: "Title\nSubtitle\nSection",
    targetText: "## Title\n## Subtitle\n## Section",
    description: "Add markdown headers to lines",
    perfectScore: 9, // I## Escj.j.
  },
  {
    id: 18,
    name: "Object Property",
    startText: 'const color = "red"',
    targetText: 'const color = { value: "red" }',
    description: "Wrap the value in an object",
    perfectScore: 16, // f"i{ value: Escea }Esc
  },
  {
    id: 19,
    name: "Inner HTML Clear",
    startText: '<div id="app"><span>Loading...</span></div>',
    targetText: '<div id="app"></div>',
    description: "Clear the inner HTML of the div",
    perfectScore: 3, // dit
  },
] as const satisfies Level[];

export const getLevel = (id: number) => {
  return LEVELS.find((level) => level.id === id);
};
