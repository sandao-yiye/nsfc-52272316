(() => {
  const navigation = document.querySelector('.research-topics');
  if (!navigation) return;
  const tabs = Array.from(navigation.querySelectorAll('a'));
  const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));
  if (!tabs.length || panels.some(panel => !panel)) return;

  function select(index) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
  }
  function selectFragment() {
    const index = tabs.findIndex(tab => tab.hash === location.hash);
    if (index !== -1) select(index);
    return index !== -1;
  }

  navigation.setAttribute('role', 'tablist');
  tabs.forEach((tab, i) => {
    tab.id = 'tab-' + panels[i].id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].querySelector('h4').hidden = true;
    tab.addEventListener('click', event => {
      if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return;
      event.preventDefault();
      select(i);
    });
    tab.addEventListener('keydown', event => {
      const keys = {ArrowLeft: (i + tabs.length - 1) % tabs.length,
        ArrowRight: (i + 1) % tabs.length, Home: 0, End: tabs.length - 1};
      if (event.key === ' ') {
        event.preventDefault();
        select(i);
      } else if (Object.hasOwn(keys, event.key)) {
        event.preventDefault();
        const next = keys[event.key];
        select(next);
        tabs[next].focus();
      }
    });
  });
  if (!selectFragment()) select(0);
  window.addEventListener('hashchange', selectFragment);
})();
