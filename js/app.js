/* ============================================================
   app.js — Portfolio application logic
   Sections:
     1. Utilities & state
     2. Theme toggle
     3. Navigation (mobile, scroll spy, navbar shadow)
     4. Auth (admin unlock)
     5. Rendering (hobbies, pcto, civic, portfolio)
     6. Search & filtering
     7. Content management (add / edit / delete + uploads)
     8. Lightbox, contact form, stats counter, scroll reveal
   ============================================================ */

(function () {
  "use strict";

  const { Store } = window.PortfolioData;
  const ADMIN_PASSWORD = "admin123"; // demo only — client-side gate
  const AUTH_KEY = "portfolio_admin";

  let data = Store.load();
  let isAdmin = sessionStorage.getItem(AUTH_KEY) === "1";

  /* ---------- 1. Utilities ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const uid = () => "x" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // Escape user text before injecting into innerHTML
  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function toast(message, type = "success") {
    const wrap = $("#toastWrap");
    const el = document.createElement("div");
    el.className = "toast " + type;
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      setTimeout(() => el.remove(), 250);
    }, 2800);
  }

  function persist() { Store.save(data); }

  // Read a File into a base64 data URL
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ---------- 2. Theme ---------- */
  function initTheme() {
    const saved = localStorage.getItem("portfolio_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("bg-background", true);
  }
  $("#themeToggle").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("portfolio_theme", next);
  });

  /* ---------- 3. Navigation ---------- */
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  // close mobile menu on link click
  $$("#navLinks a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  const navbar = $("#navbar");
  const sections = $$("main section[id]");
  function onScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
    let current = "";
    const pos = window.scrollY + 120;
    sections.forEach((s) => { if (s.offsetTop <= pos) current = s.id; });
    $$("#navLinks a").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 4. Auth ---------- */
  function applyAuthState() {
    // Auth removed - admin functionality disabled
  }

  /* ---------- 5. Rendering ---------- */
  const adminActions = (type, id) => `
    <div class="admin-card-actions">
      <button class="icon-btn" type="button" data-edit="${type}" data-id="${id}" aria-label="Modifica">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="icon-btn" type="button" data-delete="${type}" data-id="${id}" aria-label="Elimina">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>`;

  function renderHobbies() {
    const grid = $("#hobbiesGrid");
    if (!data.hobbies.length) { grid.innerHTML = emptyState("Ancora nessun hobby."); return; }
    grid.innerHTML = data.hobbies.map((h) => `
      <article class="card reveal">
        <div class="card-media">
          ${adminActions("hobby", h.id)}
          <img src="${esc(h.image)}" alt="${esc(h.title)}" loading="lazy" />
        </div>
        <div class="card-body">
          <h3>${esc(h.title)}</h3>
          <p>${esc(h.description)}</p>
        </div>
      </article>`).join("");
    observeReveals();
  }

  function expItemHTML(type, item) {
    const imgs = (item.images || []).map((src, i) =>
      `<img src="${esc(src)}" alt="${esc(item.title)} image ${i + 1}" loading="lazy" data-lightbox="${esc(src)}" />`).join("");
    const files = (item.files || []).map((f) =>
      `<a class="file-link" href="${esc(f.data)}" download="${esc(f.name)}" target="_blank" rel="noopener">
         <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
         ${esc(f.name)}
       </a>`).join("");
    return `
      <article class="exp-item reveal">
        ${isAdmin ? `<div class="admin-card-actions" style="display:flex;position:static;justify-content:flex-end;margin-bottom:8px;">
          <button class="icon-btn" type="button" data-edit="${type}" data-id="${item.id}" aria-label="Edit"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="icon-btn" type="button" data-delete="${type}" data-id="${item.id}" aria-label="Delete"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>` : ""}
        <div class="exp-head">
          <div>
            <h3>${esc(item.title)}</h3>
            <span class="exp-org">${esc(item.org)}</span>
          </div>
          <span class="exp-date">${esc(item.date)}</span>
        </div>
        <p class="exp-desc">${esc(item.description)}</p>
        ${imgs ? `<div class="exp-gallery">${imgs}</div>` : ""}
        ${files ? `<div class="exp-files">${files}</div>` : ""}
      </article>`;
  }

  function renderExp(type, listId, searchVal = "") {
    const list = $(listId);
    const q = searchVal.trim().toLowerCase();
    let items = data[type];
    if (q) {
      items = items.filter((it) =>
        [it.title, it.org, it.description, it.date].join(" ").toLowerCase().includes(q));
    }
    if (!items.length) {
      list.innerHTML = emptyState(q ? "No results match your search." : "Nothing here yet.");
      return;
    }
    list.innerHTML = items.map((it) => expItemHTML(type, it)).join("");
    observeReveals();
  }

  let portfolioFilter = "all";
  function renderPortfolio() {
    const grid = $("#portfolioGrid");
    let items = data.portfolio;
    if (portfolioFilter !== "all") items = items.filter((p) => p.category === portfolioFilter);
    if (!items.length) { grid.innerHTML = emptyState("No items in this category."); return; }
    grid.innerHTML = items.map((p) => `
      <article class="card reveal">
        <div class="card-media">
          ${adminActions("portfolio", p.id)}
          <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" />
        </div>
        <div class="card-body">
          <div class="card-meta"><span class="chip">${esc(p.category)}</span></div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
        </div>
      </article>`).join("");
    observeReveals();
  }

  function emptyState(msg) {
    return `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
      <p>${esc(msg)}</p>
    </div>`;
  }

  function renderAll() {
    applyAuthState();
    renderHobbies();
  }

  /* ---------- 6. Search & filter ---------- */

  /* ---------- 7. Content management ---------- */
  // Field schemas per content type
  const SCHEMAS = {
    hobby:     { label: "Hobby", fields: ["title", "description"], single: true, multi: false, pdf: false },
  };

  const FIELD_META = {
    title: { label: "Title", type: "text", required: true },
    org: { label: "Organization / Company", type: "text", required: true },
    date: { label: "Date", type: "text", placeholder: "e.g. July 2024", required: true },
    description: { label: "Description", type: "textarea", required: true },
  };

  let uploadState = { single: null, multi: [], pdf: [] }; // staged uploads

  function openForm(type, existing = null) {
    const schema = SCHEMAS[type];
    const body = $("#formModalBody");
    $("#formModalTitle").textContent = (existing ? "Edit " : "Add ") + schema.label;
    uploadState = { single: existing?.image || null, multi: existing?.images ? [...existing.images] : [], pdf: existing?.files ? [...existing.files] : [] };

    let html = `<form id="itemForm" class="form-grid" data-type="${type}" data-id="${existing ? existing.id : ""}">`;
    schema.fields.forEach((f) => {
      const m = FIELD_META[f];
      const val = existing ? esc(existing[f] || "") : "";
      if (m.type === "textarea") {
        html += `<div class="field"><label for="fld_${f}">${m.label}</label><textarea id="fld_${f}" name="${f}" ${m.required ? "required" : ""} placeholder="${m.placeholder || ""}">${val}</textarea></div>`;
      } else {
        html += `<div class="field"><label for="fld_${f}">${m.label}</label><input id="fld_${f}" name="${f}" type="${m.type}" ${m.required ? "required" : ""} placeholder="${m.placeholder || ""}" value="${val}" /></div>`;
      }
    });

    if (schema.category) {
      const cat = existing?.category || "project";
      html += `<div class="field"><label for="fld_category">Category</label>
        <select id="fld_category" name="category">
          <option value="project" ${cat === "project" ? "selected" : ""}>Project</option>
          <option value="certification" ${cat === "certification" ? "selected" : ""}>Certification</option>
          <option value="academic" ${cat === "academic" ? "selected" : ""}>Academic</option>
        </select></div>`;
    }

    // Single image (hobby/portfolio)
    if (schema.single) {
      html += `<div class="field"><label>Cover Image</label>
        <div class="dropzone" data-drop="single">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          <strong>Drag &amp; drop</strong> or click to upload an image
          <small>PNG, JPG, GIF — or paste an image URL below</small>
          <input type="file" accept="image/*" hidden data-input="single" />
        </div>
        <input type="url" id="fld_imageUrl" placeholder="https://image-url..." value="${existing && existing.image && !existing.image.startsWith("data:") ? esc(existing.image) : ""}" style="margin-top:8px;" />
        <div class="upload-preview" data-preview="single"></div>
      </div>`;
    }

    // Multiple images (pcto/civic)
    if (schema.multi) {
      html += `<div class="field"><label>Related Images</label>
        <div class="dropzone" data-drop="multi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/></svg>
          <strong>Drag &amp; drop</strong> or click to upload images
          <small>You can add multiple images</small>
          <input type="file" accept="image/*" multiple hidden data-input="multi" />
        </div>
        <div class="upload-preview" data-preview="multi"></div>
      </div>`;
    }

    // PDF files (pcto/civic)
    if (schema.pdf) {
      html += `<div class="field"><label>PDF Documents &amp; Reports</label>
        <div class="dropzone" data-drop="pdf">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          <strong>Drag &amp; drop</strong> or click to upload PDFs
          <small>Presentations, reports, certificates</small>
          <input type="file" accept="application/pdf" multiple hidden data-input="pdf" />
        </div>
        <div class="upload-preview" data-preview="pdf"></div>
      </div>`;
    }

    html += `<div class="modal-foot" style="padding:0;">
      <button type="button" class="btn btn-outline" data-close>Cancel</button>
      <button type="submit" class="btn btn-primary">${existing ? "Save Changes" : "Add"}</button>
    </div></form>`;

    body.innerHTML = html;
    wireFormUploads();
    refreshPreviews();
    openModal("#formModal");
  }

  function wireFormUploads() {
    $$("#itemForm .dropzone").forEach((zone) => {
      const kind = zone.dataset.drop;
      const input = zone.querySelector("input[type=file]");
      zone.addEventListener("click", () => input.click());
      zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
      zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
      zone.addEventListener("drop", (e) => {
        e.preventDefault(); zone.classList.remove("dragover");
        handleFiles(kind, e.dataTransfer.files);
      });
      input.addEventListener("change", () => handleFiles(kind, input.files));
    });
    const urlInput = $("#fld_imageUrl");
    if (urlInput) {
      urlInput.addEventListener("input", () => {
        if (urlInput.value.trim()) { uploadState.single = urlInput.value.trim(); refreshPreviews(); }
      });
    }
  }

  async function handleFiles(kind, fileList) {
    const files = Array.from(fileList);
    for (const file of files) {
      try {
        const dataUrl = await readFile(file);
        if (kind === "single") {
          uploadState.single = dataUrl;
          if ($("#fld_imageUrl")) $("#fld_imageUrl").value = "";
        } else if (kind === "multi") {
          uploadState.multi.push(dataUrl);
        } else if (kind === "pdf") {
          uploadState.pdf.push({ name: file.name, data: dataUrl });
        }
      } catch (e) {
        toast("Could not read file: " + file.name, "error");
      }
    }
    refreshPreviews();
  }

  function refreshPreviews() {
    const single = $('[data-preview="single"]');
    if (single) {
      single.innerHTML = uploadState.single
        ? `<div class="upload-thumb"><img src="${esc(uploadState.single)}" alt="preview" /><button type="button" class="remove" data-remove="single" aria-label="Remove">&times;</button></div>`
        : "";
    }
    const multi = $('[data-preview="multi"]');
    if (multi) {
      multi.innerHTML = uploadState.multi.map((src, i) =>
        `<div class="upload-thumb"><img src="${esc(src)}" alt="preview ${i + 1}" /><button type="button" class="remove" data-remove="multi" data-idx="${i}" aria-label="Remove">&times;</button></div>`).join("");
    }
    const pdf = $('[data-preview="pdf"]');
    if (pdf) {
      pdf.innerHTML = uploadState.pdf.map((f, i) =>
        `<div class="upload-thumb"><div class="file-badge">${esc(f.name)}</div><button type="button" class="remove" data-remove="pdf" data-idx="${i}" aria-label="Remove">&times;</button></div>`).join("");
    }
  }

  // Remove staged uploads (event delegation inside modal body)
  $("#formModalBody").addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    if (!rm) return;
    const kind = rm.dataset.remove;
    if (kind === "single") uploadState.single = null;
    else uploadState[kind].splice(Number(rm.dataset.idx), 1);
    refreshPreviews();
  });

  // Submit add/edit form
  $("#formModalBody").addEventListener("submit", (e) => {
    if (e.target.id !== "itemForm") return;
    e.preventDefault();
    const form = e.target;
    const type = form.dataset.type;
    const id = form.dataset.id;
    const schema = SCHEMAS[type];
    const record = id ? data[type].find((x) => x.id === id) : { id: uid() };

    schema.fields.forEach((f) => { record[f] = form.elements[f].value.trim(); });
    if (schema.category) record.category = form.elements.category.value;

    if (schema.single) {
      const urlVal = $("#fld_imageUrl") ? $("#fld_imageUrl").value.trim() : "";
      record.image = uploadState.single || urlVal || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80&auto=format&fit=crop";
    }
    if (schema.multi) record.images = [...uploadState.multi];
    if (schema.pdf) record.files = [...uploadState.pdf];

    if (!id) data[type].unshift(record);
    persist();
    renderAll();
    closeModal("#formModal");
    toast(id ? "Changes saved." : schema.label + " added.");
  });

  // Add / edit / delete buttons (event delegation on document)
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) { if (!isAdmin) return; openForm(addBtn.dataset.add); return; }

    const editBtn = e.target.closest("[data-edit]");
    if (editBtn) {
      const type = editBtn.dataset.edit;
      const item = data[type].find((x) => x.id === editBtn.dataset.id);
      if (item) openForm(type, item);
      return;
    }

    const delBtn = e.target.closest("[data-delete]");
    if (delBtn) {
      const type = delBtn.dataset.delete;
      if (confirm("Delete this item? This cannot be undone.")) {
        data[type] = data[type].filter((x) => x.id !== delBtn.dataset.id);
        persist();
        renderAll();
        toast("Item deleted.");
      }
      return;
    }

    // Lightbox triggers
    const lbImg = e.target.closest("[data-lightbox]");
    if (lbImg) {
      $("#lightboxImg").src = lbImg.dataset.lightbox;
      openModal("#lightbox");
      return;
    }
  });

  /* ---------- 8. Modals, lightbox, forms, misc ---------- */
  function openModal(sel) {
    const m = $(sel);
    m.classList.add("open");
    document.body.style.overflow = "hidden";
    const focusable = m.querySelector("input, button, textarea, select");
    if (focusable) setTimeout(() => focusable.focus(), 50);
  }
  function closeModal(sel) {
    $(sel).classList.remove("open");
    if (!$$(".modal-overlay.open, .lightbox.open").length) document.body.style.overflow = "";
  }
  // close on overlay click / close buttons / escape
  document.addEventListener("click", (e) => {
    if (e.target.matches(".modal-overlay, .lightbox") || e.target.closest("[data-close]")) {
      const overlay = e.target.closest(".modal-overlay, .lightbox");
      if (overlay) closeModal("#" + overlay.id);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") $$(".modal-overlay.open, .lightbox.open").forEach((o) => closeModal("#" + o.id));
  });





  // Animated stat counters
  function animateStats() {
    $$("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      const dur = 1400;
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target).toLocaleString();
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // Scroll reveal + stats trigger
  let statsDone = false;
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        if (entry.target.id === "statsGrid" || entry.target.closest("#statsGrid")) {
          if (!statsDone) { animateStats(); statsDone = true; }
        }
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  function observeReveals() {
    $$(".reveal:not(.visible)").forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Init ---------- */
  initTheme();
  applyAuthState();
  renderAll();
  observeReveals();
  const statsGrid = $("#statsGrid");
  if (statsGrid) revealObserver.observe(statsGrid);
  $("#year").textContent = new Date().getFullYear();
  onScroll();
})();
