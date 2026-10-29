import { execSync } from "node:child_process";

try {
  // \u2014 is the unicode em dash character
  const emDashChar = "\u2014";
  const result = execSync(
    `git grep --untracked -n "${emDashChar}" -- ":!scripts/check-no-em-dashes.mjs"`,
    {
      encoding: "utf8",
    },
  );
  if (result.trim()) {
    console.error("Error: Em dash (\u2014) found in repository:");
    console.error(result);
    console.error(
      "Please replace all em dashes with hyphens (-) or colons (:).",
    );
    process.exit(1);
  }
} catch (error) {
  // git grep exits with 1 when no matches are found
  if (error.status === 1) {
    process.exit(0);
  }
  console.error("Error running em dash check:", error.message);
  process.exit(error.status || 1);
}
