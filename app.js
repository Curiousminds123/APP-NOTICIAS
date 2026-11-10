// ============================================================
//  APP.JS — Lógica principal del Observatorio IA & Educación
//  Ana H. Iranzo (asistida con IA)
// ============================================================

// ── Estado global ──────────────────────────────────────────
let currentLang = 'es';
let allArticles = [];

// ── Fecha actual en header ─────────────────────────────────
function setCurrentDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  const d = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = d.toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'ca-ES', opts);
}

// ── Cambio de idioma ───────────────────────────────────────
function switchLang(lang) {
  currentLang = lang;
  document.body.className = `lang-${lang}`;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  document.querySelectorAll('[data-es]').forEach(el => {
    const txt = el.getAttribute(`data-${lang}`);
    if (txt) el.textContent = txt;
  });
  setCurrentDate();
  renderAll();
}

// ── Texto localizado ───────────────────────────────────────
function t(obj) {
  if (typeof obj === 'string') return obj;
  return obj[currentLang] || obj.es || '';
}

// ── Tipos de artículo → badge CSS ─────────────────────────
function typeClass(cat) {
  const map = {
    noticias: 'type-noticias',
    investigacion: 'type-investigacion',
    sentencia: 'type-sentencia',
    procedimiento: 'type-procedimiento',
    'caso-curioso': 'type-caso',
    legislacion: 'type-legislacion',
    multimedia: 'type-multimedia'
  };
  return map[cat] || 'type-noticias';
}
function typeLabel(cat) {
  const es = {
    noticias: '📰 Noticia', investigacion: '🔬 Investigación',
    sentencia: '⚖️ Sentencia firme', procedimiento: '🔍 Procedimiento en curso',
    'caso-curioso': '🤯 Caso curioso', legislacion: '📜 Legislación',
    multimedia: '📺 Multimedia'
  };
  const val = {
    noticias: '📰 Notícia', investigacion: '🔬 Investigació',
    sentencia: '⚖️ Sentència ferma', procedimiento: '🔍 Procediment en curs',
    'caso-curioso': '🤯 Cas curiós', legislacion: '📜 Legislació',
    multimedia: '📺 Multimèdia'
  };
  return (currentLang === 'val' ? val : es)[cat] || cat;
}

// ── Renderizar tarjeta de noticia ──────────────────────────
function makeArticleCard(item) {
  const accentColor = item.color || '#2563eb';
  const tags = (item.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  return `
    <article class="article-card" data-category="${item.category}" data-country="${item.country}" data-year="${item.year || ''}">
      <div class="article-card-top" style="background:${accentColor}"></div>
      <div class="card-body">
        <div class="card-meta">
          <span class="article-type ${typeClass(item.category)}">${typeLabel(item.category)}</span>
          <span class="article-country">${item.country || ''} · ${item.year || ''}</span>
        </div>
        <h3><a href="${item.source}" target="_blank" rel="noopener">${t(item.title)}</a></h3>
        <p>${t(item.summary)}</p>
        <div class="article-tags">${tags}</div>
        <a class="article-link" href="${item.source}" target="_blank" rel="noopener">
          ${currentLang === 'val' ? 'Llegir font original' : 'Leer fuente original'} →
        </a>
      </div>
    </article>
  `;
}

// ── Renderizar tarjeta de sentencia ───────────────────────
function makeRulingCard(item) {
  const tags = (item.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  return `
    <article class="ruling-card ${item.pending ? 'pending' : ''}" data-category="${item.category}" data-country="${item.country}" data-year="${item.year || ''}">
      <div class="ruling-verdict">${t(item.verdict)}</div>
      <h3><a href="${item.source}" target="_blank" rel="noopener">${t(item.title)}</a></h3>
      <p>${t(item.summary)}</p>
      <div class="article-tags">${tags}</div>
      <div class="ruling-meta">${t(item.details)}</div>
      <a class="article-link" href="${item.source}" target="_blank" rel="noopener" style="margin-top:12px;">
        ${currentLang === 'val' ? 'Veure resolució →' : 'Ver resolución →'}
      </a>
    </article>
  `;
}

// ── Renderizar todos los bloques ───────────────────────────
function renderAll() {
  renderNewsGrid();
  renderRulingsGrid();
  renderCasosGrid();
  renderLegislacion();
  renderRepercusiones();
  renderMultimedia();
  renderHemeroteca();
}

function renderNewsGrid() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const items = NEWS.filter(n => n.category === 'noticias' || n.category === 'investigacion');
  grid.innerHTML = items.map(makeArticleCard).join('');
}

function renderRulingsGrid() {
  const grid = document.getElementById('rulings-grid');
  if (!grid) return;
  grid.innerHTML = RULINGS.map(makeRulingCard).join('');
}

function renderCasosGrid() {
  const grid = document.getElementById('casos-grid');
  if (!grid) return;
  grid.innerHTML = CASOS.map(makeArticleCard).join('');
}

function renderLegislacion() {
  ['eu', 'es', 'val'].forEach(tab => {
    const container = document.getElementById(`legis-${tab}`);
    if (!container) return;
    const items = LEGISLACION[tab] || [];
    container.innerHTML = items.map(l => `
      <div class="legis-card">
        <span class="legis-year">${l.year}</span>
        <h4>${l.title}</h4>
        <p>${l.summary}</p>
        <a class="legis-link" href="${l.link}" target="_blank" rel="noopener">
          ${currentLang === 'val' ? 'Consultar text →' : 'Consultar texto →'}
        </a>
      </div>
    `).join('');
  });
}

function renderRepercusiones() {
  const mapIds = { students: 'rep-students', families: 'rep-families', teachers: 'rep-teachers' };
  Object.entries(REPERCUSIONES).forEach(([key, items]) => {
    const el = document.getElementById(mapIds[key]);
    if (!el) return;
    el.innerHTML = items.map(i => `<li>${i}</li>`).join('');
  });
}

function renderMultimedia() {
  const grid = document.getElementById('multimedia-grid');
  if (!grid) return;
  grid.innerHTML = MULTIMEDIA.map(m => `
    <div class="media-card">
      <div class="media-thumb" style="background:${m.bg}">
        <span>${m.icon}</span>
        <span class="media-type-badge">${m.type}</span>
      </div>
      <div class="media-body">
        <h4>${m.title}</h4>
        <p>${m.description}</p>
        <a class="media-link" href="${m.link}" target="_blank" rel="noopener">
          ${currentLang === 'val' ? 'Obrir recurs →' : 'Abrir recurso →'}
        </a>
      </div>
    </div>
  `).join('');
}

function renderHemeroteca() {
  const list = document.getElementById('hemeroteca-list');
  if (!list) return;
  const all = [...NEWS, ...RULINGS, ...CASOS];
  list.innerHTML = all.map(item => `
    <div class="hemeroteca-row" data-category="${item.category}" data-country="${item.country}" data-year="${item.year || ''}">
      <span class="hrow-date">${item.country} · ${item.year || ''}</span>
      <div class="hrow-title">
        <span class="article-type ${typeClass(item.category)}" style="font-size:9px;padding:2px 7px;">${typeLabel(item.category)}</span>
        <a href="${item.source}" target="_blank" rel="noopener"> ${t(item.title)}</a>
      </div>
      <span class="hrow-country">${item.country}</span>
      <span class="hrow-link"><a href="${item.source}" target="_blank" rel="noopener">↗ ${currentLang === 'val' ? 'Font' : 'Fuente'}</a></span>
    </div>
  `).join('');
}

// ── Pestañas de Legislación ────────────────────────────────
function showLegis(tab) {
  document.querySelectorAll('.legis-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.legis-content').forEach(c => c.hidden = true);
  document.getElementById(`legis-${tab}`).hidden = false;
  event.target.classList.add('active');
}

// ── Filtros ────────────────────────────────────────────────
function applyFilters() {
  const catFilter = document.getElementById('filter-category')?.value || '';
  const countryFilter = document.getElementById('filter-country')?.value || '';
  const yearFilter = document.getElementById('filter-year')?.value || '';
  const searchQuery = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();

  const all = [...NEWS, ...RULINGS, ...CASOS];
  const hList = document.getElementById('hemeroteca-list');
  if (!hList) return;

  hList.querySelectorAll('.hemeroteca-row').forEach((row, i) => {
    const item = all[i];
    if (!item) return;
    const matchCat = !catFilter || item.category === catFilter;
    const matchCountry = !countryFilter || item.country === countryFilter;
    const matchYear = !yearFilter || (item.year || '') === yearFilter;
    const title = t(item.title).toLowerCase();
    const summary = t(item.summary).toLowerCase();
    const matchSearch = !searchQuery || title.includes(searchQuery) || summary.includes(searchQuery);
    row.style.display = (matchCat && matchCountry && matchYear && matchSearch) ? '' : 'none';
  });

  // También filtra el grid principal de noticias
  document.querySelectorAll('.article-card, .ruling-card').forEach(card => {
    const cat = card.dataset.category || '';
    const country = card.dataset.country || '';
    const year = card.dataset.year || '';
    const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
    const p = card.querySelector('p')?.textContent?.toLowerCase() || '';
    const matchCat = !catFilter || cat === catFilter;
    const matchCountry = !countryFilter || country === countryFilter;
    const matchYear = !yearFilter || year === yearFilter;
    const matchSearch = !searchQuery || title.includes(searchQuery) || p.includes(searchQuery);
    card.style.display = (matchCat && matchCountry && matchYear && matchSearch) ? '' : 'none';
  });
}

// ── Exportar PDF ───────────────────────────────────────────
function exportPDF() {
  window.print();
}

// ── Exportar CSV ───────────────────────────────────────────
function exportCSV() {
  const all = [...NEWS, ...RULINGS, ...CASOS];
  const rows = [['ID', 'Categoría', 'País', 'Año', 'Título', 'Enlace']];
  all.forEach(item => {
    rows.push([
      item.id,
      item.category,
      item.country || '',
      item.year || '',
      `"${t(item.title).replace(/"/g, '""')}"`,
      item.source
    ]);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'observatorio-ia-educacion.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Nav activo al hacer scroll ─────────────────────────────
function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.snav-link');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.snav-link[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-120px 0px -60% 0px' });
  sections.forEach(s => obs.observe(s));
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setCurrentDate();
  renderAll();
  setupScrollSpy();
});
