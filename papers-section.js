(() => {
  function initialize() {
    const section = document.getElementById('paper-results');
    if (!section || section.dataset.nsfcPReady) return;
    const find = (selector) => section.querySelector(selector);
    const rows = Array.from(section.querySelectorAll('.nsfc-p-row'));
    const dots = Array.from(section.querySelectorAll('.nsfc-p-dot'));
    if (!rows.length || rows.length !== dots.length) return;
    section.dataset.nsfcPReady = 'true';
    const list = find('.nsfc-p-list');
    const sheet = find('.nsfc-p-picture');
    const imageLink = find('.nsfc-p-picture-link');
    const fullLink = find('.nsfc-p-full');
    const counter = find('.nsfc-p-counter');
    const caption = find('.nsfc-p-caption-title');
    const live = find('.nsfc-p-live');
    let current = 0;
    let sheetReady = false;
    let sheetFailed = !sheet.classList.contains('nsfc-p-sheet');

    function setPreviewState(state) {
      imageLink.dataset.previewState = state;
      imageLink.setAttribute('aria-busy', String(state === 'loading'));
    }

    function showPreview(row) {
      const alt = '论文截图：' + row.dataset.nsfcPShort;
      const slot = Number(row.dataset.previewSlot);
      if (!sheetFailed && Number.isInteger(slot) && slot >= 0 && slot < 13) {
        imageLink.style.setProperty('--paper-column', slot % 3);
        imageLink.style.setProperty('--paper-row', Math.floor(slot / 3));
        sheet.alt = alt;
        if (sheet.parentElement !== imageLink) imageLink.replaceChildren(sheet);
        setPreviewState(sheetReady ? 'ready' : 'loading');
        return;
      }

      // A missing preview sheet or an entry without a slot can still use its original.
      const fallback = new Image(1800, 864);
      fallback.className = 'nsfc-p-picture';
      fallback.alt = alt;
      fallback.draggable = false;
      fallback.onload = () => {
        if (fallback.parentElement === imageLink) setPreviewState('original');
      };
      fallback.onerror = () => {
        if (fallback.parentElement === imageLink) setPreviewState('error');
      };
      setPreviewState('loading');
      imageLink.replaceChildren(fallback);
      fallback.src = row.dataset.nsfcPImage;
    }

    showPreview(rows[0]);
    if (!sheetFailed) {
      sheet.decode().then(() => {
        sheetReady = true;
        if (sheet.parentElement === imageLink) setPreviewState('ready');
      }).catch(() => {
        sheetFailed = true;
        if (sheet.parentElement === imageLink) showPreview(rows[current]);
      });
    }

    function select(index) {
      const next = (index + rows.length) % rows.length;
      if (next === current) {
        if (imageLink.dataset.previewState === 'error') showPreview(rows[current]);
        return;
      }
      rows[current].setAttribute('aria-pressed', 'false');
      dots[current].setAttribute('aria-pressed', 'false');
      dots[current].tabIndex = -1;
      current = next;
      const row = rows[current];
      const { nsfcPImage: source, nsfcPShort: shortTitle } = row.dataset;
      row.setAttribute('aria-pressed', 'true');
      dots[current].setAttribute('aria-pressed', 'true');
      dots[current].tabIndex = 0;
      showPreview(row);
      for (const link of [imageLink, fullLink]) {
        link.href = source;
        link.setAttribute('aria-label', '放大查看第 ' + (current + 1) + ' 篇论文高清截图');
      }
      caption.textContent = shortTitle;
      counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + rows.length;
      live.textContent = '第 ' + (current + 1) + ' 篇，共 ' + rows.length + ' 篇。' + shortTitle;
      const listBounds = list.getBoundingClientRect();
      const rowBounds = row.getBoundingClientRect();
      if (rowBounds.top < listBounds.top) list.scrollTop += rowBounds.top - listBounds.top;
      else if (rowBounds.bottom > listBounds.bottom) list.scrollTop += rowBounds.bottom - listBounds.bottom;
    }

    function bindItems(items, backward, forward) {
      items.forEach((item, index) => {
        item.addEventListener('click', () => select(index));
        item.addEventListener('keydown', (event) => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          const destinations = {
            [backward]: index - 1, [forward]: index + 1,
            Home: 0, End: items.length - 1,
          };
          if (!Object.hasOwn(destinations, event.key)) return;
          event.preventDefault();
          select(destinations[event.key]);
          items[current].focus({ preventScroll: true });
        });
      });
    }
    bindItems(rows, 'ArrowUp', 'ArrowDown');
    bindItems(dots, 'ArrowLeft', 'ArrowRight');
    find('.nsfc-p-prev').addEventListener('click', () => select(current - 1));
    find('.nsfc-p-next').addEventListener('click', () => select(current + 1));

    let start = null;
    let suppressClick = false;
    imageLink.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      suppressClick = false;
      start = { id: event.pointerId, x: event.clientX, y: event.clientY };
      imageLink.setPointerCapture(event.pointerId);
    });
    imageLink.addEventListener('pointerup', (event) => {
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) < 38 || Math.abs(dx) < 1.4 * Math.abs(dy)) return;
      suppressClick = true;
      select(current + (dx < 0 ? 1 : -1));
    });
    imageLink.addEventListener('pointercancel', () => { start = null; });
    imageLink.addEventListener('dragstart', (event) => event.preventDefault());
    imageLink.addEventListener('click', (event) => {
      if (suppressClick && event.detail !== 0) event.preventDefault();
      suppressClick = false;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
