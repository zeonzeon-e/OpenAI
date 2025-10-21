import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Home } from '../pages/Home';
import { AppShell } from '../components/Common/AppShell';
import { LoadingScreen } from '../components/Common/LoadingScreen';

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingScreen message="초기 데이터를 불러오는 중입니다" /> }>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
