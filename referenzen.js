(() => {
  const buttons = [...document.querySelectorAll('.filter')];
  const cards = [...document.querySelectorAll('.project')];
  const input = document.getElementById('searchProjects');
  const count = document.getElementById('visibleCount');
  const none = document.getElementById('noResults');
  let category = 'Alle';
  function applyFilters() {
    const term = (input.value || '').trim().toLocaleLowerCase('de');
    let visible = 0;
    cards.forEach(card => {
      const matchesCategory = category === 'Alle' || card.dataset.category === category;
      const matchesSearch = !term || card.textContent.toLocaleLowerCase('de').includes(term);
      card.hidden = !(matchesCategory && matchesSearch);
      if (!card.hidden) visible += 1;
    });
    count.textContent = visible;
    none.hidden = visible !== 0;
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    buttons.forEach(b => {
      const active = b === button;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
  }));
  input.addEventListener('input', applyFilters);
  buttons.forEach(b => b.setAttribute('aria-pressed', String(b.classList.contains('is-active'))));
  if (location.hash.length > 1) {
    const destination = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (destination) window.addEventListener('load', () => destination.scrollIntoView({ block: 'center' }), { once: true });
  }
  applyFilters();
})();
