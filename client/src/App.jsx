import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './components/landing/Landing';
import { Login, Register } from './components/auth/Auth';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import ProtectedRoute from './components/shared/ProtectedRoute';
import './styles/globals.css';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  if (user.role === 'admin')   return <Navigate to="/admin"   replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: 12, fontFamily: 'var(--font)', fontSize: 14, fontWeight: 500 },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/"         element={<RootRedirect />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin/*" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/teacher/*" element={
            <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
          } />
          <Route path="/student/*" element={
            <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
