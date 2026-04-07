import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Target news sources for oil/LPG coverage
const NEWS_SOURCES = [
  {
    name: "Bloomberg Energy",
    url: "https://www.bloomberg.com/energy",
    searchQuery: "site:bloomberg.com oil LPG energy market",
  },
  {
    name: "Yahoo Finance - Energy",
    url: "https://finance.yahoo.com/topic/energy/",
    searchQuery: "site:finance.yahoo.com oil LPG crude energy",
  },
  {
    name: "New York Times - Energy",
    url: "https://www.nytimes.com/section/business/energy-environment",
    searchQuery: "site:nytimes.com oil energy LPG market",
  },
  {
    name: "TradeWinds",
    url: "https://www.tradewindsnews.com",
    searchQuery: "site:tradewindsnews.com LPG oil tanker",
  },
];

const SYSTEM_PROMPT = `You are an expert oil and LPG (liquefied petroleum gas) market analyst.

Your task is to gather the latest oil and LPG market news from specific trusted sources:
- Bloomberg (bloomberg.com) — financial and energy market coverage
- Yahoo Finance (finance.yahoo.com) — market data and energy news
- New York Times (nytimes.com) — energy and business news
- TradeWinds (tradewindsnews.com) — shipping and LPG tanker markets

For each source, fetch the page content and extract relevant oil/LPG news.
Then compile a comprehensive, sourced market report covering:

1. Crude oil prices (WTI, Brent) and movements
2. LPG/propane/butane prices and supply/demand
3. OPEC+ decisions and geopolitical factors
4. Shipping/tanker market for LPG
5. Key market-moving events
6. Asian demand trends

Structure your report with:
- Executive Summary (top 3-5 developments)
- Price Snapshot
- Supply & Demand Analysis
- Geopolitics & OPEC+
- Shipping & Logistics (from TradeWinds)
- Outlook
- Sources (cite the specific article and outlet for each fact)

Always attribute information to the specific source you found it on.`;

async function runNewsAgent(): Promise<void> {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  console.log(`\nOil & LPG Market News Agent`);
  console.log(`Date: ${today}`);
  console.log("=".repeat(60));
  console.log("Sources: Bloomberg | Yahoo Finance | NY Times | TradeWinds");
  console.log("=".repeat(60) + "\n");

  const sourceList = NEWS_SOURCES.map(
    (s) => `- ${s.name}: ${s.url} (search: ${s.searchQuery})`
  ).join("\n");

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Today is ${today}. Please gather the latest oil and LPG market news from these specific sources:

${sourceList}

For each source:
1. First fetch the main page URL to get current headlines
2. Then search for recent oil/LPG specific articles if needed
3. Extract the most relevant and recent market information

After gathering from all sources, compile a comprehensive oil and LPG market report.
Clearly cite which outlet each piece of information came from.`,
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

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Show tool calls as they happen
    for (const block of response.content) {
      if (block.type === "tool_use") {
        if (block.name === "web_search") {
          const input = block.input as { query: string };
          console.log(`[Search] "${input.query}"`);
        } else if (block.name === "web_fetch") {
          const input = block.input as { url: string };
          // Extract domain for concise display
          const domain = new URL(input.url).hostname.replace("www.", "");
          console.log(`[Fetch]  ${domain} — ${input.url.slice(0, 80)}...`);
        }
      } else if (block.type === "text" && block.text.trim()) {
        // Intermediate text (thinking out loud) — skip, show final report only
      }
    }

    if (response.stop_reason === "end_turn") {
      // Print the final report
      console.log("\n" + "=".repeat(60));
      console.log("MARKET REPORT");
      console.log("=".repeat(60) + "\n");
      for (const block of response.content) {
        if (block.type === "text") {
          console.log(block.text);
        }
      }
      break;
    }

    if (response.stop_reason === "pause_turn") {
      // Server hit its internal loop limit — append and re-send to continue
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

    if (response.stop_reason === "tool_use") {
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

  if (iterations >= MAX_ITERATIONS) {
    console.log(
      "\n[Agent reached maximum iterations. Report may be incomplete.]"
    );
    // Print whatever final text we have
    for (const block of response.content) {
      if (block.type === "text") {
        console.log(block.text);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`Report generated from: Bloomberg, Yahoo Finance, NY Times, TradeWinds`);
}

runNewsAgent().catch((err) => {
  if (err instanceof Anthropic.APIError) {
    console.error(`API Error ${err.status}: ${err.message}`);
  } else {
    console.error("Unexpected error:", err);
  }
  process.exit(1);
});
