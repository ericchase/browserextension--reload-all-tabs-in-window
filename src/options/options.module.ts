import { ChromeCallback } from '../external/chrome/chrome.module.js';
import { NodeListRef, NodeRef } from '../lib/ericchase/WebAPI/Node_Utility.js';
import { LoadOptions, options, SaveOptions } from '../lib/lib.options.module.js';

const number_delay = NodeRef(document.querySelector('#delay input')).as(HTMLInputElement);
const checkbox_show_context_menu_item = NodeRef(document.querySelector('#show-context-menu-item input')).as(HTMLInputElement);
const checkbox_use_advanced_options = NodeRef(document.querySelector('#use-advanced-options input')).as(HTMLInputElement);
const [number_advanced_delay_start, number_advanced_delay_end] = NodeListRef(document.querySelectorAll('#advanced-options input')).as(HTMLInputElement);

const div_advanced_options = NodeRef(document.querySelector('#advanced-options')).as(HTMLDivElement);
const span_save_status = NodeRef(document.querySelector('#save-status')).as(HTMLSpanElement);

await LoadOptions();

number_delay.value = options.delay.toString(10);
checkbox_show_context_menu_item.checked = options.show_page_context_menu_item;
checkbox_use_advanced_options.checked = options.use_advanced_options;
// advanced options
number_advanced_delay_start.value = options.advanced_delay_range_start.toString(10);
number_advanced_delay_end.value = options.advanced_delay_range_end.toString(10);

/** @type {Timer|undefined} */
let save_blinking_interval: Timer | undefined = undefined;

for (const input of [number_delay, checkbox_show_context_menu_item, checkbox_use_advanced_options, number_advanced_delay_start, number_advanced_delay_end]) {
  input.addEventListener('input', CheckForChanges);
}

// Save Options
const button_save = NodeRef(document.querySelector('#save-button')).as(HTMLButtonElement);
button_save.addEventListener('click', HandleSave);

CheckForChanges();

// Functions

async function HandleSave() {
  options.delay = ToInt(number_delay);
  options.show_page_context_menu_item = checkbox_show_context_menu_item.checked;
  // advanced options
  options.use_advanced_options = checkbox_use_advanced_options.checked;
  options.advanced_delay_range_start = ToInt(number_advanced_delay_start);
  options.advanced_delay_range_end = ToInt(number_advanced_delay_end);
  try {
    await SaveOptions();
    div_advanced_options.classList.toggle('hidden', !options.use_advanced_options);
    span_save_status.textContent = 'Options saved successfully.';
    UpdateContextMenus();
    setTimeout(() => {
      span_save_status.textContent = '';
    }, 1500);
  } catch (error) {
    span_save_status.textContent = `Error! ${error}`;
  }
  CheckForChanges();
}

function CheckForChanges() {
  clearInterval(save_blinking_interval);
  if (
    options.delay !== ToInt(number_delay) || //
    options.show_page_context_menu_item !== checkbox_show_context_menu_item.checked ||
    // advanced options
    options.use_advanced_options !== checkbox_use_advanced_options.checked ||
    options.advanced_delay_range_start !== ToInt(number_advanced_delay_start) ||
    options.advanced_delay_range_end !== ToInt(number_advanced_delay_end)
  ) {
    button_save.toggleAttribute('disabled', false);
    button_save.classList.toggle('alt-color');
    save_blinking_interval = setInterval(() => {
      button_save.classList.toggle('alt-color');
    }, 500);
  } else {
    button_save.toggleAttribute('disabled', true);
    button_save.classList.remove('alt-color');
  }
  div_advanced_options.classList.toggle('hidden', !checkbox_use_advanced_options.checked);
}

async function UpdateContextMenus() {
  try {
    if (typeof chrome !== 'undefined') {
      const { callback, promise } = ChromeCallback();
      chrome.contextMenus.update('page--reload-all-tabs-in-window', { visible: options.show_page_context_menu_item }, callback);
      await promise;
    }
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
  }
}

function ToInt(input: HTMLInputElement) {
  return Number.parseInt(input.value) || 0;
}
