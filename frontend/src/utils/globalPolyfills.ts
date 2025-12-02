// SockJS (and some other browserified libraries) expect certain Node globals.
// Ensure they exist so importing the package does not crash in the browser.

declare global {
  // Augment the global scope so TypeScript knows the property can exist.
  var global: typeof globalThis | undefined;
}

if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis;
}

export {};
