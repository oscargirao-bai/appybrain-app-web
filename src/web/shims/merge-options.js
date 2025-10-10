export default function mergeOptions(target = {}, ...sources) {
  const output = { ...target };
  for (const source of sources) {
    if (source && typeof source === 'object') {
      for (const [key, value] of Object.entries(source)) {
        if (Array.isArray(value)) {
          output[key] = value.slice();
        } else if (value && typeof value === 'object') {
          output[key] = mergeOptions(output[key] || {}, value);
        } else {
          output[key] = value;
        }
      }
    }
  }
  return output;
}
