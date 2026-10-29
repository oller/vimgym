import { spawnSync } from "node:child_process";

const { status } = spawnSync("git", ["grep", "-n", "--untracked", "\u2014"], {
  stdio: "inherit",
});
process.exit(status === 0 ? 1 : 0); // grep status 0 means matches were found
