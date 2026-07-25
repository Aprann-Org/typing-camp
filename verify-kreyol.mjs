import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const shotsDir = "/private/tmp/claude-501/-Users-user-Dev-Kod-ak-Kreyson-Typing/d83b923f-af06-453d-ad71-2f2dd0b3a6fb/scratchpad/shots";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

await page.goto(BASE, { waitUntil: "load" });
await page.fill("#firstName", "Vince");
await page.click("text=Start typing");
await page.waitForTimeout(300);
await page.click("text=Start typing");
await page.waitForTimeout(400);
await page.click("text=I'm ready");
await page.waitForTimeout(400);

await page.click('button[aria-label="Teacher controls"]');
await page.waitForTimeout(200);

async function stageTitle() {
  return page.locator("h2").first().textContent().catch(() => null);
}

console.log("Stage after Ready:", await stageTitle());
await page.click("text=Skip stage");
await page.waitForTimeout(300);
console.log("Stage after skip 1:", await stageTitle());
await page.click("text=Skip stage");
await page.waitForTimeout(300);
console.log("Stage after skip 2:", await stageTitle());
await page.click("text=Skip stage");
await page.waitForTimeout(300);
console.log("Stage after skip 3 (should be Game):", await stageTitle());
await page.screenshot({ path: `${shotsDir}/stage-after-skip3.png` });

await browser.close();
