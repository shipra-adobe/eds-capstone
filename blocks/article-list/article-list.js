import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

/**
 * Reads block config from authored rows.
 * Supported rows (any order, all optional):
 *   - a path / link to a query-index (e.g. `/us/en/magazine/query-index.json`
 *     or a bare folder `/us/en/magazine`)
 *   - `limit | <n>` to cap the number of cards rendered
 *   - `tabs | true` to render category filter tabs (needs a `category` field)
 * Backward compatible with a single cell containing just the index path.
 * @param {Element} block The article-list block element
 * @returns {{ indexPath: string, limit: number|null, tabs: boolean }}
 */
function parseConfig(block) {
  let indexPath = '';
  let limit = null;
  let tabs = false;

  const link = block.querySelector('a[href]');
  if (link) indexPath = new URL(link.href, window.location.origin).pathname;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = (cells[0]?.textContent || '').trim().toLowerCase();
    const val = (cells[1]?.textContent || '').trim();

    if (key === 'limit' && val) {
      const n = parseInt(val, 10);
      if (!Number.isNaN(n) && n > 0) limit = n;
      return;
    }
    if (key === 'tabs') {
      tabs = !val || /^(true|yes|on)$/i.test(val);
      return;
    }

    // otherwise treat any non-empty text as a possible index path
    if (!indexPath) {
      const text = (cells[0]?.textContent || row.textContent || '').trim();
      if (text) indexPath = text;
    }
  });

  if (indexPath && !indexPath.endsWith('.json')) {
    indexPath = `${indexPath.replace(/\/$/, '')}/query-index.json`;
  }
  if (!indexPath) {
    const base = window.location.pathname.replace(/\/$/, '');
    indexPath = `${base}/query-index.json`;
  }

  return { indexPath, limit, tabs };
}

/**
 * Builds a single article card list item from an index row.
 * Mirrors the authored `.cards.articles` markup so styling stays consistent.
 * @param {object} row A query-index entry ({ path, title, description, image, category })
 * @returns {HTMLLIElement}
 */
function buildCard(row) {
  const li = document.createElement('li');
  if (row.category) li.dataset.category = toClassName(row.category);

  const imageCell = document.createElement('div');
  imageCell.className = 'article-list-card-image';
  if (row.image) {
    const picture = createOptimizedPicture(row.image, row.title || '', false, [{ width: '750' }]);
    imageCell.append(picture);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';

  const h3 = document.createElement('h3');
  const a = document.createElement('a');
  a.href = row.path;
  a.textContent = row.title || row.path;
  h3.append(a);
  body.append(h3);

  if (row.description) {
    const p = document.createElement('p');
    p.textContent = row.description;
    body.append(p);
  }

  li.append(imageCell, body);
  return li;
}

/**
 * Builds the category filter tab bar and wires click filtering.
 * Renders "All" plus one tab per distinct category (first-seen order).
 * @param {HTMLUListElement} ul The rendered card list
 * @param {string[]} categories Distinct display category labels, in order
 * @returns {HTMLElement} The tab bar element
 */
function buildTabs(ul, categories) {
  const nav = document.createElement('div');
  nav.className = 'article-list-tabs';

  const makeTab = (label, value) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'article-list-tab';
    btn.textContent = label;
    btn.dataset.filter = value;
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.article-list-tab').forEach((t) => t.classList.remove('active'));
      btn.classList.add('active');
      ul.querySelectorAll(':scope > li').forEach((li) => {
        const show = value === '*' || li.dataset.category === value;
        li.hidden = !show;
      });
    });
    return btn;
  };

  const all = makeTab('All', '*');
  all.classList.add('active');
  nav.append(all);
  categories.forEach((label) => nav.append(makeTab(label, toClassName(label))));
  return nav;
}

/**
 * Decorates an article-list block: fetches a query-index and renders a
 * self-updating grid of article cards (index order preserved). Supports an
 * optional `limit` (e.g. a "recent 4" teaser) and optional category `tabs`.
 * @param {Element} block The article-list block element
 */
export default async function decorate(block) {
  const { indexPath, limit, tabs } = parseConfig(block);
  block.textContent = '';

  try {
    const resp = await fetch(indexPath);
    if (!resp.ok) throw new Error(`${resp.status} ${indexPath}`);
    const json = await resp.json();
    const rows = Array.isArray(json.data) ? json.data : [];

    // keep index order; drop the current listing page if it appears in its own index
    const listingPath = window.location.pathname.replace(/\/$/, '');
    let visible = rows.filter(
      (row) => row.path && row.path.replace(/\/$/, '') !== listingPath,
    );
    if (limit) visible = visible.slice(0, limit);

    const ul = document.createElement('ul');
    visible.forEach((row) => ul.append(buildCard(row)));

    // distinct categories, sorted alphabetically (matches source tab order:
    // ALL, CLIMBING, CYCLING, SKIING, SURFING, TRAVEL)
    if (tabs) {
      const categories = [...new Set(
        visible.map((row) => (row.category || '').trim()).filter(Boolean),
      )].sort((a, b) => a.localeCompare(b));
      if (categories.length) block.append(buildTabs(ul, categories));
    }

    block.append(ul);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('article-list: failed to load index', error);
  }
}
