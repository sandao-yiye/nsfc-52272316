(() => {
  const dialog = document.querySelector('.meeting-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const caption = dialog.querySelector('figcaption');
  const closeButton = dialog.querySelector('.meeting-lightbox-close');
  const original = dialog.querySelector('.lightbox-original');
  const triggers = '.meeting-photo a, a[data-lightbox]';
  const image = document.createElement('img');
  let sourceLink = null;
  caption.before(image);
  function setImageSize(width, height) {
    if (width > 0 && height > 0) {
      image.style.setProperty('--photo-width', width + 'px');
      image.style.setProperty('--photo-ratio', width / height);
    }
  }
  image.addEventListener('load', () => setImageSize(image.naturalWidth, image.naturalHeight));

  document.querySelectorAll(triggers).forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
  });

  document.addEventListener('click', event => {
    const link = event.target.closest(triggers);
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    const thumbnail = link.querySelector('img');
    sourceLink = link;
    setImageSize(thumbnail.naturalWidth || Number(thumbnail.getAttribute('width')),
                 thumbnail.naturalHeight || Number(thumbnail.getAttribute('height')));
    image.src = link.href;
    image.alt = thumbnail.alt;
    caption.textContent = link.dataset.lightbox || link.closest('figure').querySelector('figcaption').textContent;
    if (original) {
      original.href = link.href;
      original.hidden = !link.hasAttribute('data-lightbox');
    }
    dialog.showModal();
  });

  closeButton.addEventListener('click', () => dialog.close());
  for (const eventName of ['click', 'contextmenu']) {
    dialog.addEventListener(eventName, event => {
      if (event.target === image || closeButton.contains(event.target) || original?.contains(event.target)) return;
      event.preventDefault();
      dialog.close();
    });
  }
  dialog.addEventListener('close', () => {
    sourceLink?.focus({ preventScroll: true });
    sourceLink = null;
    image.removeAttribute('src');
  });
})();
