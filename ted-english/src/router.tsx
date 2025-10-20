import { createBrowserRouter } from 'react-router-dom';

import { RootLayout } from './components/RootLayout';
import { ErrorPage } from './pages/ErrorPage';
import { HomePage } from './pages/HomePage';
import { VideoPage } from './pages/VideoPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'videos/:videoId',
        element: <VideoPage />,
      },
    ],
  },
]);
