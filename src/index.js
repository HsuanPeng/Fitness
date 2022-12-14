import ReactDOM from 'react-dom/client';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import App from './App';
import Home from './pages/Home/Home';
import Training from './pages/Training/Training';
import CalendarPage from './pages/CalendarPage/CalendarPage';
import Statistics from './pages/Statistics/Statistics';
import Map from './pages/Map/Map';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="training" element={<Training />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="map" element={<Map />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
