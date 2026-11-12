

// --- Project filters: lightweight, keyboard-friendly, and future-proof for new cards ---
const projectFilters = [...document.querySelectorAll('[data-filter]')];
const projectCards = [...document.querySelectorAll('[data-project-card]')];
const filterStatus = document.querySelector('[data-filter-status]');

function applyProjectFilter(filter) {
  let visibleCount = 0;
  projectCards.forEach(card => {
    const categories = (card.dataset.categories || '').split(/\s+/);
    const visible = filter === 'all' || categories.includes(filter);
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  projectFilters.forEach(button => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });

  if (filterStatus) {
    filterStatus.textContent = visibleCount === 0
      ? 'No projects in this category yet.'
      : `Showing ${visibleCount} project${visibleCount === 1 ? '' : 's'}`;
  }
}

projectFilters.forEach(button => {
  button.addEventListener('click', () => applyProjectFilter(button.dataset.filter));
});
applyProjectFilter('all');
