/**
 * Dorian LPG Market Intelligence — Hourly Scheduler
 *
 * Runs the news agent on a configurable cron schedule and delivers
 * the briefing by email. Defaults to every hour on the hour.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... \
 *   SMTP_HOST=smtp.gmail.com \
 *   SMTP_PORT=587 \
 *   SMTP_USER=you@domain.com \
 *   SMTP_PASS=your-app-password \
 *   EMAIL_FROM="Dorian LPG Intelligence <you@domain.com>" \
 *   EMAIL_TO=recipient@domain.com \
 *   npm run scheduler
 *
 * Optional env vars:
 *   CRON_SCHEDULE   — cron expression (default: "0 * * * *" = every hour)
 *   RUN_ON_START    — "true" to fire immediately on startup (default: true)
 *   EMAIL_ENABLED   — "false" to print to console only (default: true)
 */
import cron from "node-cron";
import { runNewsAgent } from "./news-agent";
import { sendReport } from "./mailer";

// ── Config ─────────────────────────────────────────────────────────────────
const CRON_SCHEDULE = process.env.CRON_SCHEDULE ?? "0 * * * *"; // every hour
const RUN_ON_START = process.env.RUN_ON_START !== "false";
const EMAIL_ENABLED = process.env.EMAIL_ENABLED !== "false";

// ── Core job ───────────────────────────────────────────────────────────────
async function runJob(): Promise<void> {
  const start = new Date();
  console.log(`\n${"─".repeat(60)}`);
  console.log(`[${start.toUTCString()}] Starting market intelligence run…`);

  try {
    console.log("  Gathering intelligence from Bloomberg, Yahoo Finance, NY Times, TradeWinds…");
    const report = await runNewsAgent();

    if (EMAIL_ENABLED) {
      await sendReport(report);
      console.log("  Briefing delivered via email.");
    } else {
      // Print to console when email is disabled
      console.log("\n" + "─".repeat(60));
      console.log(report.plainText);
    }

    const elapsed = ((Date.now() - start.getTime()) / 1000).toFixed(1);
    console.log(`  Done in ${elapsed}s. Next run: ${nextRunTime()}`);
  } catch (err) {
    console.error("  ERROR during market intelligence run:", err);
    // Don't rethrow — let the scheduler keep running
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function nextRunTime(): string {
  // Simple: parse the cron schedule to show a human-readable next trigger
  // For "0 * * * *" just show "top of next hour"
  if (CRON_SCHEDULE === "0 * * * *") {
    const next = new Date();
    next.setUTCMinutes(0, 0, 0);
    next.setUTCHours(next.getUTCHours() + 1);
    return next.toUTCString();
  }
  return `per schedule "${CRON_SCHEDULE}"`;
}

function validateConfig(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  if (EMAIL_ENABLED) {
    const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM", "EMAIL_TO"];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(
        `Missing email config env vars: ${missing.join(", ")}\n` +
        `Set EMAIL_ENABLED=false to run without email.`
      );
    }
  }
  if (!cron.validate(CRON_SCHEDULE)) {
    throw new Error(`Invalid CRON_SCHEDULE: "${CRON_SCHEDULE}"`);
  }
}

// ── Entry point ─────────────────────────────────────────────────────────────
(async () => {
  console.log("Dorian LPG Market Intelligence Scheduler");
  console.log("=".repeat(60));

  try {
    validateConfig();
  } catch (err) {
    console.error("Configuration error:", (err as Error).message);
    process.exit(1);
  }

  console.log(`Schedule:      ${CRON_SCHEDULE} (${describeSchedule(CRON_SCHEDULE)})`);
  console.log(`Email:         ${EMAIL_ENABLED ? process.env.EMAIL_TO : "disabled (console only)"}`);
  console.log(`Run on start:  ${RUN_ON_START}`);
  console.log("=".repeat(60));

  if (RUN_ON_START) {
    await runJob();
  }

  cron.schedule(CRON_SCHEDULE, runJob, { timezone: "UTC" });
  console.log(`\nScheduler running. Press Ctrl+C to stop.`);
})();

function describeSchedule(expr: string): string {
  const presets: Record<string, string> = {
    "0 * * * *":   "every hour on the hour",
    "*/30 * * * *": "every 30 minutes",
    "*/15 * * * *": "every 15 minutes",
    "0 6,12,18 * * *": "6am, noon, 6pm UTC",
    "0 8 * * 1-5": "8am UTC weekdays",
  };
  return presets[expr] ?? expr;
}
