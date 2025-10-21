export const formatDuration = (seconds?: number, fallback?: string) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds) || seconds <= 0) {
    return fallback ?? '0:00';
  }

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(hrs > 0 ? 2 : 1, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');

  return hrs > 0 ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`;
};
