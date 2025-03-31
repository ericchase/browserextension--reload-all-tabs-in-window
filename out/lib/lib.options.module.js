// src/lib/lib.options.module.ts
import { ChromeCallback } from "../external/chrome/chrome.module.js";
var options = {
  delay: 0,
  show_page_context_menu_item: true,
  use_advanced_options: false,
  advanced_delay_range_start: 0,
  advanced_delay_range_end: 0
};
var OptionKeys = Object.freeze(Object.keys(options));
async function LoadOptions() {
  let data = {};
  if (typeof chrome !== "undefined") {
    const { callback, promise } = ChromeCallback();
    chrome.storage.local.get(OptionKeys, callback);
    data = await promise;
  } else {
    data = JSON.parse(localStorage.getItem("options") ?? "{}");
  }
  if (typeof data.delay === "number") {
    options.delay = data.delay;
  }
  if (typeof data.show_page_context_menu_item === "boolean") {
    options.show_page_context_menu_item = data.show_page_context_menu_item;
  }
  if (typeof data.use_advanced_options === "boolean") {
    options.use_advanced_options = data.use_advanced_options;
  }
  if (typeof data.advanced_delay_range_end === "number") {
    options.advanced_delay_range_end = data.advanced_delay_range_end;
  }
  if (typeof data.advanced_delay_range_start === "number") {
    options.advanced_delay_range_start = data.advanced_delay_range_start;
  }
}
async function SaveOptions() {
  if (typeof chrome !== "undefined") {
    const { callback, promise } = ChromeCallback();
    chrome.storage.local.set(options, callback);
    await promise;
  } else {
    localStorage.setItem("options", JSON.stringify(options));
  }
}
export {
  options,
  SaveOptions,
  OptionKeys,
  LoadOptions
};
