import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { videos } from '../data/videos';
import { VideoDetail } from '../types/video';

const sortedVideos = [...videos].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

export const useAllVideos = () => {
  return useMemo(() => sortedVideos, []);
};

export const useVideoById = (): VideoDetail | undefined => {
  const { videoId } = useParams();

  return useMemo(() => sortedVideos.find((video) => video.id === videoId), [videoId]);
};
