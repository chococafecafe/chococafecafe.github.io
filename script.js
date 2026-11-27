
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

function renderDiaryPlaceholder() {
  const dateText = selectedCalendarDate
    ? formatLongDate(parseDate(selectedCalendarDate))
    : 'choose a date to begin';

  $('appPlaceholder').innerHTML = `
    <span class="placeholder-heart">♡</span>
    <strong>my diary</strong>
    <span>${escapeHTML(dateText)}</span>
    <span>diary editor coming soon</span>
  `;
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
