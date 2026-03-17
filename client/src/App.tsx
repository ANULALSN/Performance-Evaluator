import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ToastContainer } from './components/shared/Toast';

// Pages
import AuthPage from './pages/AuthPage';
import StudentPortal from './pages/StudentPortal';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute: React.FC<{ children: React.ReactElement; role?: 'student' | 'admin' }> = ({ children, role }) => {
  const { user, loading } = useAppContext();

  if (loading) return (
    <div className="h-screen w-full bg-bg-primary flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-accent-purple/20 border-t-accent-purple rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/auth" />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/portal'} />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAppContext();

  return (
    <Routes>
      <Route path="/" element={
        user ? (
          <Navigate to={user.role === 'admin' ? '/admin' : '/portal'} />
        ) : (
          <Navigate to="/auth" />
        )
      } />
      
      <Route path="/auth" element={<AuthPage />} />
      
      <Route path="/portal/*" element={
        <PrivateRoute role="student">
          <StudentPortal />
        </PrivateRoute>
      } />
      
      <Route path="/admin/*" element={
        <PrivateRoute role="admin">
          <AdminDashboard />
        </PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
        <ToastContainer />
      </Router>
    </AppProvider>
  );
}

export default App;
