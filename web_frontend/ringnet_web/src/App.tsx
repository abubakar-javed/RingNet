import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setToken } from './State/authSlice.js';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute.js';
import OAuthCallback from './Components/OAuthCallback.js';
import LoginPage from "./Pages/LoginPage.js"
import DashboardPage from "./Pages/DashboardPage.js"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      <div className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<OAuthCallback />}></Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/auth/callback" element={<OAuthCallback />}></Route>
          </Route>
        </Routes>
      </div>
      <ToastContainer />

    </>
  )
}

export default App;
