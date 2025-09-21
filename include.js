(async () => {
  // include into any element with data-include="file.html"
  const slots = document.querySelectorAll("[data-include]");
  for (const el of slots) {
    const file = el.getAttribute("data-include");
    try {
      const res = await fetch(file); // Removed cache: "no-store"
      el.innerHTML = await res.text();
    } catch (e) {
      console.error("Include failed:", file, e);
    }
  }
})();
