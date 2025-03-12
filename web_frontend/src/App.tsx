import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setToken } from './State/authSlice.js';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute.js';
import OAuthCallback from './Components/OAuthCallback.js';
import LoginPage from "./Pages/LoginPage.js"
import DashboardPage from "./Pages/DashboardPage.js"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProfilePage from './Pages/ProfilePage.js';
import SettingsPage from './Pages/SettingsPage.js';
import NotificationsPage from './Pages/NotificationsPage.js';
import MapPage from './Pages/MapPage.js';
import ActiveAlertsPage from './Pages/ActiveAlertsPage.js';
import HistoricalDataPage from './Pages/HistoricalDataPage.js';
import ExportDataPage from './Pages/ExportDataPage.js';
import SitePage from './Pages/SitePage.js';
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(setToken(token));
    }
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/site" element={<SitePage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/hazards/alerts" element={<ActiveAlertsPage />} />
          <Route path="/hazards/history" element={<HistoricalDataPage />} />
          <Route path="/reports/export" element={<ExportDataPage />} />
        </Route>
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
