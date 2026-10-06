#!/usr/bin/env node

/**
 * Parses Stryker mutation testing report JSON and updates (or creates) an evergreen GitHub Issue.
 *
 * Usage:
 *   node .github/scripts/update-mutation-issue.mjs [--dry-run]
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
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || "oller/vimgym";
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID || "";
const GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL || "https://github.com";
const IS_DRY_RUN = process.argv.includes("--dry-run");

const ISSUE_TITLE = "🧬 Stryker Mutation Testing Dashboard: vimsplain";
const ISSUE_LABEL = "mutation-testing";

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
      ? `🟢 **Healthy** (Mutation score is at or above target ${thresholds.high}%)`
      : overallScore >= thresholds.low
        ? `🟡 **Acceptable** (Mutation score is above minimum ${thresholds.low}%, but below target ${thresholds.high}%)`
        : `🔴 **Warning** (Mutation score is below threshold of ${thresholds.low}%)`;

  let md = "<!-- evergreen-mutation-dashboard -->\n";
  md += "# 🧬 Stryker Mutation Testing Dashboard: `vimsplain`\n\n";
  md +=
    "> This is an automated evergreen issue updated weekly by GitHub Actions. It tracks test effectiveness and mutation score deltas over time.\n\n";

  md += `## 📊 Overall Score: **${overallScore.toFixed(2)}%** ${overallBadge}\n\n`;

  if (baselineOverallScore !== null) {
    const deltaStr = formatDelta(overallScore, baselineOverallScore, true);
    md += `*Δ vs previous run: **${deltaStr}** (previous: ${baselineOverallScore.toFixed(2)}%)*\n\n`;
  } else {
    md +=
      "*Δ vs previous run: N/A (initial run or baseline not yet cached)*\n\n";
  }

  md += `> ${statusText}\n\n`;

  md += "### File Breakdown\n\n";
  md +=
    "| File | Score | Δ vs prev | Killed | Survived | Timeout | Compile Errors | Status |\n";
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

  md += "---\n";
  if (GITHUB_RUN_ID) {
    const runUrl = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
    md += `*🔗 [View latest workflow run & download full HTML report artifact](${runUrl})*<br />\n`;
  }
  md += `*Last updated on ${new Date().toUTCString()}*\n`;

  return md;
}

function updateOrCreateIssue(markdown) {
  const tmpFile = join(process.cwd(), ".mutation-issue-body.md").replace(
    /\\/g,
    "/",
  );
  writeFileSync(tmpFile, markdown, "utf8");

  try {
    console.log(`Checking for existing issue with label '${ISSUE_LABEL}'...`);
    const listCmd = `gh issue list --repo "${GITHUB_REPOSITORY}" --label "${ISSUE_LABEL}" --state all --json number,state,title --limit 1`;
    const issuesRaw = execSync(listCmd, { encoding: "utf8" });
    const issues = JSON.parse(issuesRaw);

    if (issues.length > 0) {
      const issue = issues[0];
      console.log(
        `Found existing evergreen issue #${issue.number}. Updating...`,
      );

      if (issue.state === "CLOSED") {
        console.log(`Reopening closed issue #${issue.number}...`);
        execSync(
          `gh issue reopen "${issue.number}" --repo "${GITHUB_REPOSITORY}"`,
          {
            stdio: "inherit",
          },
        );
      }

      execSync(
        `gh issue edit "${issue.number}" --repo "${GITHUB_REPOSITORY}" --body-file "${tmpFile}"`,
        { stdio: "inherit" },
      );
      console.log(`✓ Updated evergreen issue #${issue.number}.`);
    } else {
      console.log(
        `No existing issue found. Ensuring label '${ISSUE_LABEL}' exists...`,
      );
      try {
        execSync(
          `gh label create "${ISSUE_LABEL}" --repo "${GITHUB_REPOSITORY}" --description "Automated mutation testing reports" --color "0E8A16" --force`,
          { stdio: "pipe" },
        );
      } catch {
        // Label might already exist, ignore error
      }

      console.log("Creating evergreen mutation testing issue...");
      execSync(
        `gh issue create --repo "${GITHUB_REPOSITORY}" --title "${ISSUE_TITLE}" --label "${ISSUE_LABEL}" --body-file "${tmpFile}"`,
        { stdio: "inherit" },
      );
      console.log("✓ Created evergreen issue.");
    }
  } catch (err) {
    console.error("Failed to update/create issue via gh CLI:", err.message);
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
    console.warn(
      `Mutation report not found at ${REPORT_PATH}. Skipping issue update.`,
    );
    return;
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
    console.log("\n--- Generated Evergreen Issue Markdown ---\n");
    console.log(markdown);
  } else {
    updateOrCreateIssue(markdown);
  }
}

main();
