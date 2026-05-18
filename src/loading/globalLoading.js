/** Bootstrap-only loader flag (logged-in session restore on app open). */

let bootstrapCount = 0;

const listeners = new Set();

const notify = () => {
  const active = bootstrapCount > 0;
  listeners.forEach((listener) => {
    listener(active);
  });
};

export const subscribeBootstrapLoading = (listener) => {
  listeners.add(listener);
  listener(bootstrapCount > 0);
  return () => {
    listeners.delete(listener);
  };
};

export const setBootstrapLoading = (active) => {
  bootstrapCount = active ? 1 : 0;
  notify();
};
