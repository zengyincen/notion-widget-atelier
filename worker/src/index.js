import { DurableObject } from "cloudflare:workers";

const DEFAULT_STATE = Object.freeze({ food: 82, water: 76, love: 88 });
const ACTIONS = new Set(["feed", "water", "pet"]);

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
          last_action_at INTEGER NOT NULL DEFAULT 0
        )
      `);
    });
  }

  readStored() {
    return this.ctx.storage.sql.exec(
      "SELECT food, water, love, updated_at AS updatedAt, last_action_at AS lastActionAt FROM pet_state WHERE singleton = 1"
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
    };
  }

  ensureState(now = Date.now()) {
    const stored = this.readStored();
    if (stored) return stored;
    this.ctx.storage.sql.exec(
      "INSERT INTO pet_state (singleton, food, water, love, updated_at) VALUES (1, ?, ?, ?, ?)",
      DEFAULT_STATE.food, DEFAULT_STATE.water, DEFAULT_STATE.love, now,
    );
    return { ...DEFAULT_STATE, updatedAt: now, lastActionAt: 0 };
  }

  async getState() {
    const state = this.withDecay(this.ensureState());
    return { ...state, mood: Math.min(state.food, state.water, state.love) < 35 ? "needs-care" : "happy" };
  }

  async act(action) {
    if (!ACTIONS.has(action)) throw new Error("Unsupported action");
    const now = Date.now();
    const state = this.withDecay(this.ensureState(now), now);
    if (now - state.lastActionAt < 500) return { ...state, throttled: true };
    if (action === "feed") state.food = 100;
    if (action === "water") state.water = 100;
    if (action === "pet") state.love = 100;
    this.ctx.storage.sql.exec(
      "UPDATE pet_state SET food = ?, water = ?, love = ?, updated_at = ?, last_action_at = ? WHERE singleton = 1",
      state.food, state.water, state.love, now, now,
    );
    return { ...state, lastActionAt: now, action };
  }

  async reset(secret, expectedSecret) {
    if (!expectedSecret || secret !== expectedSecret) throw new Error("Unauthorized");
    const now = Date.now();
    this.ctx.storage.sql.exec(
      "INSERT OR REPLACE INTO pet_state (singleton, food, water, love, updated_at, last_action_at) VALUES (1, ?, ?, ?, ?, ?)",
      DEFAULT_STATE.food, DEFAULT_STATE.water, DEFAULT_STATE.love, now, now,
    );
    return { ...DEFAULT_STATE, updatedAt: now };
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

function actionPage(action, state) {
  const labels = { feed: "已经吃饱啦！", water: "喝到清水啦！", pet: "感到很安心！" };
  const title = labels[action] ?? "状态已更新";
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>${title}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f2ee;color:#20201e;font-family:-apple-system,BlinkMacSystemFont,sans-serif}.c{width:min(82vw,320px);padding:36px;border-radius:28px;background:white;text-align:center;box-shadow:0 24px 70px #0002}.f{font:30px monospace;animation:b 1s infinite alternate}h1{font-size:20px}p{font-size:12px;color:#777}button{border:0;border-radius:11px;background:#20201e;color:white;padding:10px 16px}@keyframes b{to{transform:translateY(-5px)}}</style><main class="c"><div class="f">/ᐠ˵- ᴗ -˵ᐟ\\</div><h1>${title}</h1><p>状态已同步到所有嵌入页面。</p><button onclick="window.close();history.back()">关闭</button></main><script>setTimeout(()=>{window.close();if(history.length>1)history.back()},1200)<\/script></html>`;
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
        const state = await stub.act(action);
        const wantsHtml = request.method === "GET" && !request.headers.get("accept")?.includes("application/json");
        return wantsHtml
          ? new Response(actionPage(action, state), { headers: { ...corsHeaders(), "Content-Type": "text/html; charset=utf-8" } })
          : json(state);
      }
      if (url.pathname.endsWith("/reset")) {
        if (request.method !== "POST") return json({ error: "POST required" }, 405);
        const secret = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
        return json(await stub.reset(secret, env.RESET_SECRET));
      }
      return json(await stub.getState());
    } catch (error) {
      const unauthorized = error instanceof Error && error.message === "Unauthorized";
      return json({ error: unauthorized ? "Unauthorized" : "Request failed" }, unauthorized ? 401 : 400);
    }
  },
};
