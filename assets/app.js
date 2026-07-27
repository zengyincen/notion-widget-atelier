(function () {
  "use strict";

  const { components, categories, themes, layouts } = window.WIDGET_BOX;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const categoryMap = Object.fromEntries(categories.map((item) => [item.id, item]));
  const themeMap = Object.fromEntries(themes.map((item) => [item.id, item]));
  const layoutMap = Object.fromEntries(layouts.map((item) => [item.id, item]));
  const variants = components.flatMap((component, componentIndex) => themes.flatMap((theme) => layouts.map((layout) => ({
    id: `${component.id}--${theme.id}--${layout.id}`,
    component, theme, layout, componentIndex,
    search: [component.title, component.description, component.id, categoryMap[component.category].label, theme.label, theme.short, layout.label, ...component.tags].join(" ").toLowerCase()
  }))));

  const initialUrl = new URL(location.href);
  const state = {
    query: initialUrl.searchParams.get("q") || "",
    category: initialUrl.searchParams.get("category") || "all",
    theme: initialUrl.searchParams.get("theme") || "all",
    layout: initialUrl.searchParams.get("layout") || "all",
    quick: initialUrl.searchParams.get("quick") || "all",
    offline: initialUrl.searchParams.get("offline") === "1",
    sort: initialUrl.searchParams.get("sort") || "recommended",
    shown: 24,
    view: "grid",
    favorites: new Set(readJSON("widgetBox.favorites", [])),
    selected: null,
    config: {}, pendingVariant: null
  };

  const els = {
    search: $("#searchInput"), grid: $("#widgetGrid"), resultCount: $("#resultCount"), loadMore: $("#loadMore"), remaining: $("#remainingCount"), empty: $("#emptyState"),
    categoryFilters: $("#categoryFilters"), themeFilters: $("#themeFilters"), layoutFilters: $("#layoutFilters"), offline: $("#offlineFilter"), sort: $("#sortSelect"), activeFilters: $("#activeFilters"),
    dialog: $("#customizer"), frame: $("#previewFrame"), frameWrap: $("#previewFrameWrap"), form: $("#controlForm"), dynamicFields: $("#dynamicFields"), presetGrid: $("#presetGrid"), shareUrl: $("#shareUrl"), toast: $("#toast")
  };

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  }
  function debounce(fn, delay = 160) {
    let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  }

  function init() {
    if (components.length * themes.length * layouts.length !== 1314) console.warn("Template registry count changed", variants.length);
    els.search.value = state.query;
    els.offline.checked = state.offline;
    els.sort.value = state.sort;
    renderFilterControls();
    bindEvents();
    render();
    tickHeroClock();
    setInterval(tickHeroClock, 1000);
    const direct = initialUrl.searchParams.get("edit");
    if (direct) {
      const match = variants.find((item) => item.id === direct);
      if (match) openCustomizer(match);
    }
  }

  function renderFilterControls() {
    els.categoryFilters.innerHTML = categories.map((category) => {
      const count = category.id === "all" ? variants.length : components.filter((item) => item.category === category.id).length * themes.length * layouts.length;
      return `<button class="filter-option ${state.category === category.id ? "is-active" : ""}" data-filter-category="${category.id}" type="button"><i>${category.icon}</i><span>${category.label}</span><b>${count}</b></button>`;
    }).join("");
    els.themeFilters.innerHTML = `<button class="filter-option ${state.theme === "all" ? "is-active" : ""}" data-filter-theme="all" type="button"><i style="--dot:linear-gradient(135deg,#ff8a65,#4f8cff)"></i><span>全部风格</span><b>${variants.length}</b></button>` + themes.map((theme) => `<button class="filter-option ${state.theme === theme.id ? "is-active" : ""}" data-filter-theme="${theme.id}" type="button"><i style="--dot:${theme.accent}"></i><span>${theme.short}</span><b>${components.length * layouts.length}</b></button>`).join("");
    els.layoutFilters.innerHTML = `<button class="filter-option ${state.layout === "all" ? "is-active" : ""}" data-filter-layout="all" type="button"><i>◇</i><span>全部尺寸</span><b>${variants.length}</b></button>` + layouts.map((layout) => `<button class="filter-option ${state.layout === layout.id ? "is-active" : ""}" data-filter-layout="${layout.id}" type="button"><i>${layout.id === "compact" ? "▬" : layout.id === "standard" ? "□" : "▭"}</i><span>${layout.label}</span><b>${components.length * themes.length}</b></button>`).join("");
  }

  function bindEvents() {
    els.search.addEventListener("input", debounce(() => { state.query = els.search.value.trim(); state.shown = 24; render(); }, 100));
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); els.search.focus(); els.search.select(); }
      if (event.key === "Escape" && els.dialog.open) els.dialog.close();
    });
    document.addEventListener("click", (event) => {
      const category = event.target.closest("[data-filter-category]");
      const theme = event.target.closest("[data-filter-theme]");
      const layout = event.target.closest("[data-filter-layout]");
      const quick = event.target.closest("[data-quick]");
      const cardAction = event.target.closest("[data-customize]");
      const favorite = event.target.closest("[data-favorite]");
      const view = event.target.closest("[data-view]");
      const previewSize = event.target.closest("[data-size]");
      const preset = event.target.closest("[data-preset]");
      if (category) setFilter("category", category.dataset.filterCategory);
      if (theme) setFilter("theme", theme.dataset.filterTheme);
      if (layout) setFilter("layout", layout.dataset.filterLayout);
      if (quick) setFilter("quick", quick.dataset.quick);
      if (view) { state.view = view.dataset.view; $$("[data-view]").forEach((b) => b.classList.toggle("is-active", b === view)); els.grid.classList.toggle("list-view", state.view === "list"); }
      if (favorite) { event.stopPropagation(); toggleFavorite(favorite.dataset.favorite); }
      if (cardAction) { const variant = variants.find((item) => item.id === cardAction.dataset.customize); if (variant) openCustomizer(variant); }
      if (previewSize && els.dialog.open) setPreviewSize(previewSize.dataset.size);
      if (preset && els.dialog.open) applyTheme(preset.dataset.preset);
      if (event.target.closest("[data-close]")) els.dialog.close();
    });
    $("#clearFilters").addEventListener("click", resetFilters);
    $("#emptyReset").addEventListener("click", resetFilters);
    els.offline.addEventListener("change", () => { state.offline = els.offline.checked; state.shown = 24; render(); });
    els.sort.addEventListener("change", () => { state.sort = els.sort.value; render(); });
    els.loadMore.addEventListener("click", () => { state.shown += 24; render(); });
    $("#surpriseButton").addEventListener("click", () => openCustomizer(variants[Math.floor(Math.random() * variants.length)]));
    $("#petSetupForm").addEventListener("submit", createPetProfile);
    els.form.addEventListener("input", debounce(readFormAndPreview, 80));
    els.form.addEventListener("change", readFormAndPreview);
    $("#copyUrl").addEventListener("click", copyUrl);
    $("#footerCopy").addEventListener("click", copyUrl);
    $("#copyEmbed").addEventListener("click", () => copyText(`<iframe src="${els.shareUrl.value}" width="100%" height="300" frameborder="0" allow="clipboard-write"></iframe>`, "iframe 代码已复制"));
    $("#resetButton").addEventListener("click", () => { if (state.selected) setupCustomizer(state.selected, true); });
    document.addEventListener("click", (event) => {
      if (event.target.closest("#newPetButton")) createAnotherPet();
      if (event.target.closest("#copyFormula")) copyText($("#formulaOutput")?.value || "", "Notion 数据库公式已复制");
    });
    els.dialog.addEventListener("click", (event) => { if (event.target === els.dialog) els.dialog.close(); });
    window.addEventListener("message", (event) => {
      if (event.origin !== location.origin || event.data?.type !== "notion-widget-box-data-url" || !state.selected) return;
      state.config.dataUrl = String(event.data.value || "");
      writeConfigToForm();
      updatePreview();
      copyText(state.config.dataUrl, "公开 Notion 数据已连接");
    });
  }

  function setFilter(key, value) { state[key] = value; state.shown = 24; renderFilterControls(); render(); }
  function resetFilters() {
    Object.assign(state, { query: "", category: "all", theme: "all", layout: "all", quick: "all", offline: false, shown: 24 });
    els.search.value = ""; els.offline.checked = false; renderFilterControls(); render();
  }

  function getFiltered() {
    const words = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    let result = variants.filter((item) => {
      if (state.category !== "all" && item.component.category !== state.category) return false;
      if (state.theme !== "all" && item.theme.id !== state.theme) return false;
      if (state.layout !== "all" && item.layout.id !== state.layout) return false;
      if (state.offline && item.component.online) return false;
      if (words.some((word) => !item.search.includes(word))) return false;
      if (state.quick === "popular" && !item.component.popular) return false;
      if (state.quick === "new" && !item.component.isNew) return false;
      if (state.quick === "productivity" && !["focus", "data", "time"].includes(item.component.category)) return false;
      if (state.quick === "aesthetic" && !["glass", "blush", "sage"].includes(item.theme.id)) return false;
      if (state.quick === "interactive" && !item.component.interactive) return false;
      if (state.quick === "favorites" && !state.favorites.has(item.id)) return false;
      return true;
    });
    result.sort((a, b) => {
      if (state.sort === "name") return a.component.title.localeCompare(b.component.title, "zh-CN") || a.theme.label.localeCompare(b.theme.label);
      if (state.sort === "category") return a.component.category.localeCompare(b.component.category) || a.componentIndex - b.componentIndex;
      if (state.sort === "newest") return Number(b.component.isNew) - Number(a.component.isNew) || b.component.added - a.component.added;
      return Number(b.component.popular) - Number(a.component.popular) || Number(b.component.isNew) - Number(a.component.isNew) || a.componentIndex - b.componentIndex;
    });
    return result;
  }

  function render() {
    const filtered = getFiltered();
    const visible = filtered.slice(0, state.shown);
    els.resultCount.textContent = filtered.length.toLocaleString("zh-CN");
    els.grid.innerHTML = visible.map(cardTemplate).join("");
    els.grid.classList.toggle("list-view", state.view === "list");
    els.empty.hidden = filtered.length > 0;
    els.grid.hidden = filtered.length === 0;
    const remaining = Math.max(0, filtered.length - visible.length);
    els.loadMore.hidden = filtered.length === 0;
    els.loadMore.disabled = remaining === 0;
    els.loadMore.firstChild.textContent = remaining ? "加载更多 " : "已显示全部 ";
    els.remaining.textContent = remaining ? `(${remaining.toLocaleString("zh-CN")} 款)` : "";
    $$("[data-quick]").forEach((button) => button.classList.toggle("is-active", button.dataset.quick === state.quick));
    renderActiveFilters();
    syncUrl();
  }

  function cardTemplate(item) {
    const { component, theme, layout } = item;
    const category = categoryMap[component.category];
    const isFavorite = state.favorites.has(item.id);
    return `<article class="widget-card theme-${theme.id} layout-${layout.id}" style="--card-bg:${theme.bg};--card-surface:${theme.surface};--card-text:${theme.text};--card-accent:${theme.accent}">
      <div class="card-preview">
        <div class="card-badges">${component.isNew ? '<span class="new">NEW</span>' : ""}${component.popular ? '<span>POPULAR</span>' : ""}${component.online ? '<span>LIVE</span>' : '<span>LOCAL</span>'}</div>
        <button class="favorite-button ${isFavorite ? "is-active" : ""}" data-favorite="${item.id}" type="button" aria-label="${isFavorite ? "取消收藏" : "收藏"}">${isFavorite ? "♥" : "♡"}</button>
        <div class="preview-glyph"><i>${component.icon}</i><strong>${escapeHtml(component.title)}</strong><small>${theme.short} · ${layout.label}</small></div>
      </div>
      <div class="card-body"><div class="card-meta"><span>${category.label}</span><i title="${component.online ? "需要联网" : "离线可用"}"></i></div><h3>${escapeHtml(component.title)} · ${theme.short}</h3><p>${escapeHtml(component.description)}</p><div class="card-footer"><span>${layout.label} · 可自定义</span><button type="button" data-customize="${item.id}">预览并定制 →</button></div></div>
    </article>`;
  }

  function renderActiveFilters() {
    const labels = [];
    if (state.category !== "all") labels.push(categoryMap[state.category]?.label);
    if (state.theme !== "all") labels.push(themeMap[state.theme]?.short);
    if (state.layout !== "all") labels.push(layoutMap[state.layout]?.label);
    if (state.offline) labels.push("仅离线");
    els.activeFilters.innerHTML = labels.filter(Boolean).map((label) => `<span>${escapeHtml(label)}</span>`).join("");
  }

  function syncUrl() {
    const url = new URL(location.href);
    ["q", "category", "theme", "layout", "quick", "offline", "sort"].forEach((key) => url.searchParams.delete(key));
    if (state.query) url.searchParams.set("q", state.query);
    if (state.category !== "all") url.searchParams.set("category", state.category);
    if (state.theme !== "all") url.searchParams.set("theme", state.theme);
    if (state.layout !== "all") url.searchParams.set("layout", state.layout);
    if (state.quick !== "all") url.searchParams.set("quick", state.quick);
    if (state.offline) url.searchParams.set("offline", "1");
    if (state.sort !== "recommended") url.searchParams.set("sort", state.sort);
    history.replaceState(null, "", url);
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
    localStorage.setItem("widgetBox.favorites", JSON.stringify([...state.favorites]));
    render();
  }

  function openCustomizer(variant, skipPetSetup = false) {
    if (variant.component.id === "pet-companion" && !skipPetSetup && !readJSON("widgetBox.pet.profile", null)) {
      state.pendingVariant = variant;
      $("#petSetup").showModal();
      timeoutFocus("#setupOwnerName");
      return;
    }
    state.selected = variant;
    setupCustomizer(variant, false);
    if (!els.dialog.open) els.dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    els.dialog.addEventListener("close", () => { document.documentElement.style.overflow = ""; }, { once: true });
    const recent = readJSON("widgetBox.recent", []).filter((id) => id !== variant.id); recent.unshift(variant.id); localStorage.setItem("widgetBox.recent", JSON.stringify(recent.slice(0, 12)));
  }

  function setupCustomizer(variant, forceDefault) {
    const { component, theme, layout } = variant;
    const saved = forceDefault ? null : readJSON(`widgetBox.config.${component.id}`, null);
    const defaults = Object.fromEntries(component.fields.map((field) => [field.key, defaultFieldValue(field)]));
    state.config = {
      ...defaults,
      theme: theme.id, layout: layout.id, align: "left", bg: theme.bg, surface: theme.surface, text: theme.text, accent: theme.accent,
      radius: theme.id === "notion" ? 22 : 28, scale: 100, padding: 28, border: true, shadow: true, transparent: false,
      locale: "zh-CN", timezone: "Asia/Shanghai",
      ...(saved || {})
    };
    if (!saved || forceDefault) Object.assign(state.config, { theme: theme.id, layout: layout.id, bg: theme.bg, surface: theme.surface, text: theme.text, accent: theme.accent });
    $("#selectedIcon").textContent = component.icon;
    $("#selectedCategory").textContent = categoryMap[component.category].label;
    $("#selectedTitle").textContent = component.title;
    $("#selectedDescription").textContent = component.description;
    els.dynamicFields.innerHTML = (component.fields.map(fieldTemplate).join("") || '<p class="field-note">这个组件无需额外内容设置。</p>') + (component.id === "pet-companion" ? '<button class="text-button" id="newPetButton" type="button">＋ 创建另一只独立宠物</button>' : "") + (["database-progress", "heatmap"].includes(component.id) ? '<a class="notion-connect-link" href="connect.html" target="_blank">安全连接 Notion 数据库 <span>↗</span></a>' : "") + (component.id === "database-progress" ? '<div class="formula-helper"><strong>Notion Formula 2.0</strong><textarea id="formulaOutput" rows="7" readonly></textarea><button class="text-button" id="copyFormula" type="button">复制数据库公式</button></div>' : "");
    els.presetGrid.innerHTML = themes.map((item) => `<button class="preset ${state.config.theme === item.id ? "is-active" : ""}" data-preset="${item.id}" type="button"><i style="--a:${item.bg};--b:${item.accent}"></i><span>${item.short}</span></button>`).join("");
    $("#layoutSelect").innerHTML = layouts.map((item) => `<option value="${item.id}">${item.label} · ${item.width}×${item.height}</option>`).join("");
    if (component.id === "pet-companion") {
      const profile = readJSON("widgetBox.pet.profile", null);
      if (profile) Object.assign(state.config, profile);
    }
    writeConfigToForm();
    setPreviewSize(state.config.layout);
    updatePreview();
  }

  function defaultFieldValue(field) {
    if (field.key === "target" && !field.value) { const date = new Date(Date.now() + 30 * 86400000); date.setSeconds(0, 0); return localDateTime(date); }
    if ((field.key === "startDate" || field.key === "endDate") && !field.value) { const date = new Date(); if (field.key === "endDate") date.setDate(date.getDate() + 30); return date.toISOString().slice(0, 10); }
    return field.value;
  }
  function localDateTime(date) { const offset = date.getTimezoneOffset() * 60000; return new Date(date - offset).toISOString().slice(0, 16); }

  function fieldTemplate(field) {
    const value = defaultFieldValue(field);
    if (field.type === "checkbox") return `<label class="check-field"><input data-key="${field.key}" type="checkbox" ${value ? "checked" : ""}/><span>${escapeHtml(field.label)}</span></label>`;
    if (field.type === "select") return `<label class="field"><span>${escapeHtml(field.label)}</span><select data-key="${field.key}">${field.options.map(([val, label]) => `<option value="${escapeHtml(val)}" ${String(val) === String(value) ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select></label>`;
    if (field.type === "textarea") return `<label class="field"><span>${escapeHtml(field.label)}</span><textarea data-key="${field.key}" rows="3" placeholder="${escapeHtml(field.placeholder)}">${escapeHtml(value)}</textarea></label>`;
    const attrs = field.type === "number" ? `min="${field.min}" max="${field.max}"` : "";
    return `<label class="field"><span>${escapeHtml(field.label)}</span><input data-key="${field.key}" type="${field.type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder)}" ${attrs} ${field.key === "petId" ? "readonly" : ""}/></label>`;
  }

  function writeConfigToForm() {
    $$('[data-key]', els.form).forEach((input) => {
      const value = state.config[input.dataset.key];
      if (value === undefined) return;
      if (input.type === "checkbox") input.checked = value === true || value === "true";
      else input.value = value;
    });
    updateOutputs();
    updateFormulaOutput();
  }

  function readFormAndPreview() {
    $$('[data-key]', els.form).forEach((input) => { state.config[input.dataset.key] = input.type === "checkbox" ? input.checked : input.value; });
    state.config.theme = state.config.theme || state.selected.theme.id;
    updateOutputs();
    updateFormulaOutput();
    setPreviewSize(state.config.layout, false);
    localStorage.setItem(`widgetBox.config.${state.selected.component.id}`, JSON.stringify(state.config));
    updatePreview();
  }

  function updateOutputs() {
    $("#radiusOutput").textContent = `${state.config.radius}px`;
    $("#scaleOutput").textContent = `${state.config.scale}%`;
    $("#paddingOutput").textContent = `${state.config.padding}px`;
  }

  function applyTheme(themeId) {
    const theme = themeMap[themeId]; if (!theme) return;
    Object.assign(state.config, { theme: theme.id, bg: theme.bg, surface: theme.surface, text: theme.text, accent: theme.accent });
    $$("[data-preset]").forEach((button) => button.classList.toggle("is-active", button.dataset.preset === themeId));
    writeConfigToForm(); updatePreview();
  }

  function setPreviewSize(size, updateConfig = true) {
    const valid = layoutMap[size] ? size : "standard";
    if (updateConfig) { state.config.layout = valid; const select = $("#layoutSelect"); if (select) select.value = valid; }
    els.frameWrap.className = `preview-frame ${valid}`;
    $$("#previewSizeSwitch [data-size]").forEach((button) => button.classList.toggle("is-active", button.dataset.size === valid));
    if (updateConfig && state.selected) updatePreview();
  }

  function widgetUrl() {
    const url = new URL("widget.html", location.href);
    url.searchParams.set("type", state.selected.component.id);
    Object.entries(state.config).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) url.searchParams.set(key, String(value));
    });
    return url.toString();
  }

  function updatePreview() {
    if (!state.selected) return;
    const url = widgetUrl();
    els.shareUrl.value = url;
    els.frame.src = url;
  }

  async function copyText(text, message) {
    try { await navigator.clipboard.writeText(text); }
    catch { const temp = document.createElement("textarea"); temp.value = text; temp.style.position = "fixed"; temp.style.opacity = "0"; document.body.appendChild(temp); temp.select(); document.execCommand("copy"); temp.remove(); }
    els.toast.textContent = message; els.toast.classList.add("is-visible"); setTimeout(() => els.toast.classList.remove("is-visible"), 1700);
  }
  function copyUrl() { copyText(els.shareUrl.value, "Notion 嵌入链接已复制"); }
  function tickHeroClock() { const target = $("#heroClock"); if (target) target.textContent = new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()); }
  function timeoutFocus(selector) { setTimeout(() => $(selector)?.focus(), 120); }
  function createPetProfile(event) {
    event.preventDefault();
    const ownerName = $("#setupOwnerName").value.trim();
    const petName = $("#setupPetName").value.trim();
    if (!ownerName || !petName) return;
    const randomId = crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 20)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    const profile = { ownerName, petName, petId: `pet-${randomId}` };
    localStorage.setItem("widgetBox.pet.profile", JSON.stringify(profile));
    $("#petSetup").close();
    const variant = state.pendingVariant || variants.find((item) => item.component.id === "pet-companion");
    state.pendingVariant = null;
    if (variant) openCustomizer(variant, true);
  }
  function createAnotherPet() {
    if (!confirm("创建新宠物会让定制器切换到新的独立身份；旧嵌入链接中的宠物不会被删除。继续吗？")) return;
    localStorage.removeItem("widgetBox.pet.profile");
    localStorage.removeItem("widgetBox.config.pet-companion");
    state.pendingVariant = state.selected;
    els.dialog.close();
    $("#setupOwnerName").value = "";
    $("#setupPetName").value = "";
    $("#petSetup").showModal();
    timeoutFocus("#setupOwnerName");
  }
  function updateFormulaOutput() {
    const output = $("#formulaOutput");
    if (!output) return;
    const clean = (value) => String(value || "").replace(/["\\]/g, "");
    const current = clean(state.config.currentProp || "已完成");
    const max = clean(state.config.maxProp || "总数");
    output.value = `lets(\n  done, toNumber(prop("${current}")),\n  total, max(1, toNumber(prop("${max}"))),\n  ratio, min(1, max(0, done / total)),\n  filled, floor(ratio * 10),\n  repeat("■", filled).style("blue") + repeat("□", 10 - filled).style("gray") + " " + format(round(ratio * 100)) + "%"\n)`;
  }

  init();
})();
