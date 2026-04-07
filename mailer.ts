/**
 * Email delivery for the Dorian LPG Market Briefing.
 *
 * Configure via environment variables (see .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *   EMAIL_FROM, EMAIL_TO  (comma-separated for multiple recipients)
 */
import nodemailer from "nodemailer";
import type { MarketReport } from "./news-agent";

function getEnv(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (val === undefined) {
    throw new Error(
      `Missing required env var: ${key}\nSet it in your shell or in a .env file loaded before running.`
    );
  }
  return val;
}

function buildTransport(): nodemailer.Transporter {
  const host = getEnv("SMTP_HOST");
  const port = parseInt(getEnv("SMTP_PORT", "587"), 10);
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendReport(report: MarketReport): Promise<void> {
  const from = getEnv("EMAIL_FROM");
  const toRaw = getEnv("EMAIL_TO");
  const to = toRaw
    .split(",")
    .map((s) => s.trim())
    .join(", ");

  const subject = formatSubject(report);
  const transport = buildTransport();

  await transport.sendMail({
    from,
    to,
    subject,
    text: report.plainText,
    html: report.html,
  });

  console.log(`  [email] Sent to ${to}`);
}

function formatSubject(report: MarketReport): string {
  const time = report.timestamp.toLocaleString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  // Try to extract a direction signal from the plain text for the subject line
  const text = report.plainText.toLowerCase();
  let signal = "";
  if (text.includes("↑") || text.includes("rising") || text.includes("higher")) {
    signal = " 📈";
  } else if (text.includes("↓") || text.includes("falling") || text.includes("lower")) {
    signal = " 📉";
  }

  return `Dorian LPG Briefing${signal} — ${time}`;
}
