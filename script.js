
const $ = (id) => document.getElementById(id);

const lockScreen = $('lockScreen');
const homeScreen = $('homeScreen');
const appScreen = $('appScreen');

let currentView = 'lock';
let selectedCalendarDate = null;
let calendarMonth = new Date();
calendarMonth.setDate(1);

const STORAGE = {
  events: 'chocoCalendarEvents',
  stickers: 'chocoCalendarStickers',
  memos: 'chocoCalendarMemos',
  diary: 'chocoDiaryEntries',
  exp: 'chocoCafeExp'
};

// Add your own transparent PNG sticker files in assets/stickers/.
 // The filenames below are intentionally fixed so the calendar can find them.
const STICKER_CATALOG = [
  { file: 'chocolate_kitty.png', name: 'chocolate kitty' },
  { file: 'silvanian_bunny.png', name: 'silvanian bunny' },
  { file: 'pink_character_latte.png', name: 'pink character latte' },
  { file: 'pink_bow_cupcake.png', name: 'pink bow cupcake' },
  { file: 'strawberry_shortcake.png', name: 'strawberry shortcake' },
  { file: 'chocolate_strawberry_cake.png', name: 'chocolate strawberry cake' },
  { file: 'silvanian_cat.png', name: 'silvanian cat' },
  { file: 'pink_drizzle_chocolate.png', name: 'pink drizzle chocolate' },
  { file: 'pink_whipped_cream.png', name: 'pink whipped cream' },
  { file: 'pink_macarons.png', name: 'pink macarons' }
];

const appInfo = {
  dessert: {title:'dessert', heading:'sweet menu', description:'a little sweetness for today'},
  anime: {title:'anime', heading:'anime room', description:'stories that stay in our hearts'},
  music: {title:'music', heading:'music box', description:'songs for every little moment'},
  message: {title:'message', heading:'little letters', description:'a place for lovely messages'},
  diary: {title:'diary', heading:'my diary', description:'photos, notes, and everyday memories'},
  calendar: {title:'calendar', heading:'calendar', description:'today is a page in your story'},
  character: {title:'character', heading:'character room', description:'a tiny space for favorite friends'}
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getEvents() {
  return readStorage(STORAGE.events, []);
}

function saveEvents(events) {
  saveStorage(STORAGE.events, events);
}

function getStickers() {
  return readStorage(STORAGE.stickers, {});
}

function saveStickers(stickers) {
  saveStorage(STORAGE.stickers, stickers);
}

function getMemos() {
  return readStorage(STORAGE.memos, {});
}

function saveMemos(memos) {
  saveStorage(STORAGE.memos, memos);
}

function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function updateClock() {
  const now = new Date();

  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);

  const hour12 = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(now).toLowerCase();

  const dateLong = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(now);

  const dateShort = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now).replaceAll('/', '.');

  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'short'
  }).format(now).toUpperCase();

  $('statusTime').textContent = time;
  $('lockDate').textContent = dateLong.toUpperCase();
  $('lockClock').textContent = hour12;
  $('homeDate').textContent = `${dateShort} ${weekday}`;
  $('homeClock').textContent = time;

  $('homeAmPm').textContent = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: true
  }).format(now).replace(/[0-9]/g, '').trim().toUpperCase();
}

function showLock() {
  currentView = 'lock';
  lockScreen.hidden = false;
  homeScreen.hidden = true;
  appScreen.hidden = true;
  $('unlockLabel').textContent = 'Locked';
}

function showHome() {
  currentView = 'home';
  lockScreen.hidden = true;
  homeScreen.hidden = false;
  appScreen.hidden = true;
}

function openApp(name) {
  const info = appInfo[name];
  if (!info) return;

  currentView = 'app';
  lockScreen.hidden = true;
  homeScreen.hidden = true;
  appScreen.hidden = false;
  appScreen.classList.toggle('calendar-open', name === 'calendar');
  appScreen.classList.toggle('diary-open', name === 'diary');

  $('appTitle').textContent = info.title;
  $('appHeading').textContent = info.heading;
  $('appDescription').textContent = info.description;

  if (name === 'calendar') {
    renderCalendar();
    return;
  }

  if (name === 'diary') {
    renderDiaryPlaceholder();
    return;
  }

  $('appPlaceholder').innerHTML = `
    <span class="placeholder-heart">♡</span>
    <span>coming soon</span>
  `;
}

const DIARY_TEMPLATES = [
  ...[
    ['cute-01', 'mamegoma strawberry', 'image(20261127-115232).png'],
    ['cute-02', 'sugarbunnies pink', 'image(20261127-115252).png'],
    ['cute-03', 'jewelpet hearts', 'image(20261127-115305).png'],
    ['cute-04', 'pink heart frame', 'image(20261127-115321).png'],
    ['cute-05', 'fairytale friends', 'image(20261127-115333).png'],
    ['cute-06', 'rose kitty frame', 'image(20261127-115927).png']
  ].map(([id, name, file]) => ({ id, name, category: 'cute', image: `assets/diary-pages/${file}`, note: 'cute character stationery' })),
  ...[
    ['vintage-01', 'antique floral frame', 'image(20261127-115411).png'],
    ['vintage-02', 'rose corner paper', 'image(20261127-115427).png'],
    ['vintage-03', 'classic parchment', 'image(20261127-115515).png'],
    ['vintage-04', 'rose garden', 'image(20261127-115527).png'],
    ['vintage-05', 'pink rose lace', 'image(20261127-115536).png']
  ].map(([id, name, file]) => ({ id, name, category: 'vintage', image: `assets/diary-pages/${file}`, note: 'vintage paper stationery' })),
  { id: 'free', name: 'my own photo', category: 'free', note: 'use a photo from your device', symbol: '＋' }
];

let diaryCategory = 'cute';

function getDiaryEntries() {
  const entries = readStorage(STORAGE.diary, []);
  return Array.isArray(entries) ? entries : [];
}

function renderDiaryPlaceholder() {
  const dateKey = selectedCalendarDate || localDateKey(new Date());
  const entries = getDiaryEntries().sort((a, b) => b.date.localeCompare(a.date));
  const dateText = formatLongDate(parseDate(dateKey));
  const templates = DIARY_TEMPLATES.filter(template => template.category === diaryCategory);

  $('appPlaceholder').innerHTML = `
    <div class="diary-app">
      <div class="diary-welcome">
        <span class="diary-kicker">a little book of memories</span>
        <h3>my diary ♡</h3>
        <p>keep your little moments here</p>
      </div>
      <label class="diary-date-label" for="diaryDate">diary date</label>
      <input class="diary-date-input" id="diaryDate" type="date" value="${dateKey}">
      <div class="diary-section-title"><span>choose your page</span><small>${escapeHTML(dateText)}</small></div>
      <div class="diary-category-tabs">
        <button type="button" data-category="cute" class="${diaryCategory === 'cute' ? 'active' : ''}">cute paper</button>
        <button type="button" data-category="vintage" class="${diaryCategory === 'vintage' ? 'active' : ''}">vintage paper</button>
        <button type="button" data-category="free" class="${diaryCategory === 'free' ? 'active' : ''}">free</button>
      </div>
      <div class="diary-template-grid ${diaryCategory === 'free' ? 'free-grid' : ''}">
        ${templates.map(template => `
          <button type="button" class="diary-template-card ${template.category}" data-template="${template.id}">
            ${template.image
              ? `<span class="diary-template-image"><img src="${template.image}" alt="${escapeHTML(template.name)}" loading="lazy"></span>`
              : `<span class="diary-template-preview free-preview"><i>＋</i><b>my photo</b><em>bring your own page</em></span>`}
            <strong>${escapeHTML(template.name)}</strong>
            <small>${escapeHTML(template.note)}</small>
          </button>
        `).join('')}
      </div>
      <div class="diary-entry-section">
        <div class="diary-section-title"><span>my pages</span><small>${entries.length} saved</small></div>
        ${entries.length ? `<div class="diary-entry-list">${entries.map(entry => `
          <button type="button" class="diary-entry-row" data-entry-date="${escapeHTML(entry.date)}">
            <span class="diary-entry-date">${escapeHTML(entry.date)}</span>
            <strong>${escapeHTML(entry.title || 'untitled page')}</strong>
            <small>${escapeHTML(DIARY_TEMPLATES.find(t => t.id === entry.template)?.name || entry.template || 'diary page')}</small>
            <b>›</b>
          </button>
        `).join('')}</div>` : '<p class="diary-empty">your story starts with one little page ♡</p>'}
      </div>
    </div>
  `;

  $('diaryDate').addEventListener('change', event => {
    selectedCalendarDate = event.target.value || localDateKey(new Date());
  });
  $('appPlaceholder').querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', () => {
      diaryCategory = button.dataset.category;
      renderDiaryPlaceholder();
    });
  });
  $('appPlaceholder').querySelectorAll('[data-template]').forEach(button => {
    button.addEventListener('click', () => {
      const chosenDate = $('diaryDate').value || localDateKey(new Date());
      openDiaryEditor(chosenDate, button.dataset.template);
    });
  });
  $('appPlaceholder').querySelectorAll('[data-entry-date]').forEach(button => {
    button.addEventListener('click', () => openDiaryEditor(button.dataset.entryDate));
  });
}

function openDiaryEditor(dateKey, templateId = null) {
  const existing = getDiaryEntries().find(entry => entry.date === dateKey);
  const template = templateId || existing?.template || 'vintage-01';
  const templateInfo = DIARY_TEMPLATES.find(item => item.id === template);
  const category = templateInfo?.category || (template === 'deco' ? 'cute' : template === 'free' ? 'free' : 'vintage');
  const data = existing || { title: '', content: '' };
  const pageImage = existing?.pageImage || templateInfo?.image || '';
  let uploadedPageImage = existing?.pageImage || '';
  let diaryPhotos = Array.isArray(existing?.photos) ? existing.photos : [];

  $('appPlaceholder').innerHTML = `
    <div class="diary-editor ${category}">
      <div class="diary-editor-top">
        <button type="button" id="diaryBackToPages">‹ pages</button>
        <span>${escapeHTML(formatLongDate(parseDate(dateKey)))}</span>
      </div>
      <div class="diary-paper" id="diaryPaper" ${pageImage ? `style="--diary-page-image: url('${pageImage}')"` : ''}>
        <div class="diary-paper-heading">${category === 'cute' ? '♡ my lovely day ♡' : category === 'free' ? '♡ little memories ♡' : 'dear diary,'}</div>
        ${category === 'free' ? '<label class="diary-photo-upload">＋ choose your background photo<input type="file" id="diaryPagePhoto" accept="image/*"></label>' : ''}
        <div class="diary-photo-toolbar">
          <label class="diary-add-photo">＋ add photos<input type="file" id="diaryExtraPhotos" accept="image/*" multiple></label>
          <small>tap a photo to select · drag to move</small>
        </div>
        <div class="diary-photo-layer" id="diaryPhotoLayer"></div>
        <input id="diaryEntryTitle" maxlength="70" placeholder="give this day a title..." value="${escapeHTML(data.title || '')}">
        <textarea id="diaryEntryContent" maxlength="5000" placeholder="write down your little moments...">${escapeHTML(data.content || '')}</textarea>
        <div class="diary-paper-footer">made with love　♡</div>
      </div>
      <div class="diary-editor-actions">
        <button type="button" id="diaryCancel">cancel</button>
        <button type="button" id="diarySave">save page ♡</button>
      </div>
    </div>
  `;

  function renderDiaryPhotos() {
    const layer = $('diaryPhotoLayer');
    layer.innerHTML = diaryPhotos.map((photo, index) => `
      <div class="diary-photo-item ${photo.selected ? 'selected' : ''}" data-photo-index="${index}" style="left:${photo.x ?? 8}%;top:${photo.y ?? 25}%;width:${photo.width ?? 30}%">
        <img src="${photo.src}" alt="diary photo ${index + 1}" draggable="false">
        <button type="button" class="diary-photo-delete" data-delete-photo="${index}" aria-label="delete photo">×</button>
      </div>
    `).join('');
    layer.querySelectorAll('[data-delete-photo]').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      diaryPhotos.splice(Number(button.dataset.deletePhoto), 1);
      renderDiaryPhotos();
    }));
    layer.querySelectorAll('.diary-photo-item').forEach(item => {
      item.addEventListener('pointerdown', event => {
        if (event.target.closest('button')) return;
        event.preventDefault();
        const index = Number(item.dataset.photoIndex);
        const paper = $('diaryPaper');
        const rect = paper.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const originalX = diaryPhotos[index].x ?? 8;
        const originalY = diaryPhotos[index].y ?? 25;
        item.classList.add('selected');
        item.setPointerCapture?.(event.pointerId);
        const move = moveEvent => {
          diaryPhotos[index].x = Math.max(0, Math.min(78, originalX + (moveEvent.clientX - startX) / rect.width * 100));
          diaryPhotos[index].y = Math.max(5, Math.min(82, originalY + (moveEvent.clientY - startY) / rect.height * 100));
          item.style.left = `${diaryPhotos[index].x}%`;
          item.style.top = `${diaryPhotos[index].y}%`;
        };
        const stop = () => {
          item.removeEventListener('pointermove', move);
          item.removeEventListener('pointerup', stop);
          item.removeEventListener('pointercancel', stop);
        };
        item.addEventListener('pointermove', move);
        item.addEventListener('pointerup', stop);
        item.addEventListener('pointercancel', stop);
      });
    });
  }
  renderDiaryPhotos();

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const image = new Image();
        image.onerror = reject;
        image.onload = () => {
          const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  const photoInput = $('diaryPagePhoto');
  if (photoInput) photoInput.addEventListener('change', async () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    try {
      uploadedPageImage = await compressImage(file);
      const paper = $('diaryPaper');
      paper.style.setProperty('--diary-page-image', `url("${uploadedPageImage}")`);
      paper.classList.add('has-custom-page-image');
    } catch { showCalendarToast('could not load this photo ♡'); }
  });

  $('diaryExtraPhotos').addEventListener('change', async event => {
    const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('image/'));
    for (const file of files) {
      try {
        const src = await compressImage(file);
        diaryPhotos.push({ src, x: 8 + (diaryPhotos.length % 3) * 8, y: 27 + (diaryPhotos.length % 4) * 5, width: 30 });
      } catch { showCalendarToast('could not load one of the photos ♡'); }
    }
    renderDiaryPhotos();
    event.target.value = '';
  });

  $('diaryBackToPages').addEventListener('click', renderDiaryPlaceholder);
  $('diaryCancel').addEventListener('click', renderDiaryPlaceholder);
  $('diarySave').addEventListener('click', () => {
    const entries = getDiaryEntries();
    const title = $('diaryEntryTitle').value.trim();
    const content = $('diaryEntryContent').value.trim();
    if (!title && !content && diaryPhotos.length === 0) {
      showCalendarToast('write a little something first ♡');
      return;
    }
    const index = entries.findIndex(entry => entry.date === dateKey);
    const savedEntry = {
      id: existing?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: dateKey, title, content, template, pageImage: uploadedPageImage, photos: diaryPhotos,
      updatedAt: new Date().toISOString()
    };
    if (index >= 0) entries[index] = savedEntry;
    else entries.push(savedEntry);
    try {
      saveStorage(STORAGE.diary, entries);
      selectedCalendarDate = dateKey;
      showCalendarToast('your diary page is saved ♡');
      renderDiaryPlaceholder();
    } catch {
      showCalendarToast('storage is full — try fewer or smaller photos ♡');
    }
  });
}

function goBack() {
  if (currentView === 'app') showHome();
  else if (currentView === 'home') showLock();
  else showHome();
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function monthTitle(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function hasDiaryEntry(dateKey) {
  const entries = readStorage(STORAGE.diary, []);
  return Array.isArray(entries) && entries.some(entry =>
    entry.date === dateKey || entry.dateKey === dateKey
  );
}

function getExp() {
  return Number(localStorage.getItem(STORAGE.exp) || 0);
}

function addExp(amount) {
  const next = getExp() + amount;
  localStorage.setItem(STORAGE.exp, String(next));
  showCalendarToast(`+${amount} exp ♡`);
}

function showCalendarToast(message) {
  let toast = document.querySelector('.calendar-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'calendar-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* Calendar rendering */

function renderCalendar() {
  const placeholder = $('appPlaceholder');
  const todayKey = localDateKey(new Date());
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();

  // Monday-first calendar
  const offset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((offset + lastDate) / 7) * 7;

  const events = getEvents();
  const stickers = getStickers();
  const currentMonthKey = monthKey(calendarMonth);
  const memos = getMemos();

  let cells = '';

  for (let i = 0; i < totalCells; i++) {
    const day = i - offset + 1;
    const valid = day >= 1 && day <= lastDate;

    if (!valid) {
      cells += `<div class="calendar-day empty-day"></div>`;
      continue;
    }

    const date = new Date(year, month, day);
    const dateKey = localDateKey(date);
    const dayEvents = events.filter(event => event.date === dateKey);
    const sticker = stickers[dateKey] || '';
    const stickerItem = STICKER_CATALOG.find(item => item.file === sticker);
    const isToday = dateKey === todayKey;
    const isSelected = dateKey === selectedCalendarDate;
    const diaryExists = hasDiaryEntry(dateKey);

    const classes = [
      'calendar-day',
      i % 7 === 6 ? 'sunday' : '',
      isToday ? 'today' : '',
      isSelected ? 'selected' : ''
    ].filter(Boolean).join(' ');

    const eventDots = dayEvents.slice(0, 2).map(event =>
      `<span class="calendar-event-dot ${event.completed ? 'done' : ''}"></span>`
    ).join('');

    cells += `
      <button type="button" class="${classes}" data-date="${dateKey}">
        <span class="calendar-day-number">${day}</span>
        ${stickerItem ? `<img class="calendar-sticker" src="assets/stickers/${escapeHTML(stickerItem.file)}" alt="${escapeHTML(stickerItem.name)}" title="${escapeHTML(stickerItem.name)}">` : (sticker && !sticker.includes('.png') ? `<span class="calendar-sticker">${escapeHTML(sticker)}</span>` : '')}
        ${diaryExists ? '<span class="diary-marker" title="diary entry">✎</span>' : ''}
        <span class="calendar-event-dots">${eventDots}</span>
      </button>
    `;
  }

  const memoValue = memos[currentMonthKey] || '';

  placeholder.innerHTML = `
    <div class="calendar-app">
      <div class="calendar-month-header">
        <button class="calendar-nav" id="calendarPrev" type="button" aria-label="previous month">‹</button>
        <div class="calendar-month-title">
          <span class="calendar-month-name">${escapeHTML(monthTitle(calendarMonth))}</span>
          <small>monthly planner ♡</small>
        </div>
        <button class="calendar-nav" id="calendarNext" type="button" aria-label="next month">›</button>
      </div>

      <div class="calendar-weekdays">
        ${['mon','tue','wed','thu','fri','sat','sun'].map(day =>
          `<div>${day}</div>`
        ).join('')}
      </div>

      <div class="calendar-grid">
        ${cells}
      </div>

      <div class="calendar-bottom">
        <div class="calendar-mini">
          <div class="calendar-mini-title">${escapeHTML(monthTitle(calendarMonth))}</div>
          <div class="calendar-mini-grid">
            ${['m','t','w','t','f','s','s'].map(day => `<span>${day}</span>`).join('')}
            ${Array.from({length: totalCells}, (_, i) => {
              const day = i - offset + 1;
              if (day < 1 || day > lastDate) return '<span></span>';
              return `<span class="${day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ? 'mini-today' : ''}">${day}</span>`;
            }).join('')}
          </div>
        </div>

        <div class="calendar-memo">
          <label for="calendarMemo">memo</label>
          <textarea id="calendarMemo" placeholder="little notes for this month...">${escapeHTML(memoValue)}</textarea>
          <span class="memo-saved" id="memoSaved">♡ saved automatically</span>
        </div>
      </div>

      <div class="calendar-detail" id="calendarDetail">
        <div class="calendar-detail-empty">
          choose a date to see your schedule ♡
        </div>
      </div>
    </div>
  `;

  $('calendarPrev').addEventListener('click', () => changeCalendarMonth(-1));
  $('calendarNext').addEventListener('click', () => changeCalendarMonth(1));

  placeholder.querySelectorAll('.calendar-day[data-date]').forEach(button => {
    button.addEventListener('click', () => {
      selectedCalendarDate = button.dataset.date;
      renderCalendar();
      renderDateDetail();
    });
  });

  const memo = $('calendarMemo');
  memo.addEventListener('input', () => {
    const updatedMemos = getMemos();
    updatedMemos[currentMonthKey] = memo.value;
    saveMemos(updatedMemos);
    $('memoSaved').textContent = '♡ saved';
  });

  if (selectedCalendarDate && selectedCalendarDate.startsWith(currentMonthKey)) {
    renderDateDetail();
  }
}

function changeCalendarMonth(amount) {
  calendarMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + amount,
    1
  );

  selectedCalendarDate = null;
  renderCalendar();
}

function renderDateDetail() {
  const detail = $('calendarDetail');
  if (!detail || !selectedCalendarDate) return;

  const date = parseDate(selectedCalendarDate);
  const events = getEvents().filter(event => event.date === selectedCalendarDate);

  detail.innerHTML = `
    <div class="calendar-detail-heading">
      <div>
        <small>selected date</small>
        <strong>${escapeHTML(formatLongDate(date))}</strong>
      </div>
      <button type="button" class="calendar-add-button" id="addCalendarEvent">＋ add</button>
    </div>

    <div class="calendar-event-list">
      ${events.length ? events.map(event => `
        <div class="calendar-event-item ${event.completed ? 'event-completed' : ''}">
          <label class="event-check">
            <input type="checkbox" data-complete="${escapeHTML(event.id)}" ${event.completed ? 'checked' : ''}>
            <span></span>
          </label>
          <div class="event-copy">
            <strong>${escapeHTML(event.title)}</strong>
            ${event.note ? `<small>${escapeHTML(event.note)}</small>` : ''}
          </div>
          <button type="button" class="event-edit" data-edit="${escapeHTML(event.id)}">edit</button>
          <button type="button" class="event-delete" data-delete="${escapeHTML(event.id)}" aria-label="delete">×</button>
        </div>
      `).join('') : `
        <div class="calendar-no-events">no plans for this day yet ♡</div>
      `}
    </div>

    <div class="calendar-detail-actions">
      <button type="button" id="calendarDiaryButton">write diary</button>
      <button type="button" id="calendarStickerButton">add sticker</button>
    </div>

    <div class="calendar-sticker-picker" id="calendarStickerPicker" hidden>
      <small>choose a sticker</small>
      <div>
        ${STICKER_CATALOG.map(sticker =>
          `<button type="button" class="sticker-choice" data-sticker="${escapeHTML(sticker.file)}" aria-label="${escapeHTML(sticker.name)}"><img src="assets/stickers/${escapeHTML(sticker.file)}" alt="${escapeHTML(sticker.name)}"></button>`
        ).join('')}
        <button type="button" data-sticker="" class="remove-sticker">remove</button>
      </div>
    </div>
  `;

  $('addCalendarEvent').addEventListener('click', () => showEventForm());

  detail.querySelectorAll('[data-complete]').forEach(input => {
    input.addEventListener('change', () => toggleEventComplete(input.dataset.complete));
  });

  detail.querySelectorAll('[data-edit]').forEach(button => {
    button.addEventListener('click', () => showEventForm(button.dataset.edit));
  });

  detail.querySelectorAll('[data-delete]').forEach(button => {
    button.addEventListener('click', () => deleteEvent(button.dataset.delete));
  });

  $('calendarDiaryButton').addEventListener('click', () => {
    openApp('diary');
  });

  $('calendarStickerButton').addEventListener('click', () => {
    const picker = $('calendarStickerPicker');
    picker.hidden = !picker.hidden;
  });

  detail.querySelectorAll('[data-sticker]').forEach(button => {
    button.addEventListener('click', () => {
      const allStickers = getStickers();

      if (button.dataset.sticker) {
        allStickers[selectedCalendarDate] = button.dataset.sticker;
      } else {
        delete allStickers[selectedCalendarDate];
      }

      saveStickers(allStickers);
      renderCalendar();
      renderDateDetail();
    });
  });
}

function showEventForm(eventId = null) {
  const existing = eventId
    ? getEvents().find(event => event.id === eventId)
    : null;

  const detail = $('calendarDetail');

  const form = document.createElement('form');
  form.className = 'calendar-event-form';
  form.innerHTML = `
    <label>
      event
      <input name="title" maxlength="70" required placeholder="what's happening?" value="${existing ? escapeHTML(existing.title) : ''}">
    </label>
    <label>
      note
      <textarea name="note" maxlength="250" placeholder="add a little note...">${existing ? escapeHTML(existing.note || '') : ''}</textarea>
    </label>
    <div class="calendar-form-actions">
      <button type="submit">${existing ? 'save changes' : 'save event'}</button>
      <button type="button" id="cancelEventForm">cancel</button>
    </div>
  `;

  detail.appendChild(form);

  $('cancelEventForm').addEventListener('click', () => form.remove());

  form.addEventListener('submit', event => {
    event.preventDefault();

    const formData = new FormData(form);
    const title = String(formData.get('title') || '').trim();
    const note = String(formData.get('note') || '').trim();

    if (!title) return;

    const events = getEvents();

    if (existing) {
      const index = events.findIndex(item => item.id === eventId);
      if (index !== -1) {
        events[index].title = title;
        events[index].note = note;
      }
    } else {
      events.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: selectedCalendarDate,
        title,
        note,
        completed: false,
        rewarded: false
      });
    }

    saveEvents(events);
    renderCalendar();
    renderDateDetail();
    showCalendarToast('schedule saved ♡');
  });
}

function toggleEventComplete(eventId) {
  const events = getEvents();
  const event = events.find(item => item.id === eventId);

  if (!event) return;

  event.completed = !event.completed;

  if (event.completed && !event.rewarded) {
    event.rewarded = true;
    addExp(5);
  }

  saveEvents(events);
  renderCalendar();
  renderDateDetail();
}

function deleteEvent(eventId) {
  if (!confirm('delete this schedule?')) return;

  saveEvents(getEvents().filter(event => event.id !== eventId));
  renderCalendar();
  renderDateDetail();
  showCalendarToast('schedule deleted');
}

/* Phone navigation */

$('unlockButton').addEventListener('click', showHome);
$('homeButton').addEventListener('click', showHome);
$('backButton').addEventListener('click', goBack);
$('menuButton').addEventListener('click', goBack);
$('appBack').addEventListener('click', showHome);

document.querySelectorAll('.app-icon').forEach(button => {
  button.addEventListener('click', () => openApp(button.dataset.app));
});

updateClock();
setInterval(updateClock, 1000);
