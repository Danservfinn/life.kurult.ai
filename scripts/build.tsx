import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const DIST = path.join(ROOT, "dist");

const SYNTHESIS_CADENCE = "EVERY 4H";

// ─── Page template ─────────────────────────────────────────

interface PageOptions {
  title: string;
  body: string;
  extraMeta?: string;
  active?: "home" | "archive" | "about" | "paper";
  wide?: boolean;
  paperCount?: number;
  lastDate?: string;
}

function page(opts: PageOptions): string {
  const { title, body, extraMeta = "", active = "", wide = false, paperCount = 0, lastDate = "" } = opts;

  const navLink = (href: string, label: string, key: string) =>
    `<a href="${href}"${active === key ? ' class="active"' : ""}>${label}</a>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title} — life.kurult.ai</title>
${extraMeta}
<style>
:root {
  --bg: #0a0a0b;
  --surface: #131316;
  --surface-2: #18181c;
  --border: #232328;
  --fg: #e8e8ed;
  --muted: #8e8e93;
  --muted-2: #5c5c62;
  --accent: #e5a547;
  --accent-dim: #7a5f34;
  --font-sans: -apple-system, "SF Pro Display", "Segoe UI", system-ui, sans-serif;
  --font-mono: "SF Mono", "JetBrains Mono", "Fira Code", monospace;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { background: var(--bg); }
body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--fg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ─── Header / nav ─────────────────────────────── */
.site-header { border-bottom: 1px solid var(--border); }
.nav {
  max-width: 1040px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.35rem 1.5rem;
}
.brand {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fg);
  text-decoration: none;
  border-bottom: none;
}
.brand .brand-dot { color: var(--accent); }
.nav-links a {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  margin-left: 1.75rem;
  border-bottom: none;
  transition: color 0.15s ease;
}
.nav-links a:hover, .nav-links a.active { color: var(--fg); }

.status-bar { background: var(--surface); border-bottom: 1px solid var(--border); }
.status-bar-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0.55rem 1.5rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted-2);
}
.status-live { color: var(--accent); display: inline-flex; align-items: center; }
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  margin-right: 0.5rem;
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

/* ─── Layout ────────────────────────────────────── */
main { display: block; }
.container {
  max-width: ${wide ? "1040px" : "780px"};
  margin: 0 auto;
  padding: 3.5rem 1.5rem 5rem;
}

/* ─── Article typography ───────────────────────── */
.paper-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1rem;
}
.paper-title {
  font-size: 2.05rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.22;
  margin-bottom: 1.5rem;
  max-width: 22ch;
}
.paper-meta {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  align-items: center;
  padding-bottom: 1.75rem;
  margin-bottom: 2.75rem;
  border-bottom: 1px solid var(--border);
}
.paper-meta .sep { color: var(--muted-2); }
.tag {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--accent);
  border: 1px solid var(--accent-dim);
  padding: 0.15rem 0.5rem;
  border-radius: 2px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.prose h1 { font-size: 1.7rem; font-weight: 600; letter-spacing: -0.01em; margin: 3rem 0 1.1rem; }
.prose h2 { font-size: 1.35rem; font-weight: 600; letter-spacing: -0.01em; margin: 3rem 0 1.1rem; }
.prose h3 { font-size: 1.05rem; font-weight: 600; color: var(--fg); margin: 2.2rem 0 0.85rem; }
.prose p { margin-bottom: 1.4rem; line-height: 1.78; color: var(--fg); }
.prose > *:first-child { margin-top: 0; }
.prose strong { font-weight: 600; color: var(--fg); }
.prose em { font-style: italic; color: var(--fg); }
.prose a { color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--accent-dim); }
.prose a:hover { border-bottom-color: var(--accent); }
.prose code {
  font-family: var(--font-mono);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 0.1rem 0.4rem;
  border-radius: 2px;
  font-size: 0.85em;
  color: var(--accent);
}
.prose pre {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 1.1rem 1.3rem;
  border-radius: 3px;
  overflow-x: auto;
  margin-bottom: 1.5rem;
}
.prose pre code { background: none; border: none; padding: 0; color: var(--fg); }
.prose blockquote {
  border-left: 2px solid var(--accent);
  background: var(--surface);
  padding: 1.1rem 1.4rem;
  margin: 1.75rem 0;
  color: var(--muted);
}
.prose blockquote p:last-child { margin-bottom: 0; }
.prose ul, .prose ol { margin: 0 0 1.4rem; padding-left: 1.4rem; }
.prose li { margin-bottom: 0.5rem; line-height: 1.7; }
.prose hr { border: none; border-top: 1px solid var(--border); margin: 3rem 0; }

table.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0 2rem;
  font-size: 0.88rem;
}
table.data-table th {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  text-align: left;
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
table.data-table td {
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid var(--border);
  color: var(--fg);
  font-variant-numeric: tabular-nums;
}
table.data-table tr:last-child td { border-bottom: 1px solid var(--border); }

.back-link { margin-top: 3rem; }
.back-link a {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  text-decoration: none;
  border-bottom: none;
}
.back-link a:hover { color: var(--accent); }

/* ─── Home / status panel ──────────────────────── */
.status-panel {
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1.5rem 1.75rem;
  margin-bottom: 3.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem;
}
.status-stat .num {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--fg);
  line-height: 1.1;
}
.status-stat .num .accent { color: var(--accent); }
.status-stat .label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.35rem;
}
.section-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

/* ─── Archive ───────────────────────────────────── */
.archive-header { margin-bottom: 2.5rem; }
.archive-header h1 { font-size: 1.9rem; font-weight: 600; letter-spacing: -0.015em; margin-bottom: 0.6rem; }
.archive-header .sub { font-family: var(--font-mono); font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
.archive-list { list-style: none; }
.archive-entry {
  padding: 1.6rem 0;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: 5.5rem 1fr;
  gap: 1.5rem;
}
.archive-entry:first-child { padding-top: 0; }
.archive-num {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: var(--muted-2);
  padding-top: 0.2rem;
}
.archive-entry h2 { font-size: 1.15rem; font-weight: 600; letter-spacing: -0.005em; margin-bottom: 0.5rem; }
.archive-entry h2 a { color: var(--fg); text-decoration: none; border-bottom: none; }
.archive-entry h2 a:hover { color: var(--accent); }
.archive-entry .excerpt { color: var(--muted); font-size: 0.94rem; line-height: 1.65; margin-bottom: 0.75rem; max-width: 62ch; }
.archive-entry .row-meta {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

/* ─── About ─────────────────────────────────────── */
.about-title { font-size: 1.9rem; font-weight: 600; letter-spacing: -0.015em; margin-bottom: 2.5rem; }
.notice {
  border: 1px solid var(--accent-dim);
  background: var(--surface);
  border-radius: 3px;
  padding: 1.1rem 1.4rem;
  margin-bottom: 2.5rem;
  font-size: 0.94rem;
  color: var(--fg);
}
.notice .notice-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  display: block;
  margin-bottom: 0.4rem;
}
.data-source-list { list-style: none; margin-bottom: 0; }
.data-source-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.94rem;
}
.data-source-list li:first-child { padding-top: 0; }
.data-source-list .count { font-family: var(--font-mono); color: var(--muted); font-size: 0.82rem; }

/* ─── Footer ────────────────────────────────────── */
.site-footer {
  border-top: 1px solid var(--border);
  padding: 2rem 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--muted-2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: center;
}

@media (max-width: 560px) {
  .nav { padding: 1.1rem 1.25rem; }
  .nav-links a { margin-left: 1.1rem; }
  .container { padding: 2.5rem 1.25rem 4rem; }
  .paper-title { font-size: 1.6rem; }
  .archive-entry { grid-template-columns: 1fr; gap: 0.4rem; }
  .status-panel { gap: 1.5rem; padding: 1.25rem 1.4rem; }
}
</style>
</head>
<body>
<header class="site-header">
<div class="nav">
<a class="brand" href="/">life<span class="brand-dot">.</span>kurult.ai</a>
<nav class="nav-links">
${navLink("/", "Home", "home")}
${navLink("/archive", "Archive", "archive")}
${navLink("/about", "About", "about")}
</nav>
</div>
</header>
<div class="status-bar">
<div class="status-bar-inner">
<span class="status-live"><span class="status-dot"></span>Auto-synthesized</span>
<span>Cadence: ${SYNTHESIS_CADENCE}${lastDate ? ` &middot; Last run: ${lastDate}` : ""}${paperCount ? ` &middot; ${paperCount} papers` : ""}</span>
</div>
</div>
<main>
<div class="container">
${body}
</div>
</main>
<footer class="site-footer">Auto-synthesized insight blog</footer>
</body>
</html>`;
}

// ─── Minimal Markdown → HTML ───────────────────────────────

function mdToHtml(md: string): string {
  let html = md;

  // Extract frontmatter
  const fmMatch = html.match(/^---\n([\s\S]*?)\n---\n/);
  let frontmatter: Record<string, string> = {};
  if (fmMatch) {
    html = html.slice(fmMatch[0].length);
    for (const line of fmMatch[1].split("\n")) {
      const m = line.match(/^(\w+):\s*(.+)$/);
      if (m) frontmatter[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }

  // Code blocks (preserve before other processing)
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const placeholder = `\x00CODE${codeBlocks.length}\x00`;
    codeBlocks.push(`<pre><code class="language-${lang}">${escaped}</code></pre>`);
    return placeholder;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr>");

  // Tables
  html = html.replace(/((?:^\|.*\|[ \t]*$\n?)+)/gm, (block) => {
    const lines = block.trim().split("\n");
    if (lines.length < 2) return block;
    const isSeparator = (line: string) => /^\|?[\s:|-]+\|?$/.test(line) && line.includes("-");
    if (!isSeparator(lines[1])) return block;
    const parseRow = (line: string) =>
      line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
    const header = parseRow(lines[0]);
    const rows = lines.slice(2).map(parseRow);
    const thead = `<thead><tr>${header.map((c) => `<th>${c}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>`;
    const placeholder = `\x00CODE${codeBlocks.length}\x00`;
    codeBlocks.push(`<table class="data-table">${thead}${tbody}</table>`);
    return placeholder + "\n";
  });

  // Lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.+<\/li>\n?)+/g, "<ul>$&</ul>");

  // Paragraphs
  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs around block elements
  html = html.replace(/<p>\s*(<(?:h[1-6]|ul|ol|blockquote|pre|hr))/g, "$1");
  html = html.replace(/(<\/(?:h[1-6]|ul|ol|blockquote|pre|hr)>)\s*<\/p>/g, "$1");

  // Restore code blocks
  html = html.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)]);

  return { html, frontmatter } as any;
}

function stripLeadingH1(html: string): string {
  return html.replace(/^<h1>.*?<\/h1>/, "");
}

function excerptFrom(md: string): string {
  const bodyMd = md.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
  const plain = bodyMd
    .replace(/^#.*$/m, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*`>|]/g, "")
    .replace(/^-+\s*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 220 ? plain.slice(0, 220).trim() + "…" : plain;
}

// ─── Build ─────────────────────────────────────────────────

function build() {
  // Clean dist
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
  fs.mkdirSync(DIST, { recursive: true });

  // Collect all insight papers
  const papers: Array<{ slug: string; title: string; date: string; tags: string[]; excerpt: string; num: number }> = [];

  const mdFiles = fs.existsSync(CONTENT) ? fs.readdirSync(CONTENT).filter((f) => f.endsWith(".md")).sort().reverse() : [];

  mdFiles.forEach((file, i) => {
    const md = fs.readFileSync(path.join(CONTENT, file), "utf-8");
    const { html: rawHtml, frontmatter } = mdToHtml(md) as any;
    const html = stripLeadingH1(rawHtml);

    const title = frontmatter.title || file.replace(".md", "");
    const date = frontmatter.date || "";
    const tags = (frontmatter.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean);
    const slug = file.replace(".md", "");
    const num = mdFiles.length - i;

    papers.push({ slug, title, date, tags, excerpt: excerptFrom(md), num });

    const metaRow = `<span>${date}</span>${tags.length ? `<span class="sep">&middot;</span>` + tags.map((t: string) => `<span class="tag">${t}</span>`).join(" ") : ""}<span class="sep">&middot;</span><span>No. ${String(num).padStart(3, "0")}</span>`;

    const paperHtml = page({
      title,
      active: "paper",
      lastDate: papers[0]?.date,
      paperCount: mdFiles.length,
      body: `
<div class="paper-eyebrow">Insight paper</div>
<h1 class="paper-title">${title}</h1>
<div class="paper-meta">${metaRow}</div>
<div class="prose">${html}</div>
<div class="back-link"><a href="/archive">&larr; Back to archive</a></div>
`,
    });
    fs.writeFileSync(path.join(DIST, `${slug}.html`), paperHtml);
  });

  const latest = papers[0];
  const lastDate = latest?.date || "";

  // Homepage — system status + latest insight
  let homeBody = "";

  if (latest) {
    const latestMd = fs.readFileSync(path.join(CONTENT, `${latest.slug}.md`), "utf-8");
    const { html: rawLatestHtml } = mdToHtml(latestMd) as any;
    const html = stripLeadingH1(rawLatestHtml);
    const metaRow = `<span>${latest.date}</span>${latest.tags.length ? `<span class="sep">&middot;</span>` + latest.tags.map((t) => `<span class="tag">${t}</span>`).join(" ") : ""}<span class="sep">&middot;</span><span>No. ${String(latest.num).padStart(3, "0")}</span>`;
    homeBody = `
<div class="status-panel">
<div class="status-stat"><div class="num"><span class="accent">${papers.length}</span></div><div class="label">Insight papers</div></div>
<div class="status-stat"><div class="num">${SYNTHESIS_CADENCE}</div><div class="label">Synthesis cadence</div></div>
<div class="status-stat"><div class="num">${lastDate}</div><div class="label">Last synthesis</div></div>
</div>
<div class="paper-eyebrow">Featured — latest insight</div>
<h1 class="paper-title">${latest.title}</h1>
<div class="paper-meta">${metaRow}</div>
<div class="prose">${html}</div>
<div class="back-link"><a href="/archive">View all ${papers.length} insights &rarr;</a></div>
`;
  } else {
    homeBody = `
<div class="status-panel">
<div class="status-stat"><div class="num"><span class="accent">0</span></div><div class="label">Insight papers</div></div>
<div class="status-stat"><div class="num">${SYNTHESIS_CADENCE}</div><div class="label">Synthesis cadence</div></div>
</div>
<p>No insights yet. The first synthesis will appear here automatically.</p>
`;
  }

  fs.writeFileSync(
    path.join(DIST, "index.html"),
    page({ title: "Latest Insight", active: "home", body: homeBody, paperCount: papers.length, lastDate })
  );

  // Archive page
  const archiveBody = `
<div class="archive-header">
<h1>Archive</h1>
<div class="sub">${papers.length} insight${papers.length === 1 ? "" : "s"} synthesized</div>
</div>
<ul class="archive-list">
${papers
  .map(
    (p) => `<li class="archive-entry">
<div class="archive-num">No. ${String(p.num).padStart(3, "0")}</div>
<div>
<h2><a href="/${p.slug}">${p.title}</a></h2>
${p.excerpt ? `<div class="excerpt">${p.excerpt}</div>` : ""}
<div class="row-meta"><span>${p.date}</span>${p.tags.length ? `<span class="sep">&middot;</span>` + p.tags.map((t) => `<span class="tag">${t}</span>`).join(" ") : ""}</div>
</div>
</li>`
  )
  .join("\n")}
</ul>
`;
  fs.writeFileSync(
    path.join(DIST, "archive.html"),
    page({ title: "Archive", active: "archive", wide: true, body: archiveBody, paperCount: papers.length, lastDate })
  );

  // About page
  const aboutBody = `
<h1 class="about-title">About</h1>
<div class="section-label">System</div>
<div class="prose">
<p>This is an auto-synthesized insight blog. On a fixed cadence, it analyzes personal data sources, builds a knowledge graph, and generates a candid insight paper aligned to active goals.</p>
</div>
<div class="section-label">Synthesis</div>
<div class="prose">
<p>Insights are generated by an LLM on a cadence of ${SYNTHESIS_CADENCE.toLowerCase()}. No quality gates are applied — insights are fully candid and opinionated by design.</p>
</div>
<div class="section-label">Privacy</div>
<ul class="data-source-list">
<li><span>Search indexing</span><span class="count">noindex, nofollow</span></li>
<li><span>Content security policy</span><span class="count">no external scripts</span></li>
</ul>
`;
  fs.writeFileSync(
    path.join(DIST, "about.html"),
    page({ title: "About", active: "about", body: aboutBody, paperCount: papers.length, lastDate })
  );

  console.log(`Built ${papers.length} papers + index + archive + about`);
}

build();
