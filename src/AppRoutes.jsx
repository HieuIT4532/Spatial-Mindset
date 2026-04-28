import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import SettingsLayout from './pages/Settings/layout';
import ProfileTab from './pages/Settings/tabs/ProfileTab';
import AppearanceTab from './pages/Settings/tabs/AppearanceTab';
import WorkspaceTab from './pages/Settings/tabs/WorkspaceTab';
import ShortcutsTab from './pages/Settings/tabs/ShortcutsTab';
import LoginPage from './pages/Login/LoginPage';
import ProblemSetPage from './pages/Problems/ProblemSetPage';
import ProblemWorkspace from './pages/Problems/ProblemWorkspace';
import CreateProblemPage from './pages/Problems/CreateProblemPage';
import ContestPage from './pages/Contest/ContestPage';
import ContestDetailPage from './pages/Contest/ContestDetailPage';
import ContestWorkspace from './pages/Contest/ContestWorkspace';
import ContestRanking from './pages/Contest/ContestRanking';
import AdminDashboard from './pages/Admin/AdminDashboard';

export default function AppRoutes() {
  return (
    <Routes>
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
