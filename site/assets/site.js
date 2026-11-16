'use strict';

const filterGroup = document.querySelector('[data-filter-group]');
if (filterGroup) {
  filterGroup.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filterGroup.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('[data-category]').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    });
  }));
}

const searchForm = document.querySelector('[data-library-search]');
if (searchForm) {
  const input = searchForm.querySelector('input');
  const cards = [...document.querySelectorAll('[data-search]')];
  const status = searchForm.querySelector('[role=status]');
  let index = [];
  const filter = () => {
    const terms = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    cards.forEach(card => {
      const target = card.querySelector('h2 a').getAttribute('href');
      const entry = index.find(item => item.url === target);
      const haystack = entry?.text ?? card.dataset.search;
      card.hidden = !terms.every(term => haystack.includes(term));
      if (!card.hidden) visible++;
    });
    status.textContent = `${visible} 篇`;
    document.querySelector('[data-empty]').hidden = visible !== 0;
  };
  searchForm.addEventListener('submit', event => { event.preventDefault(); filter(); });
  input.addEventListener('input', filter);
  const query = new URLSearchParams(location.search).get('q');
  if (query) { input.value = query; filter(); }
  const scriptUrl = document.currentScript?.src;
  if (scriptUrl) {
    fetch(new URL('search.json', scriptUrl)).then(response => {
      if (!response.ok) throw new Error('Search index unavailable');
      return response.json();
    }).then(data => { index = data; filter(); }).catch(() => { /* Title and tag filtering remains available. */ });
  }
}

const copyButton = document.querySelector('[data-copy-link]');
if (copyButton) copyButton.addEventListener('click', async () => {
  const status = document.querySelector('[data-copy-status]');
  try {
    await navigator.clipboard.writeText(location.href);
    status.textContent = '链接已复制';
  } catch {
    status.textContent = '请复制浏览器地址栏中的链接';
  }
});
