// Страницы «Политика конфиденциальности» и «Условия использования»: русский и английский текст лежат в странице,
// показывается один — по выбору на сайте (тот же ключ mizclip-lang) или по языку браузера. Ничего не загружает и не отправляет.
'use strict';

(function () {
  const KEY = 'mizclip-lang';

  function storageGet() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function storageSet(value) {
    try { window.localStorage.setItem(KEY, value); } catch (e) { /* без хранилища — только на эту страницу */ }
  }

  function apply(lang) {
    const root = document.documentElement;
    root.lang = lang;
    const title = root.dataset[lang === 'en' ? 'titleEn' : 'titleRu'];
    if (title) document.title = title;
    const button = document.getElementById('lang');
    button.textContent = lang === 'ru' ? 'EN' : 'RU';
    button.lang = lang === 'ru' ? 'en' : 'ru';
    button.setAttribute('aria-label', lang === 'ru' ? 'Switch to English' : 'Переключить на русский');
  }

  function init() {
    const saved = storageGet();
    let lang = saved === 'ru' || saved === 'en' ? saved : /^ru\b|^ru-/i.test(navigator.language || '') ? 'ru' : (navigator.language ? 'en' : 'ru');
    apply(lang);
    document.getElementById('lang').addEventListener('click', () => {
      lang = lang === 'ru' ? 'en' : 'ru';
      storageSet(lang);
      apply(lang);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
