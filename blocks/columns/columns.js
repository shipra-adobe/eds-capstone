export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // Byline variant: author card (small circular portrait + name/occupation).
  // Distinguished from the "Featured Article" teaser, which always carries a
  // CTA link ("Read More"). The byline instance has no anchor inside the block.
  if (cols.length === 2 && !block.querySelector('a')) {
    block.classList.add('columns-byline');
  }

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
