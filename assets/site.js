/* Progressive enhancement only. All articles and navigation are ordinary HTML. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const toggle = document.querySelector('.menu-button');
  const navigation = document.querySelector('#main-navigation');
  function closeMenu(returnFocus = false) {
    if (!toggle || !navigation) return;
    const wasOpen = navigation.classList.contains('open');
    navigation.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '開啟選單');
    if (wasOpen && returnFocus) toggle.focus();
  }
  toggle?.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
  });
  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu(true);
  });
  const desktop = window.matchMedia('(min-width: 951px)');
  desktop.addEventListener('change', () => closeMenu());

  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.article-card')];
  const search = document.querySelector('#article-search');
  const result = document.querySelector('#article-count');
  const empty = document.querySelector('#article-empty');
  if (!cards.length) return;
  document.querySelector('.article-tools')?.removeAttribute('hidden');
  let category = '全部';
  function update() {
    const query = (search?.value || '').trim().normalize('NFKC').toLocaleLowerCase();
    let count = 0;
    cards.forEach(card => {
      const matchesCategory = category === '全部' || card.dataset.category === category;
      const matchesQuery = card.textContent.normalize('NFKC').toLocaleLowerCase().includes(query);
      card.hidden = !(matchesCategory && matchesQuery);
      if (!card.hidden) count += 1;
    });
    buttons.forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (result) result.textContent = `顯示 ${count} 篇，共 ${cards.length} 篇`;
    if (empty) empty.hidden = count !== 0;
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    update();
  }));
  search?.addEventListener('input', update);
  document.querySelector('#clear-search')?.addEventListener('click', () => {
    category = '全部';
    if (search) search.value = '';
    update();
    search?.focus();
  });
  update();
})();
