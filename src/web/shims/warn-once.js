const warned = new Set();

export default function warnOnce(message) {
  if (!warned.has(message)) {
    warned.add(message);
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[warn-once]', message);
    }
  }
}
