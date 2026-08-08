# Insight Blog — Static Site Generator

## Project Overview
A minimal, dependency-light static site generator for auto-synthesized insight papers. Markdown files in `content/` are compiled into styled HTML pages in `dist/` by a single TypeScript build script. A lightweight Node.js static file server serves the output.

**Design goal:** A research-grade, intellectual, data-heavy publication interface — like a frontier AI lab's internal publication system, not a generic dark-theme blog.

## Architecture
- **Build script:** `scripts/build.tsx` — reads `content/*.md`, generates `dist/*.html`
- **Server:** `server.ts` — static file server (configurable via `PORT` and `HOST` env vars)
- **Content:** `content/*.md` with YAML frontmatter (`title`, `date`, `tags`)
- **No framework.** The `page()` function in build.tsx is the entire rendering pipeline — template, CSS, layout.

## Key Constraints
- **NO external JS.** CSP is `script-src 'none'`. All interactivity must be pure CSS.
- **NO external fonts.** Font-src is `'self'`. Use system font stacks only.
- **NO images from external sources.** img-src is `'self' data:`.
- **All styling is inline `<style>` in the page template function.**
- The build script's `page()` function generates every page — single source of truth for layout/CSS.
- The `mdToHtml()` function converts markdown to HTML — keep it working.

## Build & Run
```bash
npm install        # first time only
npx tsx scripts/build.tsx   # build dist/ from content/
npx tsx server.ts           # serve on configurable port (default 18805)
```

## Content Format
Markdown files in `content/` with YAML frontmatter:
```yaml
---
title: "Your Title Here"
date: 2026-01-01
tags: topic1, topic2
---
```

## Design Requirements (Frontier Lab Aesthetic)
- Dark theme (off-black, not pure black), high-contrast text, single accent color
- System font stacks, generous line-height, max-width ~780px for reading
- Monospace labels for metadata, sans-serif for body
- Research paper feel, not blog post feel
- Clean data tables, subtle borders, generous vertical rhythm
