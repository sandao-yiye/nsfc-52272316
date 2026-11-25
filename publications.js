(() => {
  function initialize() {
    const section = document.getElementById('publications');
    if (!section) return;
    const filters = section.querySelector('#paper-filters');
    const list = section.querySelector('#paper-list');
    if (!filters || !list || filters.children.length) return;
    const rows = Array.from(list.rows);
    const counter = section.querySelector('#paper-count');
    const categories = ['', 'SCIE', 'SSCI', 'EI', 'CSSCI', 'CSCD', '北大核心'];
    function show(selected) {
      let count = 0;
      for (const row of rows) {
        row.hidden = Boolean(selected) && !row.dataset.indexes.split(' ').includes(selected);
        if (!row.hidden) count += 1;
      }
      for (const button of filters.children) {
        button.setAttribute('aria-pressed', String(button.dataset.category === selected));
      }
      counter.textContent = '显示 ' + count + ' 篇论文';
    }
    for (const category of categories) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'paper-filter';
      button.dataset.category = category;
      button.textContent = category === 'SCIE' ? 'SCI（SCIE）' : category || '全部';
      button.setAttribute('aria-controls', list.id);
      button.addEventListener('click', () => show(category));
      filters.append(button);
    }
    show('');
    section.querySelector('#paper-tools').hidden = false;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
