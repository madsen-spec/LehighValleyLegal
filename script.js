const menuToggle = document.querySelector(".menu-toggle");
const siteMenu = document.querySelector("#site-menu");
const desktopMedia =
  typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 961px)") : null;

if (menuToggle && siteMenu) {
  const closeMenu = ({ returnFocus = false } = {}) => {
    siteMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    if (returnFocus) menuToggle.focus();
  };

  const openMenu = () => {
    siteMenu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    siteMenu.querySelector("a")?.focus();
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = siteMenu.classList.contains("is-open");
    if (isOpen) closeMenu();
    else openMenu();
  });

  siteMenu.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("a") : null;
    if (target && siteMenu.contains(target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteMenu.classList.contains("is-open")) {
      closeMenu({ returnFocus: true });
    }
  });

  document.addEventListener("click", (event) => {
    if (
      siteMenu.classList.contains("is-open") &&
      event.target instanceof Node &&
      !siteMenu.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  const closeOnDesktop = (event) => {
    if (event.matches) closeMenu();
  };
  if (desktopMedia?.addEventListener) {
    desktopMedia.addEventListener("change", closeOnDesktop);
  } else if (desktopMedia?.addListener) {
    desktopMedia.addListener(closeOnDesktop);
  }
}
