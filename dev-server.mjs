// Local test server: serves public/ and runs the Netlify API function with an in-memory store.
// Run: node dev-server.mjs  (then open http://localhost:8888)
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { handle } from './netlify/functions/api.mjs';

const PORT = +process.env.PORT || 8888;
const ROOT = join(import.meta.dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };

// Minimal stand-in for a Netlify Blobs store (getWithMetadata + conditional set).
const blobs = new Map();
let seq = 0;
const store = {
  async getWithMetadata(key) {
    const b = blobs.get(key);
    return b ? { data: b.data, etag: b.etag, metadata: b.metadata } : null;
  },
  async set(key, data, opts = {}) {
    const cur = blobs.get(key);
    if (opts.onlyIfNew && cur) return { modified: false };
    if (opts.onlyIfMatch && (!cur || cur.etag !== opts.onlyIfMatch)) return { modified: false };
    blobs.set(key, { data, etag: 'e' + (++seq), metadata: opts.metadata || {} });
    return { modified: true };
  }
};

http.createServer(async (req, res) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    let body = '';
    for await (const c of req) body += c;
    let out;
    try { out = await handle(JSON.parse(body || '{}'), store); }
    catch (e) { out = { ok: false, err: 'Server error', detail: String(e.stack || e) }; }
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(out));
  }
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, path.endsWith('/') ? path + 'index.html' : path);
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(PORT, () => console.log('Thinkamajig dev server on http://localhost:' + PORT));
