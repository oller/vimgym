export type Level = {
  id: string;
  name: string;
  startText: string;
  targetText: string;
  description: string;
  language: "html" | "javascript" | "markdown" | "json";
};

export const LEVELS = [
  {
    id: "delete-words",
    name: "Delete Words",
    startText: "The quick brown fox jumps over the lazy dog.",
    targetText: "The quick brown fox jumps.",
    description: "Delete 'over the lazy dog' from the sentence",
    language: "markdown",
  },
  {
    id: "flip-ternary",
    name: "Flip Ternary",
    startText: "const activity = isSunny ? 'xbox' : 'golf'",
    targetText: "const activity = isSunny ? 'golf' : 'xbox'",
    description: "Swap 'golf' and 'xbox' in the ternary",
    language: "javascript",
  },
  {
    id: "remove-hiccups",
    name: "Remove the hiccups!",
    startText: "The 2nd best time to hiccup plant a tree hiccup is now hiccup.",
    targetText: "The 2nd best time to plant a tree is now.",
    description: "The hiccups are annoying, remove them all",
    language: "markdown",
  },
  {
    id: "extract-domain",
    name: "Extract Domain",
    startText: "Visit us at https://www.example.com/about for more info.",
    targetText: "Visit us at example.com for more info.",
    description: "Extract the domain from the URL",
    language: "markdown",
  },
  {
    id: "quote-wrapping",
    name: "Quote Wrapping",
    startText: 'const greeting = "Hello World"; const name = "John";',
    targetText: 'const greeting = "Hi"; const name = "Jane";',
    description: "Change text inside quotes using text objects",
    language: "javascript",
  },
  {
    id: "function-parameters",
    name: "Function Parameters",
    startText: "function greet(name, age, city) { return name; }",
    targetText: "function greet(x, y, z) { return x; }",
    description: "Change function parameters using parenthesis text objects",
    language: "javascript",
  },
  {
    id: "tag-switcheroo",
    name: "Tag Switcheroo",
    startText: "<div>Hello</div>",
    targetText: "<article>Hello</article>",
    description: "Change the wrapping tag.",
    language: "html",
  },
  {
    id: "argument-swap",
    name: "Argument Swap",
    startText: 'display(data, "Result")',
    targetText: 'display("Result", data)',
    description: "Swap the function arguments",
    language: "javascript",
  },
  {
    id: "typos-galore",
    name: "Typos Galore",
    startText: "const valeu = 1;",
    targetText: "const value = 1;",
    description: "Fix the typo using 'xp' (transpose)",
    language: "javascript",
  },
  {
    id: "snake-to-kebab",
    name: "Snake to Kebab",
    startText: 'class="menu_item_active"',
    targetText: 'class="menu-item-active"',
    description: "Convert snake_case to kebab-case using find and repeat",
    language: "html",
  },
  {
    id: "unwrap-block",
    name: "Unwrap Block",
    startText: "if (isValid) { save(); }",
    targetText: "save();",
    description: "Remove the if statement wrapper",
    language: "javascript",
  },
  {
    id: "semicolon-appender",
    name: "Semicolon Appender",
    startText: "const a = 1\nconst b = 2\nconst c = 3",
    targetText: "const a = 1;\nconst b = 2;\nconst c = 3;",
    description: "Append semicolons to end of lines",
    language: "javascript",
  },
  {
    id: "markdown-header",
    name: "Markdown Header",
    startText: "Title\nSubtitle\nSection",
    targetText: "## Title\n## Subtitle\n## Section",
    description: "Add markdown headers to lines",
    language: "markdown",
  },
  {
    id: "object-property",
    name: "Object Property",
    startText: 'const color = "red"',
    targetText: 'const color = { value: "red" }',
    description: "Wrap the value in an object",
    language: "javascript",
  },
  {
    id: "inner-html-clear",
    name: "Inner HTML Clear",
    startText: '<div id="app"><span>Loading...</span></div>',
    targetText: '<div id="app"></div>',
    description: "Clear the inner HTML of the div",
    language: "html",
  },
  {
    id: "clean-up-list",
    name: "Clean Up List",
    startText: "- Apples\n- Bananas\n- Oranges\n- Grapes\n- Mangoes",
    targetText: "Apples, Bananas, Oranges, Grapes, Mangoes",
    description: "Convert the list into a comma-separated line",
    language: "markdown",
  },
  {
    id: "comment-block",
    name: "Comment Block",
    startText: "const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;",
    targetText:
      "// const a = 1;\n// const b = 2;\n// const c = 3;\n// const d = 4;",
    description: "Comment out all lines using Visual Block mode",
    language: "javascript",
  },
  {
    id: "jsonify",
    name: "JSONify",
    startText: "name: John\nage: 30\ncity: New York",
    targetText: '"name": "John",\n"age": "30",\n"city": "New York",',
    description: "Convert yaml-like key-values to JSON format",
    language: "json",
  },
  {
    id: "snake-to-camel",
    name: "Snake to Camel",
    startText: 'const user_first_name = "John";\nconst user_last_name = "Doe";',
    targetText: 'const userFirstName = "John";\nconst userLastName = "Doe";',
    description: "Convert snake_case variables to camelCase",
    language: "javascript",
  },
] as const satisfies Level[];

export const getLevel = (id: string): Level | undefined => {
  return LEVELS.find((level) => level.id === id);
};
