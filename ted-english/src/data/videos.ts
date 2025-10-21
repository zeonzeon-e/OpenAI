import { VideoDetail } from '../types/video';

// 유지보수를 쉽게 하기 위해 기본 학습 데이터는 비워 두고 YouTube 채널에서 동적으로 채웁니다.
// 네트워크 오류가 발생한 경우를 대비하여 비상용 레코드를 추가하고 싶다면 이 배열에 항목을 넣으면 됩니다.
export const videos: VideoDetail[] = [];

export const videosById = videos.reduce<Record<string, VideoDetail>>((accumulator, video) => {
  accumulator[video.id] = video;
  return accumulator;
}, {});
