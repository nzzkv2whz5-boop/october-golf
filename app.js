const courses = window.OCTOBER_GOLF_COURSES || [];
const daySlider = document.querySelector('#daySlider');
const dayNumber = document.querySelector('#dayNumber');
const selectedDate = document.querySelector('#selectedDate');
const previousDay = document.querySelector('#previousDay');
const nextDay = document.querySelector('#nextDay');
const openCount = document.querySelector('#openCount');
const resultNote = document.querySelector('#resultNote');
const courseList = document.querySelector('#courseList');
const courseTemplate = document.querySelector('#courseTemplate');
const filterButton = document.querySelector('#filterButton');
const filters = document.querySelector('#filters');
const searchInput = document.querySelector('#searchInput');
const clearSearch = document.querySelector('#clearSearch');
const emptyState = document.querySelector('#emptyState');

const longDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Phoenix'
});
const shortDate = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', timeZone: 'America/Phoenix'
});

function dateFor(day) {
  return new Date(Date.UTC(2026, 9, day, 12));
}

function isOpen(course, dateKey) {
  if (!course.overseed) return true;
  if (!course.closure || !course.reopening) return false;
  return dateKey < course.closure || dateKey >= course.reopening;
}

function detailFor(course, dateKey) {
  if (!course.overseed) return 'No overseed closure planned';
  if (course.reopening && dateKey >= course.reopening) {
    return `Reopened ${shortDate.format(new Date(`${course.reopening}T12:00:00-07:00`))}`;
  }
  if (course.closure && dateKey < course.closure) {
    return `Closes ${shortDate.format(new Date(`${course.closure}T12:00:00-07:00`))}`;
  }
  return '';
}

function render() {
  const day = Number(daySlider.value);
  const date = dateFor(day);
  const dateKey = `2026-10-${String(day).padStart(2, '0')}`;
  const query = searchInput.value.trim().toLocaleLowerCase();
  const open = courses.filter(course => isOpen(course, dateKey));
  const visible = open.filter(course => {
    const haystack = `${course.facility} ${course.course || ''} ${course.city}`.toLocaleLowerCase();
    return !query || haystack.includes(query);
  });

  dayNumber.textContent = day;
  selectedDate.textContent = longDate.format(date);
  previousDay.disabled = day === 1;
  nextDay.disabled = day === 31;
  openCount.textContent = open.length;
  resultNote.textContent = query
    ? `${visible.length} matching ${visible.length === 1 ? 'course' : 'courses'}`
    : 'Based on published overseed dates';

  courseList.replaceChildren(...visible.map((course, index) => {
    const card = courseTemplate.content.firstElementChild.cloneNode(true);
    card.style.animationDelay = `${Math.min(index, 10) * 18}ms`;
    card.querySelector('.course-name').textContent = course.course
      ? `${course.facility} — ${course.course}`
      : course.facility;
    card.querySelector('.course-detail').textContent = detailFor(course, dateKey);
    card.querySelector('.course-location').textContent = `${course.city}, AZ ${course.zip}`;
    const contact = card.querySelector('.course-contact');
    if (course.phone) {
      const phone = card.querySelector('.course-phone');
      phone.textContent = course.phone;
      phone.href = `tel:+1${course.phone.replace(/\D/g, '')}`;
      phone.setAttribute('aria-label', `Call ${course.facility} at ${course.phone}`);
    } else {
      contact.remove();
    }
    return card;
  }));
  emptyState.hidden = visible.length !== 0;
  clearSearch.hidden = !searchInput.value;
  document.title = `${open.length} Open · October ${day} · October Golf`;
}

function stepDay(amount) {
  daySlider.value = Math.max(1, Math.min(31, Number(daySlider.value) + amount));
  render();
}

daySlider.addEventListener('input', render);
previousDay.addEventListener('click', () => stepDay(-1));
nextDay.addEventListener('click', () => stepDay(1));
searchInput.addEventListener('input', render);
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  render();
});
filterButton.addEventListener('click', () => {
  const expanded = filterButton.getAttribute('aria-expanded') === 'true';
  filterButton.setAttribute('aria-expanded', String(!expanded));
  filters.hidden = expanded;
  if (!expanded) searchInput.focus();
});

render();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
}
