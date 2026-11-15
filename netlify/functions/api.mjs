// Thinkamajig game API for Netlify. One POST endpoint: { action, payload } -> game view.
// Game state is kept in Netlify Blobs. Each request reads the game, runs the rules, and writes
// the game back only if nobody else changed it in the meantime (otherwise it retries).
import game from './game.cjs';
import { getStore } from '@netlify/blobs';

const TTL_MS = 6 * 60 * 60 * 1000;   // a game is forgotten 6 hours after its last action
const CODE_LETTERS = 'BCDFGHJKLMNPQRSTVWXZ';

function reply(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
function fresh(meta) { return meta && meta.t && (Date.now() - meta.t) < TTL_MS; }
async function read(store, key) {
  const r = await store.getWithMetadata(key, { type: 'text' });
  if (!r || !fresh(r.metadata)) return null;
  return r;
}

export async function handle(body, store) {
  const action = String(body.action || ''), payload = body.payload || {};
  for (let attempt = 0; attempt < 8; attempt++) {
    game.reset();
    const code = String(payload.code || '').toUpperCase().replace(/[^A-Z]/g, '');
    let gKey = 'g_' + code, etag = null, loaded = null;
    if (action === 'create') {
      let pick = '';
      for (let t = 0; t < 60 && !pick; t++) {
        let c = '';
        for (let i = 0; i < 4; i++) c += CODE_LETTERS.charAt(Math.floor(Math.random() * CODE_LETTERS.length));
        if (!(await read(store, 'g_' + c))) pick = c;
      }
      if (!pick) return { ok: false, err: 'Could not make a game code, try again.' };
      game.setCode(pick); gKey = 'g_' + pick;
    } else if (code) {
      loaded = await read(store, gKey);
      if (loaded) { game.preload(gKey, loaded.data); etag = loaded.etag; }
    }
    if (action === 'history' && loaded) {
      const g = JSON.parse(loaded.data);
      for (const r of (g.hrounds || [])) {
        const h = await read(store, 'h_' + g.code + '_' + r);
        if (h) game.preload('h_' + g.code + '_' + r, h.data);
      }
    }
    const result = game.api(action, payload);
    const out = game.written();
    const keys = Object.keys(out);
    if (!keys.length) return result;                       // read-only request
    const meta = { metadata: { t: Date.now() } };
    if (out[gKey] !== undefined) {
      const w = await store.set(gKey, out[gKey], etag ? Object.assign({ onlyIfMatch: etag }, meta) : Object.assign({ onlyIfNew: true }, meta));
      if (w && w.modified === false) continue;             // someone else got in first: redo on fresh data
    }
    for (const k of keys) if (k !== gKey) await store.set(k, out[k], meta);
    return result;
  }
  return { ok: false, err: 'Server busy, try again.' };
}

export default async (req) => {
  if (req.method !== 'POST') return reply({ ok: false, err: 'POST only.' }, 405);
  let body;
  try { body = await req.json(); } catch (e) { return reply({ ok: false, err: 'Bad request.' }, 400); }
  try {
    const store = getStore({ name: 'thinkamajig', consistency: 'strong' });
    return reply(await handle(body, store));
  } catch (e) {
    return reply({ ok: false, err: 'Server busy, try again.', detail: String(e && (e.stack || e.message || e)).slice(0, 600) });
  }
};
