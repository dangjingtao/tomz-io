import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve(process.argv[2] || "dist");
const mount = (process.argv[3] || "/tomz-io").replace(/\/$/, "");
const port = Number(process.argv[4] || 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

function safePath(relative) {
  const target = resolve(root, relative.replace(/^\/+/, ""));
  if (target !== root && !target.startsWith(root + sep)) return null;
  return target;
}

function fileCandidate(pathname) {
  const relative = pathname === mount ? "/" : pathname.slice(mount.length);
  const direct = safePath(relative);
  if (!direct) return null;

  if (existsSync(direct) && statSync(direct).isFile()) return direct;

  const index = resolve(direct, "index.html");
  if (existsSync(index) && statSync(index).isFile()) return index;

  return null;
}

function sendFile(response, path, status = 200) {
  response.statusCode = status;
  response.setHeader("Content-Type", contentTypes[extname(path)] || "application/octet-stream");
  createReadStream(path).pipe(response);
}

const server = createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || "/", "http://127.0.0.1").pathname);
  } catch {
    response.statusCode = 400;
    response.end("Bad Request");
    return;
  }

  if (pathname !== mount && !pathname.startsWith(mount + "/")) {
    response.statusCode = 404;
    response.end("Not Found");
    return;
  }

  const file = fileCandidate(pathname);
  if (file) {
    sendFile(response, file);
    return;
  }

  const notFound = resolve(root, "404.html");
  if (existsSync(notFound)) {
    sendFile(response, notFound, 404);
    return;
  }

  response.statusCode = 404;
  response.end("Not Found");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Pages-like static server listening on http://127.0.0.1:${port}${mount}`);
});
