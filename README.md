# Insight Blog

A minimal, dependency-light static site generator for auto-synthesized insight papers. Markdown in, styled HTML out. No framework, no client-side JavaScript, no external fonts or images.

## Quick Start

```bash
npm install
mkdir content && echo '---
title: "Hello World"
date: 2026-01-01
tags: test
---
# Hello World
This is a test.' > content/2026-01-01-test.md

npx tsx scripts/build.tsx   # build dist/
npx tsx server.ts           # serve on http://127.0.0.1:18805
```

## How It Works

1. Write Markdown files with YAML frontmatter into `content/`
2. Run the build script to compile them into styled HTML in `dist/`
3. Serve `dist/` with the included static file server

That's it. No config files, no templating language, no build tooling beyond `tsx`.

## Features

- **Hand-rolled Markdown parser** — handles headings, bold/italic, code blocks, tables, blockquotes, lists, links
- **Frontier-lab aesthetic** — dark theme, system fonts, monospace metadata, research-paper feel
- **Security-first** — CSP headers, no external scripts, no external fonts, path traversal protection
- **Four page types** — article pages, index with status panel, archive, about
- **Responsive** — mobile breakpoints included

See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed system breakdown.
