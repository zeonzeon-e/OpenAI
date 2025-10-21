export function parseTimestamp(value?: string) {
  if (!value) {
    return undefined;
  }
  const parts = value.split(':').map(Number);
  if (parts.some((part) => Number.isNaN(part))) {
    return undefined;
  }
  const [hours, minutes, seconds] =
    parts.length === 3
      ? (parts as [number, number, number])
      : parts.length === 2
        ? ([0, parts[0], parts[1]] as [number, number, number])
        : ([0, 0, parts[0]] as [number, number, number]);
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatSeconds(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return '0:00';
  }
  const whole = Math.max(0, Math.floor(seconds));
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
