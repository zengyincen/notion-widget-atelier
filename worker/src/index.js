import { DurableObject } from "cloudflare:workers";

const DEFAULT_STATE = Object.freeze({ food: 82, water: 76, love: 88 });
const ACTIONS = new Set(["feed", "water", "pet"]);
const CARE_COOLDOWN_MS = 2 * 60 * 60 * 1000;
const ACTION_THROTTLE_MS = 400;
const METRIC_KINDS = new Set(["visit", "use"]);
const METRIC_SHARD_COUNT = 16;

export class PetState extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS pet_state (
          singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
          food REAL NOT NULL,
          water REAL NOT NULL,
          love REAL NOT NULL,
          updated_at INTEGER NOT NULL,
          last_action_at INTEGER NOT NULL DEFAULT 0,
          last_feed_at INTEGER NOT NULL DEFAULT 0,
          last_water_at INTEGER NOT NULL DEFAULT 0,
          revision INTEGER NOT NULL DEFAULT 0
        )
      `);
      const columns = new Set(this.ctx.storage.sql.exec("PRAGMA table_info(pet_state)").toArray().map((column) => column.name));
      if (!columns.has("last_feed_at")) this.ctx.storage.sql.exec("ALTER TABLE pet_state ADD COLUMN last_feed_at INTEGER NOT NULL DEFAULT 0");
      if (!columns.has("last_water_at")) this.ctx.storage.sql.exec("ALTER TABLE pet_state ADD COLUMN last_water_at INTEGER NOT NULL DEFAULT 0");
      if (!columns.has("revision")) this.ctx.storage.sql.exec("ALTER TABLE pet_state ADD COLUMN revision INTEGER NOT NULL DEFAULT 0");
    });
  }

  readStored() {
    return this.ctx.storage.sql.exec(
      "SELECT food, water, love, updated_at AS updatedAt, last_action_at AS lastActionAt, last_feed_at AS lastFeedAt, last_water_at AS lastWaterAt, revision FROM pet_state WHERE singleton = 1"
    ).toArray()[0] ?? null;
  }

  withDecay(state, now = Date.now()) {
    const hours = Math.max(0, (now - state.updatedAt) / 3_600_000);
    return {
      food: Math.max(0, state.food - hours * 3.2),
      water: Math.max(0, state.water - hours * 4.2),
      love: Math.max(0, state.love - hours * 1.7),
      updatedAt: now,
      lastActionAt: state.lastActionAt ?? 0,
      lastFeedAt: state.lastFeedAt ?? 0,
      lastWaterAt: state.lastWaterAt ?? 0,
      revision: state.revision ?? 0,
    };
  }

  ensureState(now = Date.now()) {
    const stored = this.readStored();
    if (stored) return stored;
    this.ctx.storage.sql.exec(
      "INSERT INTO pet_state (singleton, food, water, love, updated_at) VALUES (1, ?, ?, ?, ?)",
      DEFAULT_STATE.food, DEFAULT_STATE.water, DEFAULT_STATE.love, now,
    );
    return { ...DEFAULT_STATE, updatedAt: now, lastActionAt: 0, lastFeedAt: 0, lastWaterAt: 0, revision: 0 };
  }

  async getState() {
    const state = this.withDecay(this.ensureState());
    return this.publicState(state);
  }

  publicState(state, extra = {}) {
    const minimum = Math.min(state.food, state.water, state.love);
    const mood = minimum < 35 ? "needs-care" : minimum < 70 ? "recovering" : minimum >= 88 ? "delighted" : "happy";
    return {
      food: state.food,
      water: state.water,
      love: state.love,
      updated: state.updatedAt,
      revision: state.revision ?? 0,
      mood,
      cooldowns: {
        feed: Math.max(0, Math.ceil((CARE_COOLDOWN_MS - (Date.now() - (state.lastFeedAt ?? 0))) / 1000)),
        water: Math.max(0, Math.ceil((CARE_COOLDOWN_MS - (Date.now() - (state.lastWaterAt ?? 0))) / 1000)),
      },
      ...extra,
    };
  }

  async act(action) {
    if (!ACTIONS.has(action)) throw new Error("Unsupported action");
    const now = Date.now();
    const state = this.withDecay(this.ensureState(now), now);
    if (now - state.lastActionAt < ACTION_THROTTLE_MS) {
      return this.publicState(state, { action, accepted: false, throttled: true, message: "慢一点，它正在享受刚才的照顾。" });
    }
    const lastCareAt = action === "feed" ? state.lastFeedAt : action === "water" ? state.lastWaterAt : 0;
    if (lastCareAt && now - lastCareAt < CARE_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil((CARE_COOLDOWN_MS - (now - lastCareAt)) / 1000);
      return this.publicState(state, {
        action,
        accepted: false,
        cooldown: true,
        retryAfterSeconds,
        message: action === "feed" ? "两小时内已经喂过啦。" : "两小时内已经喂过水啦。",
      });
    }
    if (action === "feed") {
      state.food = Math.min(100, state.food + 34);
      state.lastFeedAt = now;
    }
    if (action === "water") {
      state.water = Math.min(100, state.water + 40);
      state.lastWaterAt = now;
    }
    if (action === "pet") state.love = Math.min(100, state.love + 12);
    state.revision = (state.revision ?? 0) + 1;
    this.ctx.storage.sql.exec(
      "UPDATE pet_state SET food = ?, water = ?, love = ?, updated_at = ?, last_action_at = ?, last_feed_at = ?, last_water_at = ?, revision = ? WHERE singleton = 1",
      state.food, state.water, state.love, now, now, state.lastFeedAt, state.lastWaterAt, state.revision,
    );
    return this.publicState({ ...state, updatedAt: now, lastActionAt: now }, { action, accepted: true, message: action === "feed" ? "已经吃到食物啦。" : action === "water" ? "已经喝到清水啦。" : "好舒服，它很喜欢你的抚摸。" });
  }

  async reset(secret, expectedSecret) {
    if (!expectedSecret || secret !== expectedSecret) throw new Error("Unauthorized");
    const now = Date.now();
    this.ctx.storage.sql.exec(
      "INSERT OR REPLACE INTO pet_state (singleton, food, water, love, updated_at, last_action_at, last_feed_at, last_water_at, revision) VALUES (1, ?, ?, ?, ?, ?, 0, 0, 0)",
      DEFAULT_STATE.food, DEFAULT_STATE.water, DEFAULT_STATE.love, now, now,
    );
    return this.publicState({ ...DEFAULT_STATE, updatedAt: now, lastActionAt: now, lastFeedAt: 0, lastWaterAt: 0, revision: 0 });
  }
}

export class MetricsShard extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS metric_identities (
          kind TEXT NOT NULL,
          identity TEXT NOT NULL,
          first_seen INTEGER NOT NULL,
          last_seen INTEGER NOT NULL,
          PRIMARY KEY (kind, identity)
        ) WITHOUT ROWID
      `);
    });
  }

  async track(kind, identity) {
    if (!METRIC_KINDS.has(kind) || !/^[a-f0-9]{64}$/.test(identity)) throw new Error("Invalid metric event");
    const now = Date.now();
    this.ctx.storage.sql.exec(
      "INSERT OR IGNORE INTO metric_identities (kind, identity, first_seen, last_seen) VALUES (?, ?, ?, ?)",
      kind, identity, now, now,
    );
    this.ctx.storage.sql.exec(
      "UPDATE metric_identities SET last_seen = ? WHERE kind = ? AND identity = ?",
      now, kind, identity,
    );
    return { ok: true };
  }

  async getCounts() {
    const rows = this.ctx.storage.sql.exec(
      "SELECT kind, COUNT(*) AS total FROM metric_identities GROUP BY kind"
    ).toArray();
    return Object.fromEntries(rows.map((row) => [row.kind, Number(row.total)]));
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
}

function json(data, status = 200) {
  return Response.json(data, { status, headers: corsHeaders() });
}

function metricOriginAllowed(request) {
  const origin = request.headers.get("Origin") || "";
  return origin === "https://widget.imnotfound.eu.org"
    || origin === "https://zengyincen.github.io"
    || /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);
}

async function metricIdentity(request, env) {
  if (!env.METRICS_SALT) throw new Error("Metrics are not configured");
  const source = [
    request.headers.get("CF-Connecting-IP") || "unknown",
    (request.headers.get("User-Agent") || "unknown").slice(0, 320),
    (request.headers.get("Accept-Language") || "unknown").slice(0, 120),
  ].join("\n");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.METRICS_SALT),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(source));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function metricShard(env, identity) {
  const shard = Number.parseInt(identity[0], 16) % METRIC_SHARD_COUNT;
  return env.METRICS.getByName(`audience-${shard.toString(16)}`);
}

async function readMetricTotals(request, env) {
  const cache = caches.default;
  const cacheUrl = new URL("/metrics/.totals-v1", request.url);
  const cacheKey = new Request(cacheUrl, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return cached.json();
  const rows = await Promise.all(
    Array.from({ length: METRIC_SHARD_COUNT }, (_, index) => env.METRICS.getByName(`audience-${index.toString(16)}`).getCounts())
  );
  const totals = rows.reduce((result, row) => ({
    visitors: result.visitors + Number(row.visit || 0),
    users: result.users + Number(row.use || 0),
  }), { visitors: 0, users: 0 });
  const payload = { ...totals, updatedAt: new Date().toISOString() };
  await cache.put(cacheKey, Response.json(payload, { headers: { "Cache-Control": "public, max-age=300" } }));
  return payload;
}

function badge(data, kind) {
  const isVisitors = kind === "visitors";
  return Response.json({
    schemaVersion: 1,
    label: isVisitors ? "网站访问人数" : "组件使用人数",
    message: `${Number(data[kind] || 0).toLocaleString("zh-CN")} 人`,
    color: isVisitors ? "f38020" : "20201e",
    namedLogo: "cloudflare",
    logoColor: "white",
    cacheSeconds: 300,
  }, {
    headers: {
      ...corsHeaders(),
      "Cache-Control": "public, max-age=300",
    },
  });
}

function actionPage(action, state) {
  const labels = { feed: "已投喂", water: "已喂水", pet: "已抚摸" };
  const title = state.accepted ? labels[action] : state.message || "暂时不用再照顾";
  const note = state.accepted ? "状态已同步到所有嵌入页面。" : state.cooldown ? "每两小时可喂食、喂水各一次。" : "稍等一下再试试。";
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>${title}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f2ee;color:#20201e;font-family:-apple-system,BlinkMacSystemFont,sans-serif}.c{width:min(82vw,320px);padding:36px;border-radius:22px;background:white;text-align:center;box-shadow:0 24px 70px #0002}.f{font:30px monospace;animation:b 1s infinite alternate}h1{font-size:20px}p{font-size:12px;color:#777}button{border:0;border-radius:11px;background:#20201e;color:white;padding:10px 16px}@keyframes b{to{transform:translateY(-5px)}}</style><main class="c"><div class="f">/ᐠ˵- ᴗ -˵ᐟ\\</div><h1>${title}</h1><p>${note}</p><button onclick="window.close();history.back()">关闭</button></main><script>setTimeout(()=>{window.close();if(history.length>1)history.back()},1500)<\/script></html>`;
}

function actionPageHeaders() {
  return {
    ...corsHeaders(),
    "Content-Type": "text/html; charset=utf-8",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
  };
}

function unwrapRecord(record) {
  let value = record;
  for (let i = 0; i < 4 && value && typeof value === "object" && value.value && typeof value.value === "object"; i += 1) value = value.value;
  return value;
}

function parsePublicNotionUrl(raw) {
  const url = new URL(raw);
  const host = url.hostname.toLowerCase();
  if (!(host === "notion.so" || host.endsWith(".notion.so") || host.endsWith(".notion.site"))) throw new Error("Only public notion.so/notion.site URLs are allowed");
  const compact = decodeURIComponent(url.pathname).match(/[a-f0-9]{32}/i)?.[0];
  const hyphenated = decodeURIComponent(url.pathname).match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i)?.[0];
  const id = hyphenated || (compact && `${compact.slice(0,8)}-${compact.slice(8,12)}-${compact.slice(12,16)}-${compact.slice(16,20)}-${compact.slice(20)}`);
  if (!id) throw new Error("No Notion page ID found in URL");
  return { host, pageId: id.toLowerCase() };
}

async function notionPost(host, endpoint, body, headers = {}) {
  const response = await fetch(`https://${host}/api/v3/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Public Notion request failed (${response.status})`);
  return response.json();
}

function deepFind(value, predicate) {
  if (predicate(value)) return value;
  if (Array.isArray(value)) for (const item of value) { const found = deepFind(item, predicate); if (found !== undefined) return found; }
  else if (value && typeof value === "object") for (const item of Object.values(value)) { const found = deepFind(item, predicate); if (found !== undefined) return found; }
  return undefined;
}

function propertyNumber(value, schemaType) {
  if (schemaType === "checkbox") {
    const text = JSON.stringify(value ?? null).toLowerCase();
    return text.includes("yes") || text.includes("true") ? 1 : 0;
  }
  const primitive = deepFind(value, (item) => typeof item === "number" || (typeof item === "string" && /^-?\d+(\.\d+)?$/.test(item.trim())));
  return Number(primitive) || 0;
}

function propertyDate(value) {
  if (typeof value === "number" && Number.isFinite(value)) return new Date(value).toISOString().slice(0, 10);
  const dateObject = deepFind(value, (item) => item && typeof item === "object" && (typeof item.start_date === "string" || typeof item.start === "string"));
  const raw = dateObject?.start_date || dateObject?.start;
  if (raw) return String(raw).slice(0, 10);
  const text = deepFind(value, (item) => typeof item === "string" && /^\d{4}-\d{2}-\d{2}/.test(item));
  return text ? text.slice(0, 10) : null;
}

function propertyValue(row, column) {
  if (column.type === "created_time") return row.created_time;
  if (column.type === "last_edited_time") return row.last_edited_time;
  return row.properties?.[column.id];
}

async function readPublicCollection(pageUrl) {
  const { host, pageId } = parsePublicNotionUrl(pageUrl);
  const chunk = await notionPost(host, "loadPageChunk", { pageId, limit: 100, chunkNumber: 0, cursor: { stack: [] }, verticalColumns: false });
  const map = chunk.recordMap;
  if (!map?.block) throw new Error("Page is not public or is not a database");
  const blocks = Object.values(map.block).map(unwrapRecord).filter(Boolean);
  const collectionBlock = blocks.find((block) => block.id === pageId && ["collection_view", "collection_view_page"].includes(block.type)) || blocks.find((block) => ["collection_view", "collection_view_page"].includes(block.type));
  if (!collectionBlock?.collection_id || !collectionBlock.view_ids?.[0]) throw new Error("No public database found on this page");
  const collectionId = collectionBlock.collection_id;
  const viewId = collectionBlock.view_ids[0];
  const collection = unwrapRecord(map.collection?.[collectionId]);
  const view = unwrapRecord(map.collection_view?.[viewId]);
  if (!collection?.schema) throw new Error("Public database schema is unavailable");
  const filters = [...(view?.format?.property_filters || []).map((item) => ({ filter: item?.filter?.filter, property: item?.filter?.property }))];
  if (view?.query2?.filter?.filters) filters.push(...view.query2.filter.filters);
  const loader = {
    type: "reducer",
    reducers: { collection_group_results: { type: "results", limit: 1000, loadContentCover: false } },
    sort: [],
    ...(view?.query2 || {}),
    filter: { filters, operator: "and" },
    searchQuery: "",
    userTimeZone: "UTC",
  };
  const query = await notionPost(host, "queryCollection?src=initial_load", {
    collection: { id: collectionId }, collectionView: { id: viewId }, source: { type: "collection", id: collectionId }, loader,
  }, collectionBlock.space_id ? { "x-notion-space-id": collectionBlock.space_id } : {});
  const rows = Object.values(query.recordMap?.block || {}).map(unwrapRecord).filter((block) => block?.parent_id === collectionId && block?.properties);
  return { collection, rows, pageId, collectionId, viewId };
}

async function publicNotionData(url) {
  const pageUrl = url.searchParams.get("page");
  if (!pageUrl) throw new Error("Missing public Notion page URL");
  const { collection, rows } = await readPublicCollection(pageUrl);
  const columns = Object.entries(collection.schema).map(([id, property]) => ({ id, name: property.name, type: property.type }));
  const resolve = (name) => columns.find((column) => column.id === name || column.name === name);
  const mode = url.searchParams.get("mode") || "schema";
  if (mode === "schema") return { title: collection.name?.[0]?.[0] || "Public Notion database", rowCount: rows.length, columns };
  if (mode === "progress") {
    const current = resolve(url.searchParams.get("current") || "");
    const maximum = resolve(url.searchParams.get("max") || "");
    if (!current) throw new Error("Current-value property was not found");
    const value = rows.reduce((sum, row) => sum + propertyNumber(row.properties[current.id], current.type), 0);
    const max = maximum ? rows.reduce((sum, row) => sum + propertyNumber(row.properties[maximum.id], maximum.type), 0) : rows.length;
    return { label: url.searchParams.get("label") || collection.name?.[0]?.[0] || "Notion progress", value, max: Math.max(1, max), rowCount: rows.length, updatedAt: new Date().toISOString() };
  }
  if (mode === "heatmap") {
    const date = resolve(url.searchParams.get("date") || "");
    const amount = resolve(url.searchParams.get("value") || "");
    if (!date) throw new Error("Date property was not found");
    const heatData = {};
    for (const row of rows) {
      const day = propertyDate(propertyValue(row, date));
      if (!day) continue;
      heatData[day] = (heatData[day] || 0) + (amount ? propertyNumber(propertyValue(row, amount), amount.type) : 1);
    }
    return { label: url.searchParams.get("label") || collection.name?.[0]?.[0] || "Notion activity", heatData, rowCount: rows.length, updatedAt: new Date().toISOString() };
  }
  throw new Error("Unsupported public Notion mode");
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      if (request.method !== "GET") return json({ error: "GET required" }, 405);
      return json({ ok: true, service: "Notion Widget Box Cloud", storage: "Durable Objects", version: 2 });
    }
    if (url.pathname === "/metrics/track") {
      if (request.method !== "POST") return json({ error: "POST required" }, 405);
      if (!metricOriginAllowed(request)) return json({ error: "Origin not allowed" }, 403);
      try {
        const body = await request.json();
        if (!METRIC_KINDS.has(body?.kind)) return json({ error: "Unsupported metric kind" }, 400);
        const identity = await metricIdentity(request, env);
        await metricShard(env, identity).track(body.kind, identity);
        await caches.default.delete(new Request(new URL("/metrics/.totals-v1", request.url), { method: "GET" }));
        return json({ ok: true });
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : "Metric tracking failed" }, 503);
      }
    }
    if (url.pathname === "/metrics/stats" || url.pathname === "/metrics/badge/visitors" || url.pathname === "/metrics/badge/users") {
      if (request.method !== "GET") return json({ error: "GET required" }, 405);
      try {
        const totals = await readMetricTotals(request, env);
        if (url.pathname.endsWith("/visitors")) return badge(totals, "visitors");
        if (url.pathname.endsWith("/users")) return badge(totals, "users");
        return Response.json(totals, { headers: { ...corsHeaders(), "Cache-Control": "public, max-age=300" } });
      } catch {
        return json({ error: "Metrics are temporarily unavailable" }, 503);
      }
    }
    if (url.pathname === "/notion/public") {
      if (request.method !== "GET") return json({ error: "GET required" }, 405);
      try {
        const cache = caches.default;
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = json(await publicNotionData(url));
        response.headers.set("Cache-Control", "public, max-age=60");
        await cache.put(request, response.clone());
        return response;
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : "Public Notion read failed" }, 400);
      }
    }
    const match = url.pathname.match(/^\/pet\/([a-zA-Z0-9_-]{1,64})(?:\/action\/(feed|water|pet)|\/reset)?\/?$/);
    if (!match) return json({ error: "Not found" }, 404);
    const [, petId, action] = match;
    const stub = env.PETS.getByName(petId);
    try {
      if (action) {
        if (!["GET", "POST"].includes(request.method)) return json({ error: "GET or POST required" }, 405);
        const state = await stub.act(action);
        const wantsHtml = request.method === "GET" && !request.headers.get("accept")?.includes("application/json");
        return wantsHtml
          ? new Response(actionPage(action, state), { headers: actionPageHeaders() })
          : json(state);
      }
      if (url.pathname.endsWith("/reset")) {
        if (request.method !== "POST") return json({ error: "POST required" }, 405);
        const secret = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
        return json(await stub.reset(secret, env.RESET_SECRET));
      }
      if (request.method !== "GET") return json({ error: "GET required" }, 405);
      return json(await stub.getState());
    } catch (error) {
      const unauthorized = error instanceof Error && error.message === "Unauthorized";
      return json({ error: unauthorized ? "Unauthorized" : "Request failed" }, unauthorized ? 401 : 400);
    }
  },
};
