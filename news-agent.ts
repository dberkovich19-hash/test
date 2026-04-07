/**
 * Oil & LPG Market News Agent — Dorian LPG Edition
 *
 * Fetches intelligence from Bloomberg, Yahoo Finance, NY Times, and TradeWinds,
 * then compiles a structured briefing tailored to VLGC operators.
 *
 * Returns both plain-text and HTML versions of the report.
 */
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const client = new Anthropic();

const NEWS_SOURCES = [
  {
    name: "Bloomberg Energy",
    url: "https://www.bloomberg.com/energy",
    searchQuery: "site:bloomberg.com LPG propane butane VLGC freight crude oil",
  },
  {
    name: "Yahoo Finance - Energy",
    url: "https://finance.yahoo.com/topic/energy/",
    searchQuery:
      "site:finance.yahoo.com LPG propane crude oil energy Permian NGL",
  },
  {
    name: "New York Times - Energy",
    url: "https://www.nytimes.com/section/business/energy-environment",
    searchQuery: "site:nytimes.com oil LPG energy production OPEC",
  },
  {
    name: "TradeWinds - LPG Shipping",
    url: "https://www.tradewindsnews.com/lpg",
    searchQuery:
      "site:tradewindsnews.com VLGC LPG tanker freight rates Dorian",
  },
];

const SYSTEM_PROMPT = `You are a senior energy market analyst embedded at Dorian LPG, one of the world's largest
operators of Very Large Gas Carriers (VLGCs). Your briefings directly inform freight, trading,
and hedging decisions.

Dorian LPG's business is driven by:
- VLGC spot and time-charter freight rates (Baltic LPG Index, Ras Tanura–Chiba route)
- US LPG export volumes from Gulf Coast terminals (Enterprise, Energy Transfer, Targa)
- Permian Basin NGL/LPG production and fractionation capacity
- Propane/butane prices (Mont Belvieu, Far East Index)
- Middle East LPG supply (Saudi Aramco CP, ADNOC)
- Asian demand — China PDH plants, India, Japan, South Korea
- Panama Canal transits and congestion
- OPEC+ crude cuts (affect associated gas / NGL output)
- Crude oil spreads (WTI, Brent) as directional indicators

Fetch and analyze content from:
- Bloomberg (bloomberg.com)
- Yahoo Finance (finance.yahoo.com)
- New York Times (nytimes.com)
- TradeWinds (tradewindsnews.com)

Produce a concise, high-signal briefing structured EXACTLY as follows — no filler, numbers where available:

---
## DORIAN LPG MARKET BRIEFING
### [Date] | [Time] UTC

**EXECUTIVE SUMMARY**
3–5 bullet points of the most actionable developments for a VLGC operator.

**PRICES AT A GLANCE**
| Indicator | Current | Change | Direction |
|-----------|---------|--------|-----------|
| WTI Crude | $X/bbl | +/-X% | ↑/↓/→ |
| Brent Crude | $X/bbl | +/-X% | ↑/↓/→ |
| Mont Belvieu Propane | $X/gal | +/-X% | ↑/↓/→ |
| Mont Belvieu Butane | $X/gal | +/-X% | ↑/↓/→ |
| Saudi CP Propane | $X/MT | +/-X% | ↑/↓/→ |
| VLGC Spot Rate (est.) | $X/day | +/-X% | ↑/↓/→ |

(Fill in "N/A" for any price you cannot confirm from the sources)

**SUPPLY — PERMIAN & US EXPORTS**
Key developments in Permian NGL production, fractionation, and Gulf Coast LPG export terminals.

**DEMAND — ASIA & KEY IMPORTERS**
China PDH margins, India buying activity, Japan/Korea term vs spot activity.

**FREIGHT & SHIPPING**
VLGC rate movements, vessel utilization, Panama Canal status, notable fixtures.

**OPEC+ & GEOPOLITICS**
Production decisions, sanctions, and macro factors affecting LPG supply chains.

**OUTLOOK — NEXT 24–48 HRS**
What to watch: upcoming data releases (EIA storage, ADP, etc.), scheduled OPEC meetings,
weather events, or known vessel arrivals affecting the market.

**SOURCES**
Bullet list: each fact attributed to outlet + article headline/URL.
---

Be direct. If a metric moved significantly, say so plainly. If data is unavailable from these
sources, say "not reported" — do not fabricate prices or rates.`;

export interface MarketReport {
  timestamp: Date;
  plainText: string;
  html: string;
}

export async function runNewsAgent(): Promise<MarketReport> {
  const now = new Date();
  const timestamp = now.toUTCString();

  const sourceList = NEWS_SOURCES.map(
    (s) => `- ${s.name}: fetch ${s.url} and search "${s.searchQuery}"`
  ).join("\n");

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Current time: ${timestamp}

Gather the latest oil and LPG market intelligence from these sources:
${sourceList}

For each source: fetch the main page first, then run targeted searches for the most recent
articles. Focus on anything published or updated in the last 6 hours.

Then produce the Dorian LPG Market Briefing following the exact template in your instructions.`,
    },
  ];

  let response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    tools: [
      { type: "web_search_20260209", name: "web_search" },
      { type: "web_fetch_20260209", name: "web_fetch" },
    ],
    system: SYSTEM_PROMPT,
    messages,
  });

  let iterations = 0;
  const MAX_ITERATIONS = 20;
  let finalText = "";

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Log tool activity to console
    for (const block of response.content) {
      if (block.type === "tool_use") {
        if (block.name === "web_search") {
          const input = block.input as { query: string };
          console.log(`  [search] "${input.query}"`);
        } else if (block.name === "web_fetch") {
          const input = block.input as { url: string };
          const domain = (() => {
            try {
              return new URL(input.url).hostname.replace("www.", "");
            } catch {
              return input.url.slice(0, 40);
            }
          })();
          console.log(`  [fetch]  ${domain}`);
        }
      }
    }

    if (response.stop_reason === "end_turn") {
      for (const block of response.content) {
        if (block.type === "text") {
          finalText += block.text;
        }
      }
      break;
    }

    if (
      response.stop_reason === "pause_turn" ||
      response.stop_reason === "tool_use"
    ) {
      messages.push({ role: "assistant", content: response.content });
      response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        tools: [
          { type: "web_search_20260209", name: "web_search" },
          { type: "web_fetch_20260209", name: "web_fetch" },
        ],
        system: SYSTEM_PROMPT,
        messages,
      });
      continue;
    }
  }

  if (!finalText) {
    // Collect whatever text we have if we hit the iteration cap
    for (const block of response.content) {
      if (block.type === "text") {
        finalText += block.text;
      }
    }
    finalText +=
      "\n\n[Note: agent reached max iterations — report may be partial]";
  }

  const html = markdownToHtml(finalText, now);
  const report: MarketReport = { timestamp: now, plainText: finalText, html };
  saveHtmlReport(report);
  return report;
}

/** Saves HTML + PDF to briefings/YYYY-MM-DD-HHmm.{html,pdf} */
function saveHtmlReport(report: MarketReport): void {
  const dir = path.join(__dirname, "briefings");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const pad = (n: number) => String(n).padStart(2, "0");
  const d = report.timestamp;
  const stem = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;
  const htmlPath = path.join(dir, `${stem}.html`);
  const pdfPath  = path.join(dir, `${stem}.pdf`);

  fs.writeFileSync(htmlPath, report.html, "utf8");

  try {
    execSync(`python3 -c "from weasyprint import HTML; HTML(filename='${htmlPath}').write_pdf('${pdfPath}')"`, { stdio: "pipe" });
    console.log(`  [saved]  briefings/${stem}.pdf`);
  } catch {
    // weasyprint not available — HTML still saved as fallback
    console.log(`  [saved]  briefings/${stem}.html  (install weasyprint to auto-generate PDF)`);
  }
}

/** Minimal markdown → HTML converter sufficient for the briefing template */
function markdownToHtml(markdown: string, date: Date): string {
  const dateStr = date.toLocaleString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  // Convert markdown table rows to HTML
  const convertTable = (md: string): string => {
    return md.replace(
      /(\|.+\|\n)+/g,
      (tableBlock) => {
        const rows = tableBlock.trim().split("\n");
        let html = '<table style="border-collapse:collapse;width:100%;margin:8px 0">';
        rows.forEach((row, i) => {
          if (/^\|[-| :]+\|$/.test(row.trim())) return; // skip separator
          const cells = row
            .split("|")
            .filter((_, ci) => ci > 0 && ci < row.split("|").length - 1);
          const tag = i === 0 ? "th" : "td";
          const style =
            i === 0
              ? "background:#1a1a2e;color:#e0e0e0;padding:6px 10px;text-align:left;font-size:12px"
              : "padding:5px 10px;border-bottom:1px solid #eee;font-size:12px";
          html += "<tr>" + cells.map((c) => `<${tag} style="${style}">${c.trim()}</${tag}>`).join("") + "</tr>";
        });
        html += "</table>";
        return html;
      }
    );
  };

  let body = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Re-apply table conversion before other transforms (needs raw | chars)
  body = convertTable(markdown);

  body = body
    .replace(/^## (.+)$/gm, '<h2 style="color:#1a1a2e;margin:20px 0 4px">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="color:#444;margin:12px 0 4px;font-size:14px">$1</h3>')
    .replace(/^\*\*(.+?)\*\*$/gm, '<p style="font-weight:bold;color:#1a1a2e;margin:14px 0 4px">$1</p>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul style="margin:6px 0 6px 18px">${m}</ul>`)
    .replace(/↑/g, '<span style="color:#16a34a">↑</span>')
    .replace(/↓/g, '<span style="color:#dc2626">↓</span>')
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^(?!<)(.+)$/gm, "$1");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           max-width: 700px; margin: 0 auto; padding: 24px; color: #222; font-size: 14px; }
    hr   { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
  </style>
</head>
<body>
  <div style="background:#1a1a2e;color:white;padding:16px 20px;border-radius:6px;margin-bottom:20px">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.7">Dorian LPG</div>
    <div style="font-size:18px;font-weight:bold;margin:4px 0">Oil &amp; LPG Market Briefing</div>
    <div style="font-size:12px;opacity:0.8">${dateStr}</div>
    <div style="font-size:11px;opacity:0.6;margin-top:6px">
      Sources: Bloomberg · Yahoo Finance · NY Times · TradeWinds
    </div>
  </div>
  ${body}
  <hr>
  <p style="font-size:11px;color:#999;margin-top:16px">
    Generated by Dorian LPG Market Intelligence Agent · ${dateStr}
  </p>
</body>
</html>`;
}

// Allow running directly: npx ts-node news-agent.ts
if (require.main === module) {
  (async () => {
    console.log("\nDorian LPG Market Intelligence Agent");
    console.log("=".repeat(50));
    const report = await runNewsAgent();
    console.log("\n" + "=".repeat(50));
    console.log(report.plainText);
  })().catch((err) => {
    if (err instanceof Anthropic.APIError) {
      console.error(`API Error ${err.status}: ${err.message}`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}
