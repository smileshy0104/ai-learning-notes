'use strict';

// 主题偏好：默认跟随系统（纯 CSS 的 color-scheme + light-dark() 即可生效，不需要脚本）。
// 这个脚本只做两件事：把保存的显式偏好写回 <html data-theme>（在首屏前执行，避免闪烁），
// 以及把顶栏里那个 hidden 的切换按钮显示出来。禁用脚本时站点仍然跟随系统配色。
(() => {
  const root = document.documentElement;
  const key = 'ainotes-theme';
  const states = ['system', 'light', 'dark'];
  const labels = { system: '跟随系统', light: '浅色', dark: '深色' };
  const icons = { system: '◐', light: '☀', dark: '☾' };

  const read = () => {
    try {
      const saved = localStorage.getItem(key);
      return saved === 'light' || saved === 'dark' ? saved : 'system';
    } catch {
      return 'system';
    }
  };
  const write = state => {
    try {
      if (state === 'system') localStorage.removeItem(key);
      else localStorage.setItem(key, state);
    } catch {
      /* 隐私模式下无法持久化时，本次会话仍然切换。 */
    }
  };
  const current = () => (root.dataset.theme === 'light' || root.dataset.theme === 'dark' ? root.dataset.theme : 'system');
  const apply = state => {
    if (state === 'system') delete root.dataset.theme;
    else root.dataset.theme = state;
  };

  apply(read());

  const setup = () => {
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    const icon = button.querySelector('[data-theme-icon]');
    const label = button.querySelector('[data-theme-label]');
    const render = () => {
      const state = current();
      icon.textContent = icons[state];
      label.textContent = labels[state];
      button.setAttribute('aria-label', `配色：${labels[state]}。点击切换`);
    };
    button.hidden = false;
    render();
    button.addEventListener('click', () => {
      apply(states[(states.indexOf(current()) + 1) % states.length]);
      write(current());
      render();
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
