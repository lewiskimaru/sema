import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import HomePage from './components/Pages/HomePage';
import AboutPage from './components/Pages/AboutPage';
import DeveloperPage from './components/Pages/DeveloperPage';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ForgotPasswordPage from './components/Auth/ForgotPasswordPage';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
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
    setIsInitialized(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('semaUser');
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="h-screen flex flex-col bg-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
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
              <div className="flex flex-1 overflow-hidden relative">
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
