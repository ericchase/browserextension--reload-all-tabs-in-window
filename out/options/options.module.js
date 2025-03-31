// src/options/options.module.ts
import { ChromeCallback } from "../external/chrome/chrome.module.js";

// src/lib/ericchase/WebAPI/Node_Utility.ts
class CNodeRef {
  node;
  constructor(node) {
    if (node === null) {
      throw new ReferenceError("Reference is null.");
    }
    if (node === undefined) {
      throw new ReferenceError("Reference is undefined.");
    }
    this.node = node;
  }
  as(constructor_ref) {
    if (this.node instanceof constructor_ref)
      return this.node;
    throw new TypeError(`Reference node is not ${constructor_ref}`);
  }
  is(constructor_ref) {
    return this.node instanceof constructor_ref;
  }
  passAs(constructor_ref, fn) {
    if (this.node instanceof constructor_ref) {
      fn(this.node);
    }
  }
  tryAs(constructor_ref) {
    if (this.node instanceof constructor_ref) {
      return this.node;
    }
  }
  get classList() {
    return this.as(HTMLElement).classList;
  }
  get className() {
    return this.as(HTMLElement).className;
  }
  get style() {
    return this.as(HTMLElement).style;
  }
  getAttribute(qualifiedName) {
    return this.as(HTMLElement).getAttribute(qualifiedName);
  }
  setAttribute(qualifiedName, value) {
    this.as(HTMLElement).setAttribute(qualifiedName, value);
  }
  getStyleProperty(property) {
    return this.as(HTMLElement).style.getPropertyValue(property);
  }
  setStyleProperty(property, value, priority) {
    this.as(HTMLElement).style.setProperty(property, value, priority);
  }
}
function NodeRef(node) {
  return new CNodeRef(node);
}

class CNodeListRef extends Array {
  constructor(nodes) {
    if (nodes === null) {
      throw new ReferenceError("Reference list is null.");
    }
    if (nodes === undefined) {
      throw new ReferenceError("Reference list is undefined.");
    }
    super();
    for (const node of Array.from(nodes)) {
      try {
        this.push(new CNodeRef(node));
      } catch (_) {}
    }
  }
  as(constructor_ref) {
    return this.filter((ref) => ref.is(constructor_ref)).map((ref) => ref.as(constructor_ref));
  }
  passEachAs(constructor_ref, fn) {
    for (const ref of this) {
      ref.passAs(constructor_ref, fn);
    }
  }
}
function NodeListRef(nodes) {
  return new CNodeListRef(nodes);
}

// src/options/options.module.ts
import { LoadOptions, options, SaveOptions } from "../lib/lib.options.module.js";
var number_delay = NodeRef(document.querySelector("#delay input")).as(HTMLInputElement);
var checkbox_show_context_menu_item = NodeRef(document.querySelector("#show-context-menu-item input")).as(HTMLInputElement);
var checkbox_use_advanced_options = NodeRef(document.querySelector("#use-advanced-options input")).as(HTMLInputElement);
var [number_advanced_delay_start, number_advanced_delay_end] = NodeListRef(document.querySelectorAll("#advanced-options input")).as(HTMLInputElement);
var div_advanced_options = NodeRef(document.querySelector("#advanced-options")).as(HTMLDivElement);
var span_save_status = NodeRef(document.querySelector("#save-status")).as(HTMLSpanElement);
await LoadOptions();
number_delay.value = options.delay.toString(10);
checkbox_show_context_menu_item.checked = options.show_page_context_menu_item;
checkbox_use_advanced_options.checked = options.use_advanced_options;
number_advanced_delay_start.value = options.advanced_delay_range_start.toString(10);
number_advanced_delay_end.value = options.advanced_delay_range_end.toString(10);
var save_blinking_interval = undefined;
for (const input of [number_delay, checkbox_show_context_menu_item, checkbox_use_advanced_options, number_advanced_delay_start, number_advanced_delay_end]) {
  input.addEventListener("input", CheckForChanges);
}
var button_save = NodeRef(document.querySelector("#save-button")).as(HTMLButtonElement);
button_save.addEventListener("click", HandleSave);
CheckForChanges();
async function HandleSave() {
  options.delay = ToInt(number_delay);
  options.show_page_context_menu_item = checkbox_show_context_menu_item.checked;
  options.use_advanced_options = checkbox_use_advanced_options.checked;
  options.advanced_delay_range_start = ToInt(number_advanced_delay_start);
  options.advanced_delay_range_end = ToInt(number_advanced_delay_end);
  try {
    await SaveOptions();
    div_advanced_options.classList.toggle("hidden", !options.use_advanced_options);
    span_save_status.textContent = "Options saved successfully.";
    UpdateContextMenus();
    setTimeout(() => {
      span_save_status.textContent = "";
    }, 1500);
  } catch (error) {
    span_save_status.textContent = `Error! ${error}`;
  }
  CheckForChanges();
}
function CheckForChanges() {
  clearInterval(save_blinking_interval);
  if (options.delay !== ToInt(number_delay) || options.show_page_context_menu_item !== checkbox_show_context_menu_item.checked || options.use_advanced_options !== checkbox_use_advanced_options.checked || options.advanced_delay_range_start !== ToInt(number_advanced_delay_start) || options.advanced_delay_range_end !== ToInt(number_advanced_delay_end)) {
    button_save.toggleAttribute("disabled", false);
    button_save.classList.toggle("alt-color");
    save_blinking_interval = setInterval(() => {
      button_save.classList.toggle("alt-color");
    }, 500);
  } else {
    button_save.toggleAttribute("disabled", true);
    button_save.classList.remove("alt-color");
  }
  div_advanced_options.classList.toggle("hidden", !checkbox_use_advanced_options.checked);
}
async function UpdateContextMenus() {
  try {
    if (typeof chrome !== "undefined") {
      const { callback, promise } = ChromeCallback();
      chrome.contextMenus.update("page--reload-all-tabs-in-window", { visible: options.show_page_context_menu_item }, callback);
      await promise;
    }
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
  }
}
function ToInt(input) {
  return Number.parseInt(input.value) || 0;
}
