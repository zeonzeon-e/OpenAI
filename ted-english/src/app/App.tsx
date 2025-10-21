import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RootLayout } from '../components/Common/RootLayout';
import { ErrorBoundary } from '../components/Common/ErrorBoundary';
import Home from '../pages/Home';

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <RootLayout>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </RootLayout>
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;
