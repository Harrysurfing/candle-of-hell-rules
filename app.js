(() => {
  const data = window.RULES_DATA;
  const els = {
    main: document.getElementById("main"),
    nav: document.getElementById("nav"),
    q: document.getElementById("q"),
    clear: document.getElementById("clear"),
    empty: document.getElementById("empty"),
    disclaimer: document.getElementById("disclaimer"),
    faqs: document.getElementById("faqs"),
    tables: document.getElementById("tables"),
    glossary: document.getElementById("glossary"),
    resultBar: document.getElementById("resultBar"),
    flow: document.getElementById("flow"),
    toTop: document.getElementById("toTop"),
  };

  els.disclaimer.textContent = data.meta.disclaimer;

  const MODE_LABEL = { story: "故事模式", adventure: "冒险模式" };

  const ICONS = {
    candle: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c1.2 2.2.6 3.8 0 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><ellipse cx="12" cy="5.2" rx="1.5" ry="2.4" fill="currentColor" opacity=".85"/><path d="M9.5 9.5h5v9.2a2.5 2.5 0 0 1-5 0V9.5Z" stroke="currentColor" stroke-width="1.7"/><path d="M8 21h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 6.5c-1.8-1.4-4.2-1.8-6.5-1.2v12.2c2.4-.7 4.8-.3 6.5 1.2 1.7-1.5 4.1-1.9 6.5-1.2V5.3c-2.3-.6-4.7-.2-6.5 1.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 6.8v11.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    lantern: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v2.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.2 5.4h7.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M7.4 8.2h9.2v7.4c0 2.2-2.1 3.8-4.6 3.8s-4.6-1.6-4.6-3.8V8.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 10.2v3.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.2 20.6h7.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    bagua: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.2" stroke="currentColor" stroke-width="1.7"/><path d="M12 12a2.4 2.4 0 1 0-2.4-2.4A2.4 2.4 0 0 1 12 12a2.4 2.4 0 1 0 2.4 2.4A2.4 2.4 0 0 1 12 12Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="9.6" r=".7" fill="currentColor"/><circle cx="12" cy="14.4" r=".7" fill="currentColor"/></svg>`,
    chain: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.8" y="3.8" width="7.2" height="7.2" rx="2.2" transform="rotate(-45 7.4 7.4)" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="13" width="7.2" height="7.2" rx="2.2" transform="rotate(-45 16.6 16.6)" stroke="currentColor" stroke-width="1.7"/><path d="M9.4 9.4l5.2 5.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    scroll: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 5.5h9.2a2.3 2.3 0 0 1 0 4.6H8.2A2.2 2.2 0 0 0 6 12.3v5.2A2.2 2.2 0 0 0 8.2 19.7H18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M7 5.5A2.2 2.2 0 0 0 4.8 7.7v.6A2.2 2.2 0 0 0 7 10.5" stroke="currentColor" stroke-width="1.7"/><path d="M10 13.4h5.2M10 16.2h4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  };

  const state = {
    mode: "story",
    section: "all",
    query: "",
  };

  function inModes(item, mode) {
    const modes = item.modes || ["story", "adventure"];
    return modes.includes(mode);
  }

  function sectionsFor(mode) {
    return data.sections.filter((s) => inModes(s, mode));
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function termsOf(query) {
    return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  }

  function haystack(card, section) {
    return [
      card.title,
      section.title,
      ...(card.tags || []),
      ...(card.aliases || []),
      ...(card.body || []),
    ]
      .join("\n")
      .toLowerCase();
  }

  function matchesTerms(text, terms) {
    return terms.every((t) => text.toLowerCase().includes(t));
  }

  function highlight(text, query) {
    const safe = escapeHtml(text);
    const parts = termsOf(query);
    if (!parts.length) return safe;
    const re = new RegExp(`(${parts.map(escapeRegExp).join("|")})`, "gi");
    return safe.replace(re, '<mark class="mark">$1</mark>');
  }

  function cardInMode(card, section, mode) {
    if (!inModes(section, mode)) return false;
    if (card.modes) return inModes(card, mode);
    return true;
  }

  function cardVisible(card, section) {
    if (!cardInMode(card, section, state.mode)) return false;
    const terms = termsOf(state.query);
    if (terms.length) return matchesTerms(haystack(card, section), terms);
    return state.section === "all" || section.id === state.section;
  }

  function countModeHits(mode) {
    const terms = termsOf(state.query);
    if (!terms.length) return 0;
    let n = 0;
    for (const section of data.sections) {
      for (const card of section.cards) {
        if (cardInMode(card, section, mode) && matchesTerms(haystack(card, section), terms)) n += 1;
      }
    }
    for (const item of data.glossary) {
      if (inModes(item, mode) && matchesTerms([item.term, ...(item.aliases || []), item.def].join("\n"), terms)) n += 1;
    }
    for (const table of data.tables) {
      if (
        inModes(table, mode) &&
        matchesTerms([table.title, table.caption || "", ...table.headers, ...table.rows.flat()].join("\n"), terms)
      ) {
        n += 1;
      }
    }
    return n;
  }

  function writeUrl() {
    const params = new URLSearchParams();
    params.set("mode", state.mode);
    if (state.query) params.set("q", state.query);
    if (state.section !== "all") params.set("sec", state.section);
    history.replaceState(null, "", `${location.pathname}?${params.toString()}${location.hash || ""}`);
  }

  function setMode(mode, { keepQuery = false } = {}) {
    state.mode = mode;
    if (!keepQuery) {
      state.query = "";
      els.q.value = "";
    }
    if (state.section !== "all" && !sectionsFor(mode).some((s) => s.id === state.section)) {
      state.section = "all";
    }
    document.body.classList.toggle("mode-story", mode === "story");
    document.body.classList.toggle("mode-adventure", mode === "adventure");
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      const on = btn.dataset.mode === mode;
      btn.setAttribute("aria-selected", String(on));
    });
    try {
      localStorage.setItem("candle-mode", mode);
    } catch {
      /* ignore */
    }
    renderNav();
    renderFaqs();
    apply();
    writeUrl();
  }

  function renderNav() {
    els.nav.replaceChildren();
    const items = [{ id: "all", title: "本模式" }, ...sectionsFor(state.mode).map((s) => ({ id: s.id, title: s.title }))];
    for (const item of items) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item.title;
      btn.className = item.id === state.section ? "active" : "";
      btn.setAttribute("aria-pressed", String(item.id === state.section));
      btn.addEventListener("click", () => {
        state.section = item.id;
        if (state.query) {
          state.query = "";
          els.q.value = "";
        }
        renderNav();
        apply();
        writeUrl();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      els.nav.appendChild(btn);
    }
  }

  function renderFaqs() {
    els.faqs.replaceChildren();
    for (const faq of data.faqs.filter((f) => inModes(f, state.mode))) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = faq.q;
      btn.addEventListener("click", () => {
        state.section = "all";
        state.query = faq.query;
        els.q.value = faq.query;
        renderNav();
        apply();
        writeUrl();
        els.q.focus();
      });
      els.faqs.appendChild(btn);
    }
  }

  function renderTables() {
    els.tables.replaceChildren();
    for (const table of data.tables) {
      const article = document.createElement("article");
      article.className = "sheet";
      article.id = `table-${table.id}`;
      article.dataset.modes = (table.modes || ["story", "adventure"]).join(",");
      article.innerHTML = `
        <h2></h2>
        ${table.caption ? `<p class="caption"></p>` : ""}
        <div class="table-wrap">
          <table>
            <thead><tr>${table.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
            <tbody>
              ${table.rows
                .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
                .join("")}
            </tbody>
          </table>
        </div>
      `;
      article.querySelector("h2").textContent = table.title;
      if (table.caption) article.querySelector(".caption").textContent = table.caption;
      els.tables.appendChild(article);
    }
  }

  function renderGlossary() {
    const wrap = document.createElement("article");
    wrap.className = "sheet glossary-sheet";
    wrap.id = "sec-glossary";
    wrap.innerHTML = `<h2>术语</h2><dl id="glossaryList"></dl>`;
    els.glossary.replaceChildren(wrap);
    const dl = wrap.querySelector("#glossaryList");
    data.glossary.forEach((item, i) => {
      const dt = document.createElement("dt");
      dt.dataset.index = String(i);
      dt.textContent = item.term;
      const dd = document.createElement("dd");
      dd.dataset.index = String(i);
      dd.dataset.raw = item.def;
      dd.dataset.search = [item.term, ...(item.aliases || []), item.def].join("\n");
      dd.textContent = item.def;
      dl.append(dt, dd);
    });
  }

  function renderCards() {
    els.main.replaceChildren();
    for (const section of data.sections) {
      const sec = document.createElement("section");
      sec.className = "section";
      sec.id = `sec-${section.id}`;
      sec.dataset.modes = (section.modes || ["story", "adventure"]).join(",");

      const head = document.createElement("div");
      head.className = "section-head";
      head.innerHTML = `<span class="badge">${ICONS[section.icon] || ICONS.candle}</span><h2></h2>`;
      head.querySelector("h2").textContent = section.title;
      sec.appendChild(head);

      const grid = document.createElement("div");
      grid.className = "cards";

      for (const card of section.cards) {
        const article = document.createElement("article");
        article.className = `card${card.pin ? " pin" : ""}`;
        article.id = `card-${card.id}`;
        article.dataset.cardId = card.id;
        article.dataset.section = section.id;

        const tags = [
          ...(card.pin ? ['<span class="tag pin-tag">必记</span>'] : []),
          ...(card.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`),
        ].join("");

        article.innerHTML = `
          <button class="card-btn" type="button" aria-expanded="false">
            <div>
              <h3 class="card-title"></h3>
              <div class="card-tags">${tags}</div>
            </div>
            <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="card-body"><ul></ul></div>
        `;

        article.querySelector(".card-title").textContent = card.title;
        const ul = article.querySelector("ul");
        for (const line of card.body) {
          const li = document.createElement("li");
          li.dataset.raw = line;
          li.textContent = line;
          ul.appendChild(li);
        }

        article.querySelector(".card-btn").addEventListener("click", () => {
          const open = article.classList.toggle("open");
          article.querySelector(".card-btn").setAttribute("aria-expanded", String(open));
        });

        grid.appendChild(article);
      }

      sec.appendChild(grid);
      els.main.appendChild(sec);
    }
  }

  function apply() {
    const query = state.query.trim();
    const terms = termsOf(query);
    els.clear.hidden = !query;

    let cardHits = 0;
    let glossHits = 0;
    let tableHits = 0;

    for (const section of data.sections) {
      const secEl = document.getElementById(`sec-${section.id}`);
      let shown = 0;
      for (const card of section.cards) {
        const el = secEl.querySelector(`[data-card-id="${card.id}"]`);
        const show = cardVisible(card, section);
        el.classList.toggle("hidden", !show);
        if (!show) continue;
        shown += 1;
        cardHits += 1;
        el.querySelector(".card-title").innerHTML = highlight(card.title, query);
        el.querySelectorAll("li").forEach((li) => {
          li.innerHTML = highlight(li.dataset.raw, query);
        });
        if (terms.length) {
          el.classList.add("open");
          el.querySelector(".card-btn").setAttribute("aria-expanded", "true");
        }
      }
      secEl.hidden = shown === 0;
    }

    const glossWrap = document.querySelector(".glossary-sheet");
    const showGlossaryBlock = Boolean(terms.length) || state.section === "all";
    data.glossary.forEach((item, i) => {
      const dt = els.glossary.querySelectorAll("dt")[i];
      const dd = els.glossary.querySelectorAll("dd")[i];
      const show =
        showGlossaryBlock &&
        inModes(item, state.mode) &&
        (!terms.length || matchesTerms(dd.dataset.search, terms));
      dt.hidden = !show;
      dd.hidden = !show;
      if (!show) return;
      glossHits += 1;
      dt.innerHTML = highlight(item.term, query);
      dd.innerHTML = highlight(item.def, query);
    });
    if (glossWrap) glossWrap.hidden = glossHits === 0;

    data.tables.forEach((table, i) => {
      const sheet = els.tables.children[i];
      const blob = [table.title, table.caption || "", ...table.headers, ...table.rows.flat()].join("\n");
      const show =
        inModes(table, state.mode) &&
        ((terms.length && matchesTerms(blob, terms)) ||
          (!terms.length && (state.section === "all" || state.section === "adventure" || state.section === "checks")));
      sheet.hidden = !show;
      if (show) {
        tableHits += 1;
        sheet.querySelector("h2").innerHTML = highlight(table.title, query);
      }
    });

    const searching = Boolean(terms.length);
    els.flow.hidden = searching || state.section !== "all";
    els.faqs.parentElement.hidden = searching || state.section !== "all";

    const total = cardHits + glossHits + tableHits;
    els.empty.classList.toggle("show", total === 0);

    const other = state.mode === "story" ? "adventure" : "story";
    const otherHits = searching ? countModeHits(other) : 0;

    if (searching) {
      els.resultBar.hidden = false;
      els.resultBar.replaceChildren();
      els.resultBar.append(`${MODE_LABEL[state.mode]}中找到 ${total} 条`);
      if (otherHits) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = `在${MODE_LABEL[other]}中还有 ${otherHits} 条`;
        btn.addEventListener("click", () => setMode(other, { keepQuery: true }));
        els.resultBar.append(" · ", btn);
      }
    } else if (state.section !== "all") {
      els.resultBar.hidden = false;
      els.resultBar.textContent = `${MODE_LABEL[state.mode]} · ${
        sectionsFor(state.mode).find((s) => s.id === state.section)?.title || ""
      }`;
    } else {
      els.resultBar.hidden = true;
    }
  }

  function setQuery(value) {
    state.query = value;
    if (value.trim()) state.section = "all";
    renderNav();
    apply();
    writeUrl();
  }

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  els.q.addEventListener("input", () => setQuery(els.q.value));
  els.clear.addEventListener("click", () => {
    els.q.value = "";
    setQuery("");
    els.q.focus();
  });

  document.getElementById("expandPins").addEventListener("click", () => {
    document.querySelectorAll(".card.pin:not(.hidden)").forEach((el) => {
      el.classList.add("open");
      el.querySelector(".card-btn")?.setAttribute("aria-expanded", "true");
    });
  });

  document.getElementById("collapseAll").addEventListener("click", () => {
    document.querySelectorAll(".card.open").forEach((el) => {
      el.classList.remove("open");
      el.querySelector(".card-btn")?.setAttribute("aria-expanded", "false");
    });
  });

  els.toTop.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== els.q && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      els.q.focus();
      els.q.select();
    }
    if (e.key === "Escape" && (state.query || document.activeElement === els.q)) {
      els.q.value = "";
      setQuery("");
      els.q.blur();
    }
  });

  const params = new URLSearchParams(location.search);
  let startMode = params.get("mode");
  if (startMode !== "story" && startMode !== "adventure") {
    try {
      startMode = localStorage.getItem("candle-mode");
    } catch {
      startMode = null;
    }
  }
  if (startMode !== "story" && startMode !== "adventure") startMode = "story";
  state.mode = startMode;
  if (params.get("q")) {
    state.query = params.get("q");
    els.q.value = state.query;
    state.section = "all";
  } else if (params.get("sec") && sectionsFor(state.mode).some((s) => s.id === params.get("sec"))) {
    state.section = params.get("sec");
  }

  renderTables();
  renderGlossary();
  renderCards();
  setMode(state.mode, { keepQuery: Boolean(state.query) });

  const hash = location.hash.replace("#", "");
  if (hash) {
    const target = document.getElementById(hash);
    if (target) {
      target.classList.add("open");
      target.querySelector(".card-btn")?.setAttribute("aria-expanded", "true");
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }
})();
