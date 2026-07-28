(function () {
  "use strict";

  const { components, categories, themes, layouts } = window.WIDGET_BOX;
  const fontCatalog = window.WIDGET_FONTS;
  const serviceConfig = window.WIDGET_BOX_SERVICE;
  const publicBase = (serviceConfig?.publicBase || location.origin).replace(/\/$/, "");
  const localPreviewBase = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname) ? location.origin : publicBase;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const featureCategories = [
    { id: "feature-progress", label: "进度条专区", icon: "▰", featured: true, componentIds: ["progress", "database-progress", "segmented-progress", "day-progress", "week-progress", "month-progress", "year-progress", "financial-goal", "savings-goal"] },
    { id: "feature-pet", label: "桌面宠物", icon: "◕", featured: true, componentIds: ["pet-companion"] },
    { id: "feature-music", label: "音乐播放器", icon: "♫", featured: true, componentIds: ["music-player", "vinyl-player", "cassette-player", "ambient-mixer"] }
  ];
  const displayCategories = [categories[0], ...featureCategories, ...categories.slice(1)];
  const categoryMap = Object.fromEntries([...categories, ...featureCategories].map((item) => [item.id, item]));
  const themeMap = Object.fromEntries(themes.map((item) => [item.id, item]));
  const layoutMap = Object.fromEntries(layouts.map((item) => [item.id, item]));
  const variants = components.flatMap((component, componentIndex) => themes.flatMap((theme) => layouts.map((layout) => ({
    id: `${component.id}--${theme.id}--${layout.id}`,
    component, theme, layout, componentIndex,
    search: [component.title, component.description, component.id, categoryMap[component.category].label, ...component.tags].join(" ").toLowerCase()
  }))));
  const variantMap = Object.fromEntries(variants.map((item) => [item.id, item]));
  const storedFavorites = readJSON("widgetBox.favorites", []).map((id) => variantMap[id]?.component.id || id).filter((id) => components.some((component) => component.id === id));

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
    favorites: new Set(storedFavorites),
    selected: null,
    config: {}, pendingVariant: null, petNeedsAdoption: false
  };

  const els = {
    search: $("#searchInput"), searchFeedback: $("#searchFeedback"), grid: $("#widgetGrid"), resultCount: $("#resultCount"), loadMore: $("#loadMore"), remaining: $("#remainingCount"), empty: $("#emptyState"),
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

  function trackAudience(kind) {
    if (!serviceConfig?.apiBase) return;
    const sessionKey = `widgetBox.metrics.${kind}.sent`;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");
    } catch {}
    fetch(`${serviceConfig.apiBase}/metrics/track`, {
      method: "POST",
      body: JSON.stringify({ kind }),
      keepalive: true,
    }).catch(() => {});
  }

  function init() {
    trackAudience("visit");
    $$('[data-total-components]').forEach((element) => { element.textContent = components.length.toLocaleString("zh-CN"); });
    $$('[data-total-variants]').forEach((element) => { element.textContent = variants.length.toLocaleString("zh-CN"); });
    $$('[data-total-fonts]').forEach((element) => { element.textContent = fontCatalog.total.toLocaleString("zh-CN"); });
    $$('[data-total-chinese-fonts]').forEach((element) => { element.textContent = fontCatalog.chineseTotal.toLocaleString("zh-CN"); });
    els.search.value = state.query;
    els.offline.checked = state.offline;
    els.sort.value = state.sort;
    renderFilterControls();
    bindEvents();
    render();
    localStorage.setItem("widgetBox.favorites", JSON.stringify([...state.favorites]));
    tickHeroClock();
    setInterval(tickHeroClock, 1000);
    const direct = initialUrl.searchParams.get("edit");
    if (direct) {
      const match = variantMap[direct];
      if (match) openCustomizer(match);
    }
  }

  function renderFilterControls() {
    els.categoryFilters.innerHTML = displayCategories.map((category) => {
      const count = category.id === "all" ? components.length : components.filter((item) => category.componentIds ? category.componentIds.includes(item.id) : item.category === category.id).length;
      return `<button class="filter-option ${category.featured ? "is-feature" : ""} ${state.category === category.id ? "is-active" : ""}" data-filter-category="${category.id}" type="button"><i>${category.icon}</i><span>${category.label}</span><b>${count}</b></button>`;
    }).join("");
    els.themeFilters.innerHTML = `<button class="filter-option ${state.theme === "all" ? "is-active" : ""}" data-filter-theme="all" type="button"><i style="--dot:linear-gradient(135deg,#ff8a65,#4f8cff)"></i><span>默认风格</span><b>${components.length}</b></button>` + themes.map((theme) => `<button class="filter-option ${state.theme === theme.id ? "is-active" : ""}" data-filter-theme="${theme.id}" type="button"><i style="--dot:${theme.accent}"></i><span>${theme.short}</span><b>${components.length}</b></button>`).join("");
    els.layoutFilters.innerHTML = `<button class="filter-option ${state.layout === "all" ? "is-active" : ""}" data-filter-layout="all" type="button"><i>◇</i><span>默认尺寸</span><b>${components.length}</b></button>` + layouts.map((layout) => `<button class="filter-option ${state.layout === layout.id ? "is-active" : ""}" data-filter-layout="${layout.id}" type="button"><i>${layout.id === "compact" ? "▬" : layout.id === "standard" ? "□" : "▭"}</i><span>${layout.label}</span><b>${components.length}</b></button>`).join("");
  }

  function bindEvents() {
    const runSearch = (scroll = false) => { state.query = els.search.value.trim(); state.shown = 24; render(); if (scroll) $("#library").scrollIntoView({ behavior: "smooth", block: "start" }); };
    els.search.addEventListener("input", debounce(() => runSearch(false), 100));
    $("#searchForm").addEventListener("submit", (event) => { event.preventDefault(); runSearch(true); });
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); els.search.focus(); els.search.select(); }
      if (event.key === "Escape" && $("#petSetup").open) $("#petSetup").close();
      else if (event.key === "Escape" && els.dialog.open) els.dialog.close();
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
      if (cardAction && !favorite) { const variant = variantMap[cardAction.dataset.customize]; if (variant) openCustomizer(variant); }
      if (previewSize && els.dialog.open) setPreviewSize(previewSize.dataset.size);
      if (preset && els.dialog.open) applyTheme(preset.dataset.preset);
      if (event.target.closest("[data-close]")) els.dialog.close();
    });
    $("#clearFilters").addEventListener("click", resetFilters);
    $("#emptyReset").addEventListener("click", resetFilters);
    els.offline.addEventListener("change", () => { state.offline = els.offline.checked; state.shown = 24; render(); });
    els.sort.addEventListener("change", () => { state.sort = els.sort.value; render(); });
    els.loadMore.addEventListener("click", () => { state.shown += 24; render(); });
    $("#surpriseButton").addEventListener("click", () => openCustomizer(catalogVariant(components[Math.floor(Math.random() * components.length)])));
    $("#petSetupForm").addEventListener("submit", createPetProfile);
    $("#closePetSetup").addEventListener("click", () => $("#petSetup").close());
    $("#petSetup").addEventListener("click", (event) => { if (event.target === $("#petSetup")) $("#petSetup").close(); });
    $("#fontSearch").addEventListener("input", (event) => renderFontOptions(event.target.value));
    $("#fontScope").addEventListener("change", () => renderFontOptions($("#fontSearch").value));
    els.form.addEventListener("input", debounce((event) => { if (event.target.id !== "fontSearch") readFormAndPreview(); }, 80));
    els.form.addEventListener("change", readFormAndPreview);
    $("#copyUrl").addEventListener("click", copyUrl);
    $("#footerCopy").addEventListener("click", copyUrl);
    $("#copyEmbed").addEventListener("click", () => copyText(`<iframe src="${els.shareUrl.value}" width="100%" height="300" frameborder="0" allow="clipboard-write"></iframe>`, "iframe 代码已复制"));
    $("#resetButton").addEventListener("click", () => { if (state.selected) setupCustomizer(state.selected, true); });
    document.addEventListener("click", (event) => {
      if (event.target.closest("#adoptPetButton")) beginPetAdoption();
      if (event.target.closest("#newPetButton")) createAnotherPet();
      if (event.target.closest("#copyFormula")) copyText($("#formulaOutput")?.value || "", "Notion 数据库公式已复制");
    });
    els.dialog.addEventListener("click", (event) => { if (event.target === els.dialog) els.dialog.close(); });
    window.addEventListener("message", (event) => {
      const trustedOrigins = new Set([location.origin, new URL(publicBase).origin]);
      if (!trustedOrigins.has(event.origin) || event.data?.type !== "notion-widget-box-data-url" || !state.selected) return;
      state.config.dataUrl = String(event.data.value || "");
      writeConfigToForm();
      updatePreview();
      copyText(state.config.dataUrl, "公开 Notion 数据已连接");
    });
  }

  function setFilter(key, value) { state[key] = value; state.shown = 24; renderFilterControls(); render(); }
  function catalogVariant(component) {
    const themeId = state.theme === "all" ? (themeMap.notion ? "notion" : themes[0].id) : state.theme;
    const layoutId = state.layout === "all" ? (layoutMap.standard ? "standard" : layouts[0].id) : state.layout;
    return variantMap[`${component.id}--${themeId}--${layoutId}`] || variants.find((item) => item.component.id === component.id);
  }
  function resetFilters() {
    Object.assign(state, { query: "", category: "all", theme: "all", layout: "all", quick: "all", offline: false, shown: 24 });
    els.search.value = ""; els.offline.checked = false; renderFilterControls(); render();
  }

  function getFiltered() {
    const words = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    let result = components.map(catalogVariant).filter((item) => {
      if (state.category !== "all") {
        const selectedCategory = categoryMap[state.category];
        if (selectedCategory?.componentIds ? !selectedCategory.componentIds.includes(item.component.id) : item.component.category !== state.category) return false;
      }
      if (state.offline && item.component.online) return false;
      if (words.some((word) => !item.search.includes(word))) return false;
      if (state.quick === "popular" && !item.component.popular) return false;
      if (state.quick === "new" && !item.component.isNew) return false;
      if (state.quick === "productivity" && !["focus", "data", "time"].includes(item.component.category)) return false;
      if (state.quick === "aesthetic" && !["media", "life", "info"].includes(item.component.category) && !item.component.tags.some((tag) => ["art", "艺术", "氛围", "photo"].includes(tag))) return false;
      if (state.quick === "interactive" && !item.component.interactive) return false;
      if (state.quick === "favorites" && !state.favorites.has(item.component.id)) return false;
      return true;
    });
    result.sort((a, b) => {
      if (state.sort === "name") return a.component.title.localeCompare(b.component.title, "zh-CN");
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
    els.searchFeedback.textContent = state.query ? `找到 ${filtered.length.toLocaleString("zh-CN")} 个` : `${filtered.length.toLocaleString("zh-CN")} 个组件`;
    els.searchFeedback.classList.toggle("is-empty", filtered.length === 0);
    els.grid.innerHTML = visible.map(cardTemplate).join("");
    els.grid.classList.toggle("list-view", state.view === "list");
    els.empty.hidden = filtered.length > 0;
    els.grid.hidden = filtered.length === 0;
    const remaining = Math.max(0, filtered.length - visible.length);
    els.loadMore.hidden = filtered.length === 0;
    els.loadMore.disabled = remaining === 0;
    els.loadMore.firstChild.textContent = remaining ? "加载更多 " : "已显示全部 ";
    els.remaining.textContent = remaining ? `(${remaining.toLocaleString("zh-CN")} 个)` : "";
    $$("[data-quick]").forEach((button) => button.classList.toggle("is-active", button.dataset.quick === state.quick));
    renderActiveFilters();
    syncUrl();
  }

  function cardTemplate(item) {
    const { component, theme } = item;
    const category = categoryMap[component.category];
    const isFavorite = state.favorites.has(component.id);
    return `<article class="widget-card" data-customize="${item.id}" style="--card-accent:${theme.accent}">
      <div class="card-preview">
        <div class="card-badges">${component.isNew ? '<span class="new">NEW</span>' : ""}${component.popular ? '<span>POPULAR</span>' : ""}${component.online ? '<span>LIVE</span>' : '<span>LOCAL</span>'}</div>
        <button class="favorite-button ${isFavorite ? "is-active" : ""}" data-favorite="${component.id}" type="button" aria-label="${isFavorite ? "取消收藏" : "收藏"}">${isFavorite ? "♥" : "♡"}</button>
        <div class="preview-glyph"><i>${component.icon}</i><strong>${escapeHtml(component.title)}</strong><small>${escapeHtml(category.label)}</small></div>
      </div>
      <div class="card-body"><div class="card-meta"><span>${category.label}</span><i title="${component.online ? "需要联网" : "离线可用"}"></i></div><h3>${escapeHtml(component.title)}</h3><p>${escapeHtml(component.description)}</p><div class="card-footer"><span>主题 · 尺寸 · 字体可调</span><button type="button">预览并定制 →</button></div></div>
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

  function openCustomizer(variant) {
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
      radius: theme.id === "notion" ? 16 : 18, scale: 100, padding: 28, border: true, shadow: true, transparent: false,
      font: "system", locale: "zh-CN", timezone: "Asia/Shanghai",
      ...(saved || {})
    };
    if (component.id === "pet-companion") {
      delete state.config.syncMode;
      delete state.config.syncUrl;
      delete state.config.githubRepo;
    }
    if (!saved || forceDefault) Object.assign(state.config, { theme: theme.id, layout: layout.id, bg: theme.bg, surface: theme.surface, text: theme.text, accent: theme.accent });
    $("#selectedIcon").textContent = component.icon;
    $("#selectedCategory").textContent = categoryMap[component.category].label;
    $("#selectedTitle").textContent = component.title;
    $("#selectedDescription").textContent = component.description;
    const petProfile = component.id === "pet-companion" ? readJSON("widgetBox.pet.profile", null) : null;
    state.petNeedsAdoption = component.id === "pet-companion" && !petProfile;
    const visibleFields = component.id === "pet-companion" && !petProfile ? component.fields.filter((field) => ["petType", "showNeeds"].includes(field.key)) : component.fields;
    const petAction = component.id !== "pet-companion" ? "" : petProfile
      ? '<button class="text-button" id="newPetButton" type="button">＋ 创建另一只独立宠物</button>'
      : '<div class="pet-adopt-callout"><strong>先看看它是否适合你</strong><span>选好宠物、主题和样式后，再创建专属名字。</span><button class="primary-button" id="adoptPetButton" type="button">喜欢这只，给它取名字 →</button></div>';
    const connectUrl = new URL("connect.html", `${publicBase}/`);
    connectUrl.searchParams.set("returnOrigin", location.origin);
    els.dynamicFields.innerHTML = (visibleFields.map(fieldTemplate).join("") || '<p class="field-note">这个组件无需额外内容设置。</p>') + petAction + (["database-progress", "heatmap"].includes(component.id) ? `<a class="notion-connect-link" href="${escapeHtml(connectUrl)}" target="_blank">安全连接 Notion 数据库 <span>↗</span></a>` : "") + (component.id === "database-progress" ? '<div class="formula-helper"><strong>Notion Formula 2.0</strong><textarea id="formulaOutput" rows="7" readonly></textarea><button class="text-button" id="copyFormula" type="button">复制数据库公式</button></div>' : "");
    els.presetGrid.innerHTML = themes.map((item) => `<button class="preset ${state.config.theme === item.id ? "is-active" : ""}" data-preset="${item.id}" type="button"><i style="--a:${item.bg};--b:${item.accent}"></i><span>${item.short}</span></button>`).join("");
    $("#layoutSelect").innerHTML = layouts.map((item) => `<option value="${item.id}">${item.label} · ${item.width}×${item.height}</option>`).join("");
    if (component.id === "pet-companion") {
      if (petProfile) Object.assign(state.config, petProfile);
    }
    ["#copyUrl", "#copyEmbed", "#footerCopy"].forEach((selector) => { $(selector).disabled = state.petNeedsAdoption; });
    $(".embed-box").classList.toggle("is-locked", state.petNeedsAdoption);
    $(".embed-box small").textContent = state.petNeedsAdoption ? "确认领养并创建独立身份后生成" : "在 Notion 中输入 /embed 后粘贴";
    $("#fontSearch").value = "";
    renderFontOptions();
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

  function renderFontOptions(query = "") {
    const select = $("#fontSelect");
    if (!select || !fontCatalog) return;
    const categoryLabels = { "Sans Serif": "黑体 / 无衬线", Serif: "衬线 / 宋体", Display: "艺术体", Handwriting: "手写体", Monospace: "等宽体" };
    const scriptLabels = { "chinese-simplified": "简体中文", "chinese-traditional": "繁体中文", japanese: "日文", korean: "韩文", arabic: "阿拉伯文", devanagari: "天城文", hebrew: "希伯来文", thai: "泰文", vietnamese: "越南文", cyrillic: "西里尔文", greek: "希腊文", tamil: "泰米尔文", bengali: "孟加拉文", ethiopic: "埃塞俄比亚文", khmer: "高棉文" };
    const needle = query.trim().toLowerCase();
    const scope = $("#fontScope")?.value || "zh";
    const chineseGoogle = (font) => font[2].some((script) => script.startsWith("chinese"));
    const systemMatches = fontCatalog.system.filter((font) => !needle || `${font[0]} ${font[1]} notion 默认 衬线 等宽`.toLowerCase().includes(needle));
    const chineseMatches = (scope === "international" ? [] : fontCatalog.chinese).filter((font) => {
      const haystack = [font.label, font.family, font.group, font.category, ...font.keywords, ...font.scripts, font.license, "中文 开源 可商用"].join(" ").toLowerCase();
      return !needle || haystack.includes(needle);
    });
    const googleMatches = fontCatalog.google.filter(([family, category, scripts]) => {
      const isChinese = scripts.some((script) => script.startsWith("chinese"));
      if (scope === "zh" && !isChinese) return false;
      if (scope === "international" && isChinese) return false;
      const haystack = [family, category, categoryLabels[category], ...scripts, ...scripts.map((script) => scriptLabels[script] || ""), "ofl 开源 可商用"].join(" ").toLowerCase();
      return !needle || haystack.includes(needle);
    });
    const systemMarkup = systemMatches.length ? `<optgroup label="Notion 内置字体">${systemMatches.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("")}</optgroup>` : "";
    const chineseGroupOrder = ["中文黑体", "中文宋体 / 仿宋", "中文楷体", "中文手写字体", "中文艺术字体", "中文圆体", "中文像素字体", "中文等宽字体"];
    const chineseMarkup = chineseGroupOrder.map((group) => {
      const fonts = chineseMatches.filter((font) => font.group === group);
      if (!fonts.length) return "";
      return `<optgroup label="${group}">${fonts.map((font) => `<option value="${escapeHtml(font.id)}">${escapeHtml(font.label)} · ${escapeHtml(font.family)}</option>`).join("")}</optgroup>`;
    }).join("");
    const groupOrder = ["Sans Serif", "Serif", "Display", "Handwriting", "Monospace"];
    const googleMarkup = groupOrder.map((category) => {
      const fonts = googleMatches.filter((font) => font[1] === category);
      if (!fonts.length) return "";
      return `<optgroup label="${categoryLabels[category]}">${fonts.map(([family, , scripts]) => { const language = scripts.map((script) => scriptLabels[script]).filter(Boolean).slice(0, 2).join(" / "); return `<option value="${escapeHtml(family)}">${escapeHtml(family)}${language ? ` · ${escapeHtml(language)}` : ""}</option>`; }).join("")}</optgroup>`;
    }).join("");
    select.innerHTML = systemMarkup + chineseMarkup + googleMarkup;
    const selected = state.config.font || "system";
    if (![...select.options].some((option) => option.value === selected)) {
      const currentChinese = fontCatalog.chinese.find((font) => font.id === selected);
      const current = [...fontCatalog.system, ...fontCatalog.google].find((font) => font[0] === selected);
      const currentLabel = currentChinese?.label || (fontCatalog.system.some((font) => font[0] === selected) ? current?.[1] : current?.[0]);
      if (currentLabel) select.insertAdjacentHTML("afterbegin", `<option value="${escapeHtml(selected)}" hidden>${escapeHtml(currentLabel)} · 当前使用</option>`);
    }
    select.value = selected;
    const visibleCount = chineseMatches.length + googleMatches.length;
    const scopeTotal = scope === "zh" ? fontCatalog.chineseTotal : scope === "international" ? fontCatalog.google.filter((font) => !chineseGoogle(font)).length : fontCatalog.total - fontCatalog.system.length;
    const scopeLabel = scope === "zh" ? "中文字体" : scope === "international" ? "国际字体" : "开源字体";
    $("#fontFeedback").textContent = `${visibleCount.toLocaleString("zh-CN")} / ${scopeTotal.toLocaleString("zh-CN")} 款${scopeLabel} · 可商用`;
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

  function widgetUrl(base = publicBase) {
    const url = new URL("widget.html", `${base}/`);
    url.searchParams.set("v", "20260728.2");
    url.searchParams.set("type", state.selected.component.id);
    Object.entries(state.config).forEach(([key, value]) => {
      if (["syncMode", "syncUrl", "githubRepo"].includes(key)) return;
      if (value !== "" && value !== undefined && value !== null) url.searchParams.set(key, String(value));
    });
    if (state.selected.component.id === "pet-companion" && state.petNeedsAdoption) url.searchParams.set("syncMode", "local");
    return url.toString();
  }

  function updatePreview() {
    if (!state.selected) return;
    const url = widgetUrl();
    $("#previewCanvas").classList.toggle("is-dark", state.config.theme === "midnight");
    els.frameWrap.style.background = state.config.theme === "midnight" ? "#000" : "#fff";
    els.shareUrl.value = state.petNeedsAdoption ? "请先确认领养并给宠物取名字" : url;
    const previewUrl = new URL(widgetUrl(localPreviewBase));
    previewUrl.searchParams.set("preview", "1");
    els.frame.src = previewUrl.toString();
  }

  async function copyText(text, message) {
    try { await navigator.clipboard.writeText(text); }
    catch { const temp = document.createElement("textarea"); temp.value = text; temp.style.position = "fixed"; temp.style.opacity = "0"; document.body.appendChild(temp); temp.select(); document.execCommand("copy"); temp.remove(); }
    els.toast.textContent = message; els.toast.classList.add("is-visible"); setTimeout(() => els.toast.classList.remove("is-visible"), 1700);
  }
  function copyUrl() { copyText(els.shareUrl.value, "Notion 嵌入链接已复制"); }
  function tickHeroClock() { const target = $("#heroClock"); if (target) target.textContent = new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()); }
  function timeoutFocus(selector) { setTimeout(() => $(selector)?.focus(), 120); }
  function beginPetAdoption() {
    state.pendingVariant = state.selected;
    $("#setupOwnerName").value = "";
    $("#setupPetName").value = "";
    if (!$("#petSetup").open) $("#petSetup").showModal();
    timeoutFocus("#setupOwnerName");
  }
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
    if (variant) {
      state.selected = variant;
      setupCustomizer(variant, false);
      if (!els.dialog.open) els.dialog.showModal();
    }
  }
  function createAnotherPet() {
    if (!confirm("创建新宠物会让定制器切换到新的独立身份；旧嵌入链接中的宠物不会被删除。继续吗？")) return;
    localStorage.removeItem("widgetBox.pet.profile");
    localStorage.removeItem("widgetBox.config.pet-companion");
    setupCustomizer(state.selected, true);
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
