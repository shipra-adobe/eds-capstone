import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Resolves the query-index path this list should read from.
 * Priority: an authored link/path in the block, else derived from the current
 * page path (e.g. /us/en/magazine -> /us/en/magazine/query-index.json).
 * @param {Element} block The article-list block element
 * @returns {string} Absolute path to a query-index.json
 */
function resolveIndexPath(block) {
  const link = block.querySelector('a[href]');
  if (link) return new URL(link.href, window.location.origin).pathname;

  const authored = block.textContent.trim();
  if (authored) {
    // accept either a full ".../query-index.json" or a bare folder path
    return authored.endsWith('.json') ? authored : `${authored.replace(/\/$/, '')}/query-index.json`;
  }

  const base = window.location.pathname.replace(/\/$/, '');
  return `${base}/query-index.json`;
}

/**
 * Builds a single article card list item from an index row.
 * Mirrors the authored `.cards.articles` markup so styling stays consistent.
 * @param {object} row A query-index entry ({ path, title, description, image })
 * @returns {HTMLLIElement}
 */
function buildCard(row) {
  const li = document.createElement('li');

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

  // make the whole card clickable via the title link target
  li.append(imageCell, body);
  return li;
}

/**
 * Decorates an article-list block: fetches a query-index and renders a
 * self-updating grid of article cards (index order preserved).
 * @param {Element} block The article-list block element
 */
export default async function decorate(block) {
  const indexPath = resolveIndexPath(block);
  block.textContent = '';

  try {
    const resp = await fetch(indexPath);
    if (!resp.ok) throw new Error(`${resp.status} ${indexPath}`);
    const json = await resp.json();
    const rows = Array.isArray(json.data) ? json.data : [];

    const ul = document.createElement('ul');
    // keep index order; drop the listing page itself if it ever appears
    const listingPath = window.location.pathname.replace(/\/$/, '');
    rows
      .filter((row) => row.path && row.path.replace(/\/$/, '') !== listingPath)
      .forEach((row) => ul.append(buildCard(row)));

    block.append(ul);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('article-list: failed to load index', error);
  }
}
