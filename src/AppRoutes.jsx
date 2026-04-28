import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import App from './App';
import SettingsLayout from './pages/Settings/layout';
// ... other imports

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<App />} />
        <Route path="/problems" element={<ProblemSetPage />} />
        <Route path="/problems/create" element={<CreateProblemPage />} />
        <Route path="/problems/:id" element={<ProblemWorkspace />} />
        <Route path="/contest" element={<ContestPage />} />
        <Route path="/contest/:contestId" element={<ContestDetailPage />} />
        <Route path="/contest/:contestId/workspace/:problemId" element={<ContestWorkspace />} />
        <Route path="/contest/:contestId/ranking" element={<ContestRanking />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/discuss" element={<App />} />
        
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfileTab />} />
          <Route path="appearance" element={<AppearanceTab />} />
          <Route path="workspace" element={<WorkspaceTab />} />
          <Route path="shortcuts" element={<ShortcutsTab />} />
        </Route>
      </Route>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
