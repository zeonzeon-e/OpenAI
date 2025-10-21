export const extractYouTubeId = (url: string): string | undefined => {
  if (!url) return undefined;
  const pattern =
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/;
  const match = url.match(pattern);
  return match?.[1];
};

export const formatTimestamp = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
