const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

class Element {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.handlers = {};
    this.value = '';
    this.hidden = false;
  }

  append(child) { this.children.push(child); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(name, handler) { this.handlers[name] = handler; }
  dispatch(name, event = {}) { this.handlers[name]?.(event); }
  focus() { this.focused = true; }
  querySelectorAll(selector) {
    return selector === 'button' ? this.children.filter(child => child.tagName === 'button') : [];
  }
}

function loadApp() {
  const ids = ['selectedDate', 'previousDay', 'nextDay', 'calendarButton',
    'calendarPanel', 'calendarDays', 'openCount', 'resultNote', 'courseList',
    'courseTemplate', 'filterButton', 'filters', 'searchInput', 'clearSearch', 'emptyState'];
  const elements = Object.fromEntries(ids.map(id => [id, new Element()]));
  const document = {
    querySelector: selector => elements[selector.slice(1)],
    createElement: tag => new Element(tag),
    title: ''
  };
  const context = { document, window: { OCTOBER_GOLF_COURSES: [] }, navigator: {}, Intl, Date };
  const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  vm.runInNewContext(source, context);
  return elements;
}

test('October grid aligns Thursday the 1st and includes all 31 dates', () => {
  const ui = loadApp();
  const dates = ui.calendarDays.children;
  assert.equal(dates.length, 35);
  assert.deepEqual(dates.slice(0, 4).map(cell => cell.tagName), ['span', 'span', 'span', 'span']);
  assert.equal(dates[4].getAttribute('aria-label'), 'Thursday, October 1, 2026');
  assert.equal(dates[34].textContent, 31);
  assert.equal(dates[4].getAttribute('aria-current'), 'date');
});

test('toggle, select, step, and boundaries update the same selected day', () => {
  const ui = loadApp();
  ui.calendarButton.dispatch('click');
  assert.equal(ui.calendarPanel.hidden, false);
  assert.equal(ui.calendarButton.getAttribute('aria-expanded'), 'true');

  ui.calendarDays.children[34].dispatch('click');
  assert.equal(ui.selectedDate.textContent, 'Sat, Oct 31');
  assert.equal(ui.calendarPanel.hidden, true);
  assert.equal(ui.calendarButton.focused, true);
  assert.equal(ui.nextDay.disabled, true);
  assert.equal(ui.calendarDays.children[34].getAttribute('aria-current'), 'date');

  ui.previousDay.dispatch('click');
  assert.equal(ui.selectedDate.textContent, 'Fri, Oct 30');
  assert.equal(ui.nextDay.disabled, false);
  assert.equal(ui.calendarDays.children[34].getAttribute('aria-current'), null);
  ui.calendarDays.children[4].dispatch('click');
  assert.equal(ui.previousDay.disabled, true);
});

test('Escape closes calendar and restores focus to its toggle', () => {
  const ui = loadApp();
  ui.calendarButton.dispatch('click');
  ui.calendarPanel.dispatch('keydown', { key: 'Escape' });
  assert.equal(ui.calendarPanel.hidden, true);
  assert.equal(ui.calendarButton.getAttribute('aria-expanded'), 'false');
  assert.equal(ui.calendarButton.focused, true);
});
