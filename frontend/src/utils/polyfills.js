// Browser polyfills for Node.js modules
if (typeof window !== 'undefined') {
  if (typeof window.global === 'undefined') {
    window.global = globalThis;
  }

  if (typeof window.process === 'undefined') {
    window.process = {
      env: {},
      nextTick: function(callback, ...args) {
        setTimeout(() => callback(...args), 0);
      },
      browser: true,
      version: '',
      versions: { node: '16.0.0' }
    };
  }
}

// Export for explicit imports
export const process = typeof window !== 'undefined' ? window.process : undefined;
export const global = typeof window !== 'undefined' ? window.global : undefined;
