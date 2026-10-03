#!/usr/bin/env node

/**
 * Parses Stryker mutation testing report JSON and posts/updates a sticky comment on the PR.
 *
 * Usage:
 *   node .github/scripts/post-mutation-pr-comment.mjs [--dry-run]
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPORT_PATH =
  process.env.MUTATION_REPORT_PATH ||
  "packages/vimsplain/reports/mutation/mutation.json";
const BASELINE_PATH =
  process.env.BASELINE_REPORT_PATH ||
  "packages/vimsplain/reports/mutation/baseline.json";
const PR_NUMBER = process.env.PR_NUMBER;
const COMMIT_SHA = process.env.COMMIT_SHA || process.env.GITHUB_SHA || "";
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || "oller/vimgym";
const IS_DRY_RUN = process.argv.includes("--dry-run");

const COMMENT_MARKER = "<!-- stryker-mutation-report-vimsplain -->";

function calculateFileStats(mutants) {
  let killed = 0;
  let survived = 0;
  let timeout = 0;
  let noCoverage = 0;
  let compileError = 0;
  let ignored = 0;

  for (const m of mutants) {
    switch (m.status) {
      case "Killed":
        killed++;
        break;
      case "Survived":
        survived++;
        break;
      case "Timeout":
        timeout++;
        break;
      case "NoCoverage":
        noCoverage++;
        break;
      case "CompileError":
        compileError++;
        break;
      case "Ignored":
        ignored++;
        break;
    }
  }

  const detected = killed + timeout + survived + noCoverage;
  const score = detected === 0 ? 100 : ((killed + timeout) / detected) * 100;

  return {
    killed,
    survived,
    timeout,
    noCoverage,
    compileError,
    ignored,
    detected,
    total: mutants.length,
    score,
  };
}

function formatDelta(current, baseline, isPercent = false) {
  if (baseline === undefined || baseline === null) {
    return "—";
  }
  const diff = current - baseline;
  if (Math.abs(diff) < 0.005) {
    return isPercent ? "0.00%" : "0";
  }
  if (isPercent) {
    if (diff > 0) {
      return `+${diff.toFixed(2)}% ⬆️`;
    }
    return `${diff.toFixed(2)}% 🔻`;
  }
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff}`;
}

function getStatusBadge(score, thresholds = { high: 80, low: 60 }) {
  if (score >= (thresholds.high ?? 80)) return "🟢";
  if (score >= (thresholds.low ?? 60)) return "🟡";
  return "🔴";
}

function generateMarkdownReport(reportData, baselineData) {
  const thresholds = reportData.thresholds || {
    high: 80,
    low: 60,
    break: null,
  };

  const fileEntries = [];
  let totalKilled = 0;
  let totalSurvived = 0;
  let totalTimeout = 0;
  let totalNoCoverage = 0;
  let totalCompileError = 0;

  const survivedMutantsList = [];

  for (const [filePath, fileInfo] of Object.entries(reportData.files)) {
    const stats = calculateFileStats(fileInfo.mutants || []);
    totalKilled += stats.killed;
    totalSurvived += stats.survived;
    totalTimeout += stats.timeout;
    totalNoCoverage += stats.noCoverage;
    totalCompileError += stats.compileError;

    let baselineStats = null;
    if (baselineData?.files?.[filePath]) {
      baselineStats = calculateFileStats(
        baselineData.files[filePath].mutants || [],
      );
    }

    fileEntries.push({
      path: filePath,
      stats,
      baselineStats,
    });

    for (const m of fileInfo.mutants || []) {
      if (m.status === "Survived") {
        survivedMutantsList.push({
          file: filePath,
          line: m.location?.start?.line ?? "?",
          mutator: m.mutatorName,
          replacement: m.replacement || m.description || "",
        });
      }
    }
  }

  // Sort files: lowest score first to highlight areas needing attention
  fileEntries.sort((a, b) => a.stats.score - b.stats.score);

  const totalDetected =
    totalKilled + totalTimeout + totalSurvived + totalNoCoverage;
  const overallScore =
    totalDetected === 0
      ? 100
      : ((totalKilled + totalTimeout) / totalDetected) * 100;

  let baselineOverallScore = null;
  if (baselineData?.files) {
    let bKilled = 0;
    let bTimeout = 0;
    let bSurvived = 0;
    let bNoCoverage = 0;
    for (const fileInfo of Object.values(baselineData.files)) {
      const bStats = calculateFileStats(fileInfo.mutants || []);
      bKilled += bStats.killed;
      bTimeout += bStats.timeout;
      bSurvived += bStats.survived;
      bNoCoverage += bStats.noCoverage;
    }
    const bDetected = bKilled + bTimeout + bSurvived + bNoCoverage;
    if (bDetected > 0) {
      baselineOverallScore = ((bKilled + bTimeout) / bDetected) * 100;
    }
  }

  const overallBadge = getStatusBadge(overallScore, thresholds);
  const statusText =
    overallScore >= thresholds.high
      ? `🟢 **Passed** (Score is at or above the high threshold of ${thresholds.high}%)`
      : overallScore >= thresholds.low
        ? `🟡 **Acceptable** (Score is above minimum threshold of ${thresholds.low}%, but below target ${thresholds.high}%)`
        : `🔴 **Warning** (Score is below low threshold of ${thresholds.low}%)`;

  let md = `${COMMENT_MARKER}\n`;
  md += "## 🧬 Stryker Mutation Testing Report: `vimsplain`\n\n";
  md += `### 📊 Overall Mutation Score: **${overallScore.toFixed(2)}%** ${overallBadge}\n`;
  if (baselineOverallScore !== null) {
    const deltaStr = formatDelta(overallScore, baselineOverallScore, true);
    md += `*Δ vs main baseline: **${deltaStr}** (baseline: ${baselineOverallScore.toFixed(2)}%)*\n\n`;
  } else {
    md +=
      "*Baseline from `main`: N/A (first run or baseline not yet cached)*\n\n";
  }
  md += `> ${statusText}\n\n`;

  md +=
    "| File | Score | Δ vs main | Killed | Survived | Timeout | Compile Errors | Status |\n";
  md += "| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n";

  for (const entry of fileEntries) {
    const scoreStr = `${entry.stats.score.toFixed(2)}%`;
    const deltaStr = formatDelta(
      entry.stats.score,
      entry.baselineStats?.score,
      true,
    );
    const badge = getStatusBadge(entry.stats.score, thresholds);
    const cleanPath = `\`${entry.path}\``;
    md += `| ${cleanPath} | ${scoreStr} | ${deltaStr} | ${entry.stats.killed} | ${entry.stats.survived} | ${entry.stats.timeout} | ${entry.stats.compileError} | ${badge} |\n`;
  }

  const totalDeltaStr = formatDelta(overallScore, baselineOverallScore, true);
  md += `| **Total** | **${overallScore.toFixed(2)}%** | **${totalDeltaStr}** | **${totalKilled}** | **${totalSurvived}** | **${totalTimeout}** | **${totalCompileError}** | ${overallBadge} |\n\n`;

  if (survivedMutantsList.length > 0) {
    md += `<details>\n<summary>🔍 <b>View Survived Mutants (${survivedMutantsList.length})</b></summary>\n\n`;
    md += "| File | Line | Mutator | Replacement / Description |\n";
    md += "| :--- | :---: | :--- | :--- |\n";
    for (const s of survivedMutantsList.slice(0, 50)) {
      const rep = (s.replacement || s.description || "")
        .replace(/\|/g, "\\|")
        .replace(/\n/g, " ")
        .slice(0, 80);
      const displayRep = rep ? `\`${rep}\`` : "*(none)*";
      md += `| \`${s.file}\` | ${s.line} | \`${s.mutator}\` | ${displayRep} |\n`;
    }
    if (survivedMutantsList.length > 50) {
      md += `\n*... and ${survivedMutantsList.length - 50} more survived mutants. See full HTML report artifact.*<br />\n`;
    }
    md += "\n</details>\n\n";
  }

  const shortSha = COMMIT_SHA ? `\`${COMMIT_SHA.slice(0, 7)}\`` : "latest";
  md += `---\n*Report generated for commit ${shortSha} on ${new Date().toUTCString()}*\n`;

  return md;
}

function postOrUpdateComment(markdown) {
  if (!PR_NUMBER) {
    console.log("No PR_NUMBER specified; skipping GitHub comment.");
    return;
  }

  console.log(`Checking existing comments on PR #${PR_NUMBER}...`);
  const tmpFile = join(process.cwd(), ".mutation-comment-payload.json");
  try {
    const listCmd = `gh api repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments --paginate`;
    const commentsRaw = execSync(listCmd, { encoding: "utf8" });
    const comments = JSON.parse(commentsRaw);
    const existing = comments.find((c) => c.body?.includes(COMMENT_MARKER));

    writeFileSync(tmpFile, JSON.stringify({ body: markdown }), "utf8");

    if (existing) {
      console.log(`Updating existing comment #${existing.id}...`);
      execSync(
        `gh api repos/${GITHUB_REPOSITORY}/issues/comments/${existing.id} -X PATCH --input "${tmpFile}"`,
        { stdio: "inherit" },
      );
      console.log("✓ Updated mutation testing PR comment.");
    } else {
      console.log("Posting new PR comment...");
      execSync(
        `gh api repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments -X POST --input "${tmpFile}"`,
        { stdio: "inherit" },
      );
      console.log("✓ Created mutation testing PR comment.");
    }
  } catch (err) {
    console.error("Failed to post/update comment via gh CLI:", err.message);
    process.exitCode = 1;
  } finally {
    if (existsSync(tmpFile)) {
      try {
        unlinkSync(tmpFile);
      } catch {
        // ignore cleanup error
      }
    }
  }
}

function main() {
  if (!existsSync(REPORT_PATH)) {
    console.error(
      `Mutation report not found at ${REPORT_PATH}. Run Stryker first.`,
    );
    process.exit(1);
  }

  const reportData = JSON.parse(readFileSync(REPORT_PATH, "utf8"));
  let baselineData = null;
  if (existsSync(BASELINE_PATH)) {
    try {
      baselineData = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
      console.log(`Loaded baseline report from ${BASELINE_PATH}`);
    } catch (e) {
      console.warn(`Could not parse baseline report at ${BASELINE_PATH}:`, e);
    }
  }

  const markdown = generateMarkdownReport(reportData, baselineData);

  if (IS_DRY_RUN) {
    console.log("\n--- Generated PR Comment Markdown ---\n");
    console.log(markdown);
  } else if (PR_NUMBER) {
    postOrUpdateComment(markdown);
  } else {
    console.log("No PR_NUMBER set; printing report summary:\n");
    console.log(markdown);
  }
}

main();
