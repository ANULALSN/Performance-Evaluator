import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ToastContainer } from './components/shared/Toast';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/shared/PageTransition';

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
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/portal'} />
          ) : (
            <Navigate to="/auth" />
          )
        } />
        
        <Route path="/auth" element={
          <PageTransition>
            <AuthPage />
          </PageTransition>
        } />
        
        <Route path="/portal/*" element={
          <PrivateRoute role="student">
            <PageTransition>
              <StudentPortal />
            </PageTransition>
          </PrivateRoute>
        } />
        
        <Route path="/admin/*" element={
          <PrivateRoute role="admin">
            <PageTransition>
              <AdminDashboard />
            </PageTransition>
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
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
