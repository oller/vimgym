import { expect, test } from "@playwright/test";

test("production smoke: solve level 1, advance to level 2, zero runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  // Block third-party analytics script from throwing on non-production preview domains
  await page.route("**/*vexo.co/**", (route) => route.abort());

  await page.goto("/");

  const editor = page.getByRole("textbox");
  await expect(editor).toBeVisible();
  await editor.click();

  await page.keyboard.type("fsldt.");

  await expect(
    page.getByRole("heading", { name: "Level Complete" }),
  ).toBeVisible();
  await expect(page.getByLabel("keystrokes")).toContainText("6");

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/levelId=typos-galore/);

  expect(errors).toEqual([]);
});
