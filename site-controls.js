(() => {
  "use strict";
  const menu = document.querySelector(".menu-button");
  const nav = document.getElementById("main-nav");
  if (!menu || !nav) return;
  document.documentElement.classList.add("js");
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const sections = links.map(link => document.getElementById(link.hash.substring(1)));
  function closeMenu() {
    menu.setAttribute("aria-expanded", "false");
  }
  menu.addEventListener("click", () => {
    menu.setAttribute("aria-expanded", String(menu.getAttribute("aria-expanded") === "false"));
  });
  nav.addEventListener("click", event => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener("pointerdown", event => {
    if (!menu.contains(event.target) && !nav.contains(event.target)) closeMenu();
  });
  const header = menu.closest("header");
  let frame = 0;
  function updateLocation() {
    frame = 0;
    const edge = (header?.offsetHeight || 0) + 20;
    let active = -1;
    for (const [index, section] of sections.entries()) {
      if (section && section.getBoundingClientRect().top <= edge) active = index;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      active = sections.length - 1;
    }
    links.forEach((link, index) => {
      if (active === index) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  function queueUpdate() {
    if (!frame) frame = requestAnimationFrame(updateLocation);
  }
  window.addEventListener("scroll", queueUpdate, {passive: true});
  window.addEventListener("resize", queueUpdate);
  window.addEventListener("load", queueUpdate);
  updateLocation();
})();
