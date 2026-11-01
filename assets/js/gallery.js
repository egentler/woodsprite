/* WoodSprite — accessible black-background gallery viewer.
   Closing the viewer returns to the page you were on, including via browser Back. */
(() => {
  const dialog = document.querySelector('#lightbox');
  if (!dialog) return;
  const image = dialog.querySelector('#lightbox-image');
  const count = dialog.querySelector('#lightbox-count');
  const title = dialog.querySelector('#lightbox-title');
  const description = dialog.querySelector('#lightbox-description');
  const shop = dialog.querySelector('#lightbox-shop');
  const closeButton = dialog.querySelector('.lightbox-close');
  const prevButton = dialog.querySelector('.lightbox-prev');
  const nextButton = dialog.querySelector('.lightbox-next');
  const tiles = [...document.querySelectorAll('a[data-lightbox]')];
  let active = 0;
  let openedByUs = false;
  let focusBack = null;
  let pointerX = null;

  const render = () => {
    const item = tiles[active];
    if (!item) return;
    image.src = item.href;
    image.alt = item.dataset.title || 'Jewelry photograph';
    title.textContent = item.dataset.title || '';
    description.textContent = item.dataset.description || '';
    description.hidden = !description.textContent;
    const url = item.dataset.shop || '';
    // Optional links must be http(s) URLs; never use a javascript: URI.
    if (/^https?:\/\//i.test(url)) { shop.href = url; shop.hidden = false; }
    else { shop.removeAttribute('href'); shop.hidden = true; }
    count.textContent = tiles.length > 1 ? `${active + 1} / ${tiles.length}` : '';
    prevButton.hidden = nextButton.hidden = tiles.length < 2;
  };
  const open = index => {
    active = index; focusBack = tiles[index]; render();
    if (!dialog.open) {
      dialog.showModal(); document.body.classList.add('lightbox-open');
      history.pushState({ woodspriteViewer: true }, '', '#image');
      openedByUs = true;
    }
    closeButton.focus();
  };
  const shut = () => {
    if (dialog.open) dialog.close();
    document.body.classList.remove('lightbox-open');
    if (focusBack?.isConnected) focusBack.focus({preventScroll:true});
  };
  const requestClose = () => {
    if (openedByUs && history.state?.woodspriteViewer) history.back();
    else shut();
  };
  const move = n => { active = (active + n + tiles.length) % tiles.length; render(); };
  tiles.forEach((tile, i) => tile.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault(); open(i);
  }));
  closeButton.addEventListener('click', requestClose);
  prevButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
  dialog.addEventListener('cancel', e => { e.preventDefault(); requestClose(); });
  dialog.addEventListener('click', e => { if (e.target === dialog) requestClose(); });
  document.addEventListener('keydown', e => {
    if (!dialog.open) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
  });
  dialog.addEventListener('touchstart', e => { pointerX = e.touches[0]?.clientX ?? null; }, {passive:true});
  dialog.addEventListener('touchend', e => {
    if (pointerX === null) return;
    const change = (e.changedTouches[0]?.clientX ?? pointerX) - pointerX;
    if (Math.abs(change) > 60 && tiles.length > 1) move(change > 0 ? -1 : 1);
    pointerX = null;
  }, {passive:true});
  window.addEventListener('popstate', () => {
    openedByUs = false;
    if (dialog.open) shut();
  });
})();
