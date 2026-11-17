const btn = document.getElementById("trzy_kreski");
const menu = document.getElementById("select_menu");

btn.addEventListener("click", () => {
  menu.classList.toggle("show");
});

// Zamyka menu
window.addEventListener("click", e => {
  if (!btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove("show");
  }
});
