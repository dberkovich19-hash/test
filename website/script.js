document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  const tabButtons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".menu-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabButtons.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });

      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.panel === target);
      });
    });
  });
});
