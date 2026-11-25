// Safe storage wrapper that gracefully falls back to memory storage in sandboxed iframes
const memoryStore = new Map<string, string>();

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // In sandboxed iframes, localStorage may throw SecurityError
    }
    return memoryStore.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // In sandboxed iframes, localStorage may throw SecurityError
    }
    memoryStore.set(key, value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // noop
    }
    memoryStore.delete(key);
  },
};
