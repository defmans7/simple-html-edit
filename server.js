import { serve } from "bun";
import { existsSync } from "fs";
import path from "path";

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(import.meta.dir, "dist");

console.log(`🚀 Starting server on port ${PORT}`);
console.log(`📁 Serving files from: ${DIST_DIR}`);

// Check if dist directory exists
if (!existsSync(DIST_DIR)) {
  console.error("❌ Dist directory not found. Please run 'bun run build' first.");
  process.exit(1);
}

const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Default to index.html for root path
    if (pathname === "/") {
      pathname = "/HTMLEditor.html";
    }

    // Construct file path
    const filePath = path.join(DIST_DIR, pathname);

    // Security check: ensure the path is within dist directory
    const resolvedPath = path.resolve(filePath);
    const resolvedDistDir = path.resolve(DIST_DIR);

    if (!resolvedPath.startsWith(resolvedDistDir)) {
      return new Response("Forbidden", { status: 403 });
    }

    // Check if file exists
    if (!existsSync(resolvedPath)) {
      return new Response("Not Found", { status: 404 });
    }

    // Read and serve the file
    const file = Bun.file(resolvedPath);

    // Set appropriate content type
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = getContentType(ext);

    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600"
      }
    });
  },
});

function getContentType(ext) {
  const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject"
  };

  return types[ext] || "application/octet-stream";
}

console.log(`✅ Server running at http://localhost:${PORT}`);
