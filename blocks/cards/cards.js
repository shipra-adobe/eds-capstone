import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });

    // Group standalone link paragraphs (social links) into one horizontal row.
    const body = li.querySelector('.cards-card-body');
    if (body) {
      const linkParas = [...body.children].filter(
        (el) => el.tagName === 'P'
          && el.children.length === 1
          && el.firstElementChild.tagName === 'A'
          && el.textContent.trim() === el.firstElementChild.textContent.trim(),
      );
      if (linkParas.length) {
        const social = document.createElement('div');
        social.className = 'cards-card-social';
        linkParas.forEach((p) => social.append(p));
        body.append(social);
      }
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
