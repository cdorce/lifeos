import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import PersonalTasks from './pages/PersonalTasks';
import WorkTasks from './pages/WorkTasks';
import Budget from './pages/Budget';
import Projects from './pages/Projects';
import Focus from './pages/Focus';
import Language from './pages/Language';
import AIChat from './pages/AIChat';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import MusicPlayer from './components/MusicPlayer/MusicPlayer';
import BookLibrary from './components/BookLibrary/BookLibrary';
import Radio from './components/Radio/Radio';

import MusicEngine from "./global/MusicEngine";
import GlobalMusicPlayerBar from "./global/GlobalMusicPlayerBar";
import RadioEngine from "./global/RadioEngine";
import GlobalRadioBar from "./global/GlobalRadioBar";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>

            {/* 🌍 GLOBAL AUDIO ENGINE (never unmounts) */}
            <MusicEngine />
            <RadioEngine />

            {/* 🎵 GLOBAL BOTTOM MUSIC PLAYER BAR (always visible) */}
            <GlobalMusicPlayerBar />

            {/* 📻 GLOBAL RADIO BAR (shown above music bar when a station is playing) */}
            <GlobalRadioBar />

            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/personal-tasks" element={<PersonalTasks />} />
                <Route path="/work-tasks" element={<WorkTasks />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/focus" element={<Focus />} />
                <Route path="/language" element={<Language />} />
                <Route path="/ai-chat" element={<AIChat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/music" element={<MusicPlayer userId={1} />} />
                <Route path="/radio" element={<Radio />} />
                <Route path="/books" element={<BookLibrary userId={1} />} />
              </Route>

              {/* 404 */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>

          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
