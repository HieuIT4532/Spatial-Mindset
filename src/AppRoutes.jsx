import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import SettingsLayout from './pages/Settings/layout';
import ProfileTab from './pages/Settings/tabs/ProfileTab';
import AppearanceTab from './pages/Settings/tabs/AppearanceTab';
import WorkspaceTab from './pages/Settings/tabs/WorkspaceTab';
import ShortcutsTab from './pages/Settings/tabs/ShortcutsTab';
import LoginPage from './pages/Login/LoginPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/problems" element={<App />} />
      <Route path="/contest" element={<App />} />
      <Route path="/discuss" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/settings" element={<SettingsLayout />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfileTab />} />
        <Route path="appearance" element={<AppearanceTab />} />
        <Route path="workspace" element={<WorkspaceTab />} />
        <Route path="shortcuts" element={<ShortcutsTab />} />
      </Route>
    </Routes>
  );
}
