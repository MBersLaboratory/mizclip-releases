// Сайт выпусков MIZCLIP: последняя версия из API GitHub, кнопка для ОС посетителя, русский и английский.
// Безопасность: данные API выводятся только через textContent; ссылки на скачивание — только из
// github.com/MBersLaboratory/mizclip-releases/releases/download/…; ничего не отправляется, cookies нет.
'use strict';

(function () {
  const REPO = 'MBersLaboratory/mizclip-releases';
  const API = 'https://api.github.com/repos/' + REPO + '/releases/latest';
  const RELEASES = 'https://github.com/' + REPO + '/releases';
  const DOWNLOAD_PATH = '/' + REPO + '/releases/download/';
  const CACHE_KEY = 'mizclip-release-v1';
  const CACHE_MS = 10 * 60 * 1000;

  // Файлы выпуска (имена — scripts/release.sh).
  const FILES = {
    'mac-arm64': /^MIZCLIP-[^/]+-mac-arm64\.dmg$/,
    'mac-x64': /^MIZCLIP-[^/]+-mac-x64\.dmg$/,
    windows: /^MIZCLIP-[^/]+-windows-x64\.exe$/,
    appimage: /^MIZCLIP-[^/]+-linux-x86_64\.AppImage$/,
    deb: /^MIZCLIP-[^/]+-linux-amd64\.deb$/,
    android: /^MIZCLIP-[^/]+-android\.apk$/,
    sums: /^SHA256SUMS\.txt$/
  };

  // Английские тексты статичной разметки; русские берутся из самой разметки.
  const EN_STATIC = {
    'nav.download': 'Download',
    'nav.install': 'Install',
    'hero.title': 'One clipboard for all your devices',
    'hero.lead': 'Copy on one device, paste on another. Send files and photos Nearby to any device on the same Wi‑Fi. Mac, Windows, Linux and Android, no sign-up.',
    'primary.default': 'Download MIZCLIP',
    'status.static': 'All installers are on the GitHub releases page.',
    'hero.more': 'Other platforms',
    'features.title': 'What MIZCLIP does',
    'f1.title': 'Shared clipboard',
    'f1.text': 'Everything you copy goes to a searchable history. Your devices on the same network exchange it directly.',
    'f2.title': 'Nearby',
    'f2.text': 'Files, photos, folders and text to any device with MIZCLIP on the same Wi‑Fi — across any systems.',
    'f3.title': 'Only on your devices',
    'f3.text': 'No server, no accounts. History is encrypted, nothing goes to the cloud, passwords are never stored.',
    'f4.title': 'Works offline',
    'f4.text': 'You only need the internet to download the app. Everything else stays inside your network.',
    'download.title': 'All platforms',
    'download.all': 'All releases on GitHub',
    'req.mac': 'macOS 13 or later',
    'hint.mac': 'Which one: Apple menu → About This Mac. “Chip Apple M…” — Apple Silicon, “Processor Intel” — Intel.',
    'req.windows': 'Windows 10 and 11, x64',
    'req.linux': 'x64: Ubuntu, Debian, Fedora',
    'req.android': 'Android 8.0 or later',
    'ios.name': 'iPhone and iPad',
    'ios.name2': 'iPhone and iPad',
    'ios.soon': 'Coming soon',
    'ios.text': 'For now MIZCLIP for iPhone can only be installed from Xcode, for developers. App Store — later.',
    'install.title': 'How to install',
    'install.lead': 'MIZCLIP is not signed by Apple or Microsoft yet, so on first launch your system will warn about an unknown developer. This is expected — here is how to open it.',
    'mac.1': 'Open the .dmg and drag MIZCLIP to Applications.',
    'mac.2': 'macOS 14 and earlier: in Applications, right-click MIZCLIP → Open → Open again in the warning.',
    'mac.3': 'macOS 15 and later: open MIZCLIP → Done in the “could not verify” window → System Settings → Privacy & Security → Open Anyway at the bottom → your Mac password → Open.',
    'mac.4': 'If macOS says the app is “damaged”, run in Terminal:',
    'mac.5': 'To let MIZCLIP paste into other apps, allow Accessibility when macOS asks.',
    'mac.after': 'After that MIZCLIP opens with a normal double-click. A new version installs over the old one — your data stays.',
    'win.1': 'Download the .exe. If the browser warns about an uncommon file — Keep / Keep anyway.',
    'win.2': 'Run it. SmartScreen shows “Windows protected your PC” — click More info → Run anyway.',
    'win.3': 'MIZCLIP installs right away for the current user, no administrator rights needed. Shortcuts — on the desktop and in Start.',
    'linux.1': 'Ubuntu, Debian — the .deb package, dependencies are installed automatically:',
    'linux.2': 'Fedora and others — AppImage:',
    'linux.3': 'Ubuntu 22.04: AppImage needs',
    'linux.4': '. Ubuntu 24.04 and later: if AppImage does not start, install the .deb or run it with',
    'linux.5': 'A key store is required — GNOME Keyring or KWallet. Tray icon on GNOME in Debian and Fedora — the “AppIndicator and KStatusNotifierItem Support” extension.',
    'and.1': 'Download the .apk on your phone and open it — from the browser notification or Downloads.',
    'and.2': 'Android asks for permission: Settings → Allow from this source → back → Install.',
    'and.3': 'If Google Play Protect warns about an unknown app — More details → Install anyway.',
    'and.4': 'A new version installs over the old one — your data stays.',
    'ios.guide': 'The iPhone and iPad version is not released yet: for now it can only be built and installed on your own phone from Xcode. When it is in the App Store or TestFlight, the link will be here.',
    'verify.title': 'Verify a file',
    'verify.lead': 'Compare the SHA-256 of the downloaded file with the one shown for it on this page — they must match to the last character.',
    'verify.apk': 'APK signing certificate, SHA-256',
    'footer.releases': 'All releases and release notes — on GitHub',
    'footer.privacy': 'No trackers, cookies or analytics. Files are downloaded directly from GitHub.',
    'footer.support': 'Support:',
    'footer.policy': 'Privacy Policy',
    'footer.terms': 'Terms of Use'
  };

  const TEXT = {
    ru: {
      title: 'MIZCLIP — скачать',
      downloadFor: 'Скачать для ',
      download: 'Скачать',
      chooseOther: 'Выбрать платформу',
      os: { 'mac-arm64': 'Mac (Apple Silicon)', 'mac-x64': 'Mac (Intel)', windows: 'Windows', appimage: 'Linux', deb: 'Linux', android: 'Android' },
      label: {
        'mac-arm64': 'Apple Silicon (M1 и новее)',
        'mac-x64': 'Intel',
        windows: 'Установщик .exe',
        appimage: 'AppImage — любой дистрибутив',
        deb: '.deb — Ubuntu, Debian',
        android: 'APK'
      },
      version: 'Версия ',
      from: ' от ',
      mb: ' МБ',
      loading: 'Загружаем сведения о последней версии…',
      error: 'Не удалось загрузить сведения о версии. Все файлы — на странице выпусков GitHub.',
      none: 'Первая версия ещё не опубликована — загляните чуть позже.',
      missing: 'В этой версии файла нет',
      altMacIntel: 'Mac с Intel? ',
      altMacArm: 'Mac с Apple Silicon? ',
      altDeb: 'Ubuntu или Debian? ',
      altAppImage: 'Другой дистрибутив? ',
      linkIntel: 'Скачать для Intel',
      linkArm: 'Скачать для Apple Silicon',
      linkDeb: 'Скачать .deb',
      linkAppImage: 'Скачать AppImage',
      hintMac: 'Не знаете, какой Mac? Меню Apple → «Об этом Mac».',
      ios: 'MIZCLIP для iPhone — скоро. Скачайте его на компьютер или Android-телефон.',
      other: 'Выберите свою платформу ниже.',
      copy: 'Копировать',
      copied: 'Скопировано',
      mismatch: 'Контрольная сумма в заметках к выпуску не совпадает с суммой GitHub. Не устанавливайте этот файл и напишите нам.',
      langButton: 'EN',
      langLabel: 'Switch to English'
    },
    en: {
      title: 'MIZCLIP — download',
      downloadFor: 'Download for ',
      download: 'Download',
      chooseOther: 'Choose a platform',
      os: { 'mac-arm64': 'Mac (Apple Silicon)', 'mac-x64': 'Mac (Intel)', windows: 'Windows', appimage: 'Linux', deb: 'Linux', android: 'Android' },
      label: {
        'mac-arm64': 'Apple Silicon (M1 and later)',
        'mac-x64': 'Intel',
        windows: '.exe installer',
        appimage: 'AppImage — any distribution',
        deb: '.deb — Ubuntu, Debian',
        android: 'APK'
      },
      version: 'Version ',
      from: ', ',
      mb: ' MB',
      loading: 'Loading the latest release…',
      error: 'Could not load the release details. All files are on the GitHub releases page.',
      none: 'The first version is not published yet — check back soon.',
      missing: 'Not in this release',
      altMacIntel: 'Intel Mac? ',
      altMacArm: 'Apple Silicon Mac? ',
      altDeb: 'Ubuntu or Debian? ',
      altAppImage: 'Another distribution? ',
      linkIntel: 'Download for Intel',
      linkArm: 'Download for Apple Silicon',
      linkDeb: 'Download .deb',
      linkAppImage: 'Download AppImage',
      hintMac: 'Not sure which Mac? Apple menu → About This Mac.',
      ios: 'MIZCLIP for iPhone is coming soon. Get it on your computer or Android phone.',
      other: 'Choose your platform below.',
      copy: 'Copy',
      copied: 'Copied',
      mismatch: 'The checksum in the release notes does not match the one from GitHub. Do not install this file and let us know.',
      langButton: 'RU',
      langLabel: 'Переключить на русский'
    }
  };

  const $ = (id) => document.getElementById(id);
  const RU_STATIC = {};
  const state = { lang: 'ru', os: 'other', macArch: 'arm64', release: null, status: 'loading' };

  function storageGet(store, key) {
    try { return window[store].getItem(key); } catch (e) { return null; }
  }
  function storageSet(store, key, value) {
    try { window[store].setItem(key, value); } catch (e) { /* приватный режим — без запоминания */ }
  }

  // ОС посетителя — только по данным браузера, без отпечатков.
  function detectOS() {
    const ua = navigator.userAgent || '';
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    if (/iPhone|iPad|iPod/.test(ua) || (/Mac/.test(platform) && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Android/i.test(ua) || /Android/i.test(platform)) return 'android';
    if (/Win/i.test(platform) || /Windows/.test(ua)) return 'windows';
    if (/Mac/i.test(platform) || /Macintosh|Mac OS X/.test(ua)) return 'mac';
    if (/CrOS/.test(ua)) return 'other';
    if (/Linux|X11/i.test(platform) || /Linux|X11/.test(ua)) return 'linux';
    return 'other';
  }

  // Процессор Mac: Chrome и Edge говорят «arm» или «x86»; Safari и Firefox — нет, тогда Apple Silicon и ссылка на Intel.
  function detectMacArch() {
    const data = navigator.userAgentData;
    if (!data || typeof data.getHighEntropyValues !== 'function') return Promise.resolve(null);
    return data.getHighEntropyValues(['architecture'])
      .then((v) => (v.architecture === 'x86' ? 'x64' : v.architecture === 'arm' ? 'arm64' : null))
      .catch(() => null);
  }

  function safeDownloadUrl(value) {
    if (typeof value !== 'string') return null;
    let url;
    try { url = new URL(value); } catch (e) { return null; }
    if (url.protocol !== 'https:' || url.host !== 'github.com') return null;
    if (!url.pathname.startsWith(DOWNLOAD_PATH) || url.pathname.includes('..') || url.search || url.hash) return null;
    return url.href;
  }

  // Суммы из блока SHA256SUMS в заметках к выпуску (scripts/release.sh).
  function parseSums(body) {
    const sums = {};
    if (typeof body !== 'string') return sums;
    const re = /^([0-9a-f]{64}) [ *]?(\S+)\s*$/gm;
    let m;
    while ((m = re.exec(body)) !== null) sums[m[2]] = m[1];
    return sums;
  }

  function parseCert(body) {
    if (typeof body !== 'string') return null;
    const m = /\(SHA-256\):\s*`([0-9a-f]{64})`/.exec(body);
    return m ? m[1] : null;
  }

  function parseRelease(json) {
    if (!json || typeof json.tag_name !== 'string' || !Array.isArray(json.assets)) return null;
    if (!/^v?[0-9A-Za-z.\-]{1,40}$/.test(json.tag_name)) return null;
    const sums = parseSums(json.body);
    const files = {};
    for (const asset of json.assets) {
      if (!asset || typeof asset.name !== 'string') continue;
      const url = safeDownloadUrl(asset.browser_download_url);
      if (!url) continue;
      const key = Object.keys(FILES).find((k) => FILES[k].test(asset.name));
      if (!key || files[key]) continue;
      const digest = typeof asset.digest === 'string' && /^sha256:[0-9a-f]{64}$/.test(asset.digest) ? asset.digest.slice(7) : null;
      const noted = sums[asset.name] || null;
      files[key] = {
        name: asset.name,
        url: url,
        size: Number.isFinite(asset.size) ? asset.size : null,
        sha256: noted || digest,
        mismatch: Boolean(noted && digest && noted !== digest)
      };
    }
    const date = typeof json.published_at === 'string' ? new Date(json.published_at) : null;
    return {
      tag: json.tag_name,
      version: json.tag_name.replace(/^v/, ''),
      date: date && !isNaN(date.getTime()) ? date : null,
      files: files,
      cert: parseCert(json.body)
    };
  }

  function loadRelease() {
    const cached = storageGet('sessionStorage', CACHE_KEY);
    if (cached) {
      try {
        const c = JSON.parse(cached);
        if (Date.now() - c.t < CACHE_MS) return Promise.resolve(c.json);
      } catch (e) { /* испорченный кэш — загрузить заново */ }
    }
    return fetch(API, { credentials: 'omit', referrerPolicy: 'no-referrer' }).then((res) => {
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json().then((json) => {
        // В кэш — только нужные поля.
        const slim = {
          tag_name: json.tag_name,
          published_at: json.published_at,
          body: json.body,
          assets: (json.assets || []).map((a) => ({ name: a.name, size: a.size, digest: a.digest, browser_download_url: a.browser_download_url }))
        };
        storageSet('sessionStorage', CACHE_KEY, JSON.stringify({ t: Date.now(), json: slim }));
        return slim;
      });
    });
  }

  function formatSize(bytes) {
    if (bytes == null) return '';
    const mb = bytes / (1024 * 1024);
    const nf = new Intl.NumberFormat(state.lang === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: mb < 10 ? 1 : 0 });
    return nf.format(mb) + TEXT[state.lang].mb;
  }

  function formatDate(date) {
    if (!date) return '';
    return new Intl.DateTimeFormat(state.lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function primaryKey() {
    switch (state.os) {
      case 'mac': return state.macArch === 'x64' ? 'mac-x64' : 'mac-arm64';
      case 'windows': return 'windows';
      case 'linux': return 'appimage';
      case 'android': return 'android';
      default: return null;
    }
  }

  function setAlt(node, prefix, linkText, file) {
    node.replaceChildren();
    if (!file || file.mismatch) { node.hidden = true; return; }
    node.append(prefix);
    const a = el('a', null, linkText);
    a.href = file.url;
    node.append(a);
    node.hidden = false;
  }

  function renderPrimary() {
    const t = TEXT[state.lang];
    const btn = $('primary-btn');
    const label = $('primary-label');
    const meta = $('primary-meta');
    const alt = $('primary-alt');
    const hint = $('primary-hint');
    const status = $('status');
    const release = state.release;
    const key = primaryKey();
    const file = release && key ? release.files[key] : null;

    alt.hidden = true;
    hint.hidden = true;
    meta.textContent = '';
    status.classList.toggle('error', state.status === 'error');
    status.textContent = state.status === 'loading' ? t.loading : state.status === 'error' ? t.error : state.status === 'none' ? t.none : '';

    if (file && !file.mismatch) {
      label.textContent = t.downloadFor + t.os[key];
      btn.href = file.url;
      meta.textContent = [t.version + release.version, formatDate(release.date), formatSize(file.size)].filter(Boolean).join(' · ');
      const f = release.files;
      if (key === 'mac-arm64') { setAlt(alt, t.altMacIntel, t.linkIntel, f['mac-x64']); hint.textContent = t.hintMac; hint.hidden = false; }
      if (key === 'mac-x64') { setAlt(alt, t.altMacArm, t.linkArm, f['mac-arm64']); hint.textContent = t.hintMac; hint.hidden = false; }
      if (key === 'appimage') setAlt(alt, t.altDeb, t.linkDeb, f.deb);
    } else if (state.status === 'ready') {
      label.textContent = t.chooseOther;
      btn.href = '#download';
      status.textContent = state.os === 'ios' ? t.ios : t.other;
    } else {
      label.textContent = EN_OR_RU('primary.default');
      btn.href = RELEASES;
    }
  }

  function renderFiles() {
    const t = TEXT[state.lang];
    const tpl = $('file-row');
    const release = state.release;
    document.querySelectorAll('.files').forEach((box) => {
      box.replaceChildren();
      if (!release) {
        if (state.status === 'loading') return;
        const a = el('a', 'fallback', EN_OR_RU('download.all'));
        a.href = RELEASES;
        box.append(a);
        return;
      }
      for (const key of box.dataset.files.split(' ')) {
        const file = release.files[key];
        const row = tpl.content.firstElementChild.cloneNode(true);
        row.querySelector('.file-label').textContent = t.label[key];
        const btn = row.querySelector('.file-btn');
        const sha = row.querySelector('.sha');
        if (!file) {
          row.querySelector('.file-meta').textContent = t.missing;
          btn.remove();
          sha.remove();
        } else {
          row.querySelector('.file-meta').textContent = [file.name, formatSize(file.size)].filter(Boolean).join(' · ');
          if (file.mismatch) {
            btn.remove();
            const warn = row.querySelector('.file-warn');
            warn.textContent = t.mismatch;
            warn.hidden = false;
          } else {
            btn.textContent = t.download;
            btn.href = file.url;
          }
          if (file.sha256) {
            row.querySelector('.sha-value').textContent = file.sha256;
            const copy = row.querySelector('.sha-copy');
            copy.textContent = t.copy;
            copy.addEventListener('click', () => {
              if (!navigator.clipboard) return;
              navigator.clipboard.writeText(file.sha256).then(() => {
                copy.textContent = t.copied;
                setTimeout(() => { copy.textContent = TEXT[state.lang].copy; }, 1500);
              }).catch(() => {});
            });
          } else {
            sha.remove();
          }
        }
        box.append(row);
      }
    });
  }

  function renderReleaseLine() {
    const t = TEXT[state.lang];
    const line = $('release-line');
    const release = state.release;
    line.textContent = release ? [t.version + release.version, formatDate(release.date)].filter(Boolean).join(t.from) : '';
    const cert = $('apk-cert');
    if (release && release.cert) {
      $('apk-cert-value').textContent = release.cert;
      cert.hidden = false;
    } else {
      cert.hidden = true;
    }
  }

  function EN_OR_RU(key) {
    return state.lang === 'en' ? EN_STATIC[key] : RU_STATIC[key];
  }

  function applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const value = EN_OR_RU(node.dataset.i18n);
      if (value != null) node.textContent = value;
    });
    document.documentElement.lang = state.lang;
    document.title = TEXT[state.lang].title;
    const button = $('lang');
    button.textContent = TEXT[state.lang].langButton;
    button.setAttribute('aria-label', TEXT[state.lang].langLabel);
    button.lang = state.lang === 'ru' ? 'en' : 'ru';
  }

  function render() {
    applyStatic();
    renderPrimary();
    renderFiles();
    renderReleaseLine();
  }

  function highlightPlatform() {
    const platform = state.os === 'mac' || state.os === 'windows' || state.os === 'linux' || state.os === 'android' || state.os === 'ios' ? state.os : null;
    if (!platform) return;
    const card = document.querySelector('.platform[data-platform="' + platform + '"]');
    if (card) card.classList.add('current');
    const guide = document.querySelector('.guide[data-guide="' + platform + '"]');
    if (guide) guide.open = true;
  }

  function init() {
    document.querySelectorAll('[data-i18n]').forEach((node) => { RU_STATIC[node.dataset.i18n] = node.textContent; });
    const saved = storageGet('localStorage', 'mizclip-lang');
    state.lang = saved === 'ru' || saved === 'en' ? saved : /^ru\b|^ru-/i.test(navigator.language || '') ? 'ru' : (navigator.language ? 'en' : 'ru');
    state.os = detectOS();
    highlightPlatform();
    $('lang').addEventListener('click', () => {
      state.lang = state.lang === 'ru' ? 'en' : 'ru';
      storageSet('localStorage', 'mizclip-lang', state.lang);
      render();
    });
    render();

    const arch = state.os === 'mac' ? detectMacArch() : Promise.resolve(null);
    Promise.all([loadRelease(), arch]).then(([json, macArch]) => {
      if (macArch) state.macArch = macArch;
      if (json === null) { state.status = 'none'; render(); return; }
      const release = parseRelease(json);
      state.release = release;
      state.status = release ? 'ready' : 'error';
      render();
    }).catch(() => {
      state.status = 'error';
      render();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
