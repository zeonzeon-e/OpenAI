import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { videos } from '../data/videos';
import { VideoDetail } from '../types/video';

export const useAllVideos = () => {
  return useMemo(() => videos, []);
};

export const useVideoById = (): VideoDetail | undefined => {
  const { videoId } = useParams();

  return useMemo(() => videos.find((video) => video.id === videoId), [videoId]);
};
