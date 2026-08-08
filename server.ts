import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.env.DIST_ROOT || path.join(process.cwd(), "dist"));
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 18805);

const HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "content-security-policy": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'none'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
};

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

function getCacheControl(filePath: string): string {
  if (filePath.endsWith(".html")) return "no-cache";
  return "public, max-age=3600";
}

const server = http.createServer((req, res) => {
  Object.entries(HEADERS).forEach(([key, value]) => res.setHeader(key, value));

  if (!req.url || !["GET", "HEAD"].includes(req.method || "")) {
    res.writeHead(405, { allow: "GET, HEAD" });
    return res.end();
  }

  if (req.url.split("?", 1)[0] === "/health") {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    return res.end(req.method === "HEAD" ? undefined : JSON.stringify({ status: "ok" }));
  }

  let urlPath = req.url.split("?", 1)[0];
  if (urlPath === "/") urlPath = "/index.html";

  // Try the exact path first, then with .html extension
  let filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  if (!fs.existsSync(filePath) && !urlPath.endsWith(".html")) {
    const htmlPath = filePath + ".html";
    if (fs.existsSync(htmlPath)) filePath = htmlPath;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      "content-type": getContentType(filePath),
      "cache-control": getCacheControl(filePath),
    });
    return res.end(req.method === "HEAD" ? undefined : content);
  }

  // Try index.html fallback for SPA-like routes (archives, topics)
  const indexPath = path.join(ROOT, "index.html");
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath);
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache",
    });
    return res.end(req.method === "HEAD" ? undefined : content);
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, HOST, () => {
  console.log(`Insight blog server running on http://${HOST}:${PORT}`);
});
