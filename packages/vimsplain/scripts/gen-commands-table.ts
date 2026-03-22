/**
 * Generates a markdown table of all supported vimsplain commands.
 * Reads NORMAL_COMMANDS from vimsplain.ts and writes to README.md.
 *
 * Run: pnpm gen:commands
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Read the normal handler source
const src = readFileSync(
  join(import.meta.dirname, "../src/handlers/normal.ts"),
  "utf8",
);

// Parse NORMAL_COMMANDS block
const normalCommandsMatch = src.match(
  /const NORMAL_COMMANDS[^=]*=\s*\[[\s\S]*?\];/,
);

if (!normalCommandsMatch) {
  console.error("Could not find NORMAL_COMMANDS in vimsplain.ts");
  process.exit(1);
}

const block = normalCommandsMatch[0];

// Extract each entry's pattern and description together
const entries: Array<{ keystroke: string; description: string }> = [];
const entriesRaw = [
  ...block.matchAll(
    /\{[^}]*pattern:\s*\/\^?([^/]+)\/[^}]*description:\s*(["'])(.*?)\2/gs,
  ),
];

for (const match of entriesRaw) {
  const rawPattern = match[1];
  const description = match[3];

  // Clean up the pattern for display
  let keystroke = rawPattern
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]")
    .replace(/\\\{/g, "{")
    .replace(/\\\}/g, "}")
    .replace(/\\\$/g, "$")
    .replace(/\\\^/g, "^")
    .replace(/\\\\/, "\\")
    .replace(/\(\?:.*?\)/g, "") // remove non-capture groups
    .replace(/\(\\d\*\)/g, "N") // (\d*) -> N
    .replace(/\(\\d\+\)/g, "N") // (\d+) -> N
    .replace(/\(\\.?\)/g, "X") // (.) -> X for char captures
    .replace(/\[a-z\]/g, "a") // [a-z] -> a
    .trim();

  // If cleanup emptied the pattern (e.g. space motion `/ /`), use raw pattern
  if (!keystroke) {
    keystroke = rawPattern;
  }

  entries.push({ keystroke, description });
}

// Build markdown table
const header = "| Keystroke | Description |\n|-----------|-------------|\n";
const body = entries
  .map((e) => `| \`${e.keystroke}\` | ${e.description} |`)
  .join("\n");

const table = header + body;

// Read the visual handler source
const visualSrc = readFileSync(
  join(import.meta.dirname, "../src/handlers/visual.ts"),
  "utf8",
);

const visualEntries: Array<{ keystroke: string; description: string }> = [];

// Parse VISUAL_OPERATORS block
const visualOpMatch = visualSrc.match(
  /export const VISUAL_OPERATORS: Record<string, string> = \{([^}]+)\};/,
);
if (visualOpMatch) {
  const block = visualOpMatch[1];
  const entriesRaw = [
    ...block.matchAll(/(["'])?([^"':\s]+)\1?:\s*(["'])(.+?)\3,/g),
  ];
  for (const match of entriesRaw) {
    visualEntries.push({ keystroke: match[2], description: match[4] });
  }
}

// Parse VISUAL_G_OPERATORS block
const visualGOpMatch = visualSrc.match(
  /export const VISUAL_G_OPERATORS: Record<string, string> = \{([^}]+)\};/,
);
if (visualGOpMatch) {
  const block = visualGOpMatch[1];
  const entriesRaw = [
    ...block.matchAll(/(["'])?([^"':\s]+)\1?:\s*(["'])(.+?)\3,/g),
  ];
  for (const match of entriesRaw) {
    visualEntries.push({ keystroke: `g${match[2]}`, description: match[4] });
  }
}

const visualBody = visualEntries
  .map((e) => `| \`${e.keystroke}\` | ${e.description} |`)
  .join("\n");

const visualTable = header + visualBody;

// Inject into README between markers
const readmePath = join(import.meta.dirname, "../README.md");
const readme = readFileSync(readmePath, "utf8");
// Use a function replacement to avoid special `$` replacement patterns in the table content
let updated = readme.replace(
  /<!-- COMMANDS_TABLE_START -->[\s\S]*?<!-- COMMANDS_TABLE_END -->/,
  () =>
    `<!-- COMMANDS_TABLE_START -->\n\n${table}\n\n<!-- COMMANDS_TABLE_END -->`,
);

updated = updated.replace(
  /<!-- VISUAL_COMMANDS_TABLE_START -->[\s\S]*?<!-- VISUAL_COMMANDS_TABLE_END -->/,
  () =>
    `<!-- VISUAL_COMMANDS_TABLE_START -->\n\n${visualTable}\n\n<!-- VISUAL_COMMANDS_TABLE_END -->`,
);

// Check that markers exist at all
if (!/<!-- COMMANDS_TABLE_START -->/.test(readme)) {
  console.error(
    "Could not find COMMANDS_TABLE markers in README.md. Make sure the markers are present.",
  );
  process.exit(1);
}

if (!/<!-- VISUAL_COMMANDS_TABLE_START -->/.test(readme)) {
  console.error(
    "Could not find VISUAL_COMMANDS_TABLE markers in README.md. Make sure the markers are present.",
  );
  process.exit(1);
}

writeFileSync(readmePath, updated);
console.log(
  `✓ Updated README.md with ${entries.length} normal commands and ${visualEntries.length} visual commands.`,
);
