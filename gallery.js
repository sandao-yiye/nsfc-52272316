(() => {
  const dialog = document.querySelector('.meeting-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const caption = dialog.querySelector('figcaption');
  const closeButton = dialog.querySelector('.meeting-lightbox-close');
  const original = dialog.querySelector('.lightbox-original');
  const triggers = '.meeting-photo a, a[data-lightbox], .nsfc-p-picture-link, .nsfc-p-full';
  const stage = document.createElement('div');
  stage.className = 'meeting-lightbox-stage';
  caption.before(stage);
  let sourceLink = null;
  function setImageSize(width, height) {
    if (width > 0 && height > 0) {
      stage.style.setProperty('--photo-width', width + 'px');
      stage.style.setProperty('--photo-ratio', width / height);
    }
  }

  function resetStage() {
    stage.replaceChildren();
    stage.removeAttribute('style');
    stage.removeAttribute('data-loading');
  }

  function loadPaper(image, thumbnail, previewLink) {
    setImageSize(1800, 864);
    stage.setAttribute('data-loading', '');
    if (previewLink.dataset.previewState === 'ready' || thumbnail.classList.contains('nsfc-p-sheet')) {
      const position = getComputedStyle(previewLink);
      stage.style.setProperty('--paper-column', position.getPropertyValue('--paper-column'));
      stage.style.setProperty('--paper-row', position.getPropertyValue('--paper-row'));
      stage.style.backgroundImage = 'url(' + JSON.stringify(thumbnail.currentSrc || thumbnail.src) + ')';
    }
    image.decode().then(() => {
      if (image.parentElement !== stage) return;
      stage.removeAttribute('data-loading');
      stage.style.removeProperty('background-image');
    }).catch(() => {
      if (image.parentElement !== stage) return;
      caption.append('（高清图暂未载入，可关闭后重试）');
    });
  }

  document.querySelectorAll(triggers).forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
  });

  document.addEventListener('click', event => {
    const link = event.target.closest(triggers);
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    const paperViewer = link.closest('.nsfc-p-viewer');
    const thumbnail = paperViewer ? paperViewer.querySelector('.nsfc-p-picture') : link.querySelector('img');
    sourceLink = link;
    resetStage();
    const image = document.createElement('img');
    image.alt = thumbnail.alt;
    stage.append(image);
    caption.textContent = paperViewer
      ? paperViewer.querySelector('.nsfc-p-caption-title').textContent
      : link.dataset.lightbox || link.closest('figure').querySelector('figcaption').textContent;
    if (paperViewer) {
      image.src = link.href;
      loadPaper(image, thumbnail, paperViewer.querySelector('.nsfc-p-picture-link'));
    } else {
      setImageSize(thumbnail.naturalWidth || thumbnail.width, thumbnail.naturalHeight || thumbnail.height);
      image.addEventListener('load', () => {
        if (image.parentElement === stage) setImageSize(image.naturalWidth, image.naturalHeight);
      });
      image.src = link.href;
    }
    if (original) {
      original.href = link.href;
      original.hidden = !link.hasAttribute('data-lightbox');
    }
    dialog.showModal();
  });

  closeButton.addEventListener('click', () => dialog.close());
  for (const eventName of ['click', 'contextmenu']) {
    dialog.addEventListener(eventName, event => {
      if (stage.contains(event.target) || closeButton.contains(event.target) || original?.contains(event.target)) return;
      event.preventDefault();
      dialog.close();
    });
  }
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    sourceLink?.focus({ preventScroll: true });
    sourceLink = null;
    resetStage();
  });
})();
