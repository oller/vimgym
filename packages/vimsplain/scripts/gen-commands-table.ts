/**
 * Generates a markdown table of all supported vimsplain commands.
 * Reads NORMAL_COMMANDS from vimsplain.ts and writes to README.md.
 *
 * Run: pnpm gen:commands
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Read the vimsplain source
const src = readFileSync(
  join(import.meta.dirname, "../src/vimsplain.ts"),
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
    /\{[^}]*pattern:\s*\/\^?([^/]+)\/[^}]*description:\s*"([^"]+)"/gs,
  ),
];

for (const match of entriesRaw) {
  const rawPattern = match[1];
  const description = match[2];

  // Clean up the pattern for display
  const keystroke = rawPattern
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
    .replace(/\(\\d\*\)/g, "N") // (\\d*) -> N
    .replace(/\(\\d\+\)/g, "N") // (\\d+) -> N
    .replace(/\(\\.?\)/g, "X") // (.) -> X for char captures
    .replace(/\[a-z\]/g, "a") // [a-z] -> a
    .trim();

  entries.push({ keystroke, description });
}

// Build markdown table
const header = "| Keystroke | Description |\n|-----------|-------------|\n";
const body = entries
  .map((e) => `| \`${e.keystroke}\` | ${e.description} |`)
  .join("\n");

const table = header + body;

// Inject into README between markers
const readmePath = join(import.meta.dirname, "../README.md");
const readme = readFileSync(readmePath, "utf8");
// Use a function replacement to avoid special `$` replacement patterns in the table content
const updated = readme.replace(
  /<!-- COMMANDS_TABLE_START -->[\s\S]*?<!-- COMMANDS_TABLE_END -->/,
  () =>
    `<!-- COMMANDS_TABLE_START -->\n\n${table}\n\n<!-- COMMANDS_TABLE_END -->`,
);

if (updated === readme) {
  console.error(
    "Could not find COMMANDS_TABLE markers in README.md. Make sure the markers are present.",
  );
  process.exit(1);
}

writeFileSync(readmePath, updated);
console.log(`✓ Updated README.md with ${entries.length} commands.`);
