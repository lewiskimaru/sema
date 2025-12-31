import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DeveloperPage from './pages/DeveloperPage';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ForgotPasswordPage from './components/Auth/ForgotPasswordPage';
import LoadingScreen from './components/LoadingScreen';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Add minimum loading time for better UX
      const startTime = Date.now();
      const minLoadingTime = 1500; // 1.5 seconds minimum

      // Check if user is logged in
      const user = localStorage.getItem('semaUser');
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.isLoggedIn) {
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem('semaUser');
            setIsLoggedIn(false);
          }
        } catch (error) {
          localStorage.removeItem('semaUser');
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }

      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      setTimeout(() => {
        setIsInitialized(true);
      }, remainingTime);
    };

    initializeApp();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('semaUser');
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="h-[100dvh] flex flex-col bg-white overflow-x-hidden" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!isLoggedIn ? <SignupPage onSignup={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={!isLoggedIn ? <ForgotPasswordPage /> : <Navigate to="/" />} />

          {/* Main app */}
          <Route path="/*" element={
            <>
              <TopBar
                onLogout={handleLogout}
                isLoggedIn={isLoggedIn}
              />
              <div className="flex flex-1 overflow-hidden relative min-w-0">
                <div className="flex-1 flex flex-col">
                  <Routes>
                    <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/developer" element={<DeveloperPage />} />
                  </Routes>
                </div>
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
