// do not remove any of these, they are generally required by addon stores
export const MANIFEST_REQUIRED: Record<string, any> = {
  manifest_version: 3, // must be 3 for chrome now
  name: 'Reload All Tabs (in Window)',
  version: '0.0.4',
  description: 'Reload all open tabs in current window.',
  icons: {
    16: 'assets/icon-16.png',
    // 32: 'assets/icon-32.png',
    48: 'assets/icon-48.png',
    128: 'assets/icon-128.png',
  },
};

// these are optional and should work on each target browser
export const MANIFEST_OPTIONAL = {
  author: 'ericchase',
  action: {},
  content_scripts: [],
  web_accessible_resources: [],
  permissions: ['contextMenus', 'storage'],
  host_permissions: [],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
  },
};

// these are optional per browser keys
export const PER_BROWSER_MANIFEST_OPTIONAL = {
  chrome: {
    background: {
      service_worker: 'background.module.js',
      type: 'module',
    },
    options_page: 'options/options.html',
    minimum_chrome_version: '120',
  },
  firefox: {
    action: {
      default_icon: {
        16: 'assets/icon-dark-16.png',
        32: 'assets/icon-dark-32.png',
        48: 'assets/icon-dark-48.png',
        128: 'assets/icon-dark-128.png',
      },
      theme_icons: [
        {
          dark: 'assets/icon-dark-16.png',
          light: 'assets/icon-light-16.png',
          size: 16,
        },
        {
          dark: 'assets/icon-dark-32.png',
          light: 'assets/icon-light-32.png',
          size: 32,
        },
        {
          dark: 'assets/icon-dark-48.png',
          light: 'assets/icon-light-48.png',
          size: 48,
        },
        {
          dark: 'assets/icon-dark-128.png',
          light: 'assets/icon-light-128.png',
          size: 128,
        },
      ],
    },
    background: {
      scripts: ['background.module.js'],
      type: 'module',
    },
    options_ui: {
      page: 'options/options.html',
      open_in_tab: false,
    },
    browser_specific_settings: {
      gecko: {
        strict_min_version: '120.0',
      },
      gecko_android: {},
    },
  },
};

// these are per browser keys for the final addon package
export const PER_BROWSER_MANIFEST_PACKAGE = {
  chrome: {
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmgLYbjh2j7SQDDmkWBw8WxNxdeczxpdm57qcnTVN5ra131TeaePphMggsRnNnBpEdRwJGXtVPlfV5jRK01xbsbE2YzPnRvDAwCoMcL00xhfgaXSyISM1AoET2ZjSNtY02I0+6RV+w5Ko1yJiE5mbUAzY2NsuolSL4M6JNAj4/4GDbpP3sQBYyQKjFZsEEHpVxMoURSFDQji1pe26YVyWKUuMPWtmpV+8bjuavBlxf0S1Y+peHP3vQq/FL0RmCS1/GvUc9Sb8MCpyqFoI3hGCCTpBmTY6Xoq5BiI9NniGHUyEXn4wQLjw1YiGH9Wpu/IvDHsYTmXWBxCqYqAxpKbOMQIDAQAB',
  },
  firefox: {
    browser_specific_settings: {
      gecko: {
        // https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/#when-do-you-need-an-add-on-id
        // All Manifest V3 extensions need an add-on ID in their manifest.json when submitted to AMO.
        // For Manifest V2 extensions, you need to add an add-on ID for certain situations.
        id: '{a517aaff-06f1-41dc-85f4-f4b1e94e4c30}',
      },
    },
  },
};
