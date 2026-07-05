import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './components/Loader';

const AuthPage = React.lazy(() => import('./components/AuthPages/AuthPage'));
const DashBoard = React.lazy(() => import('./components/DashBoard/DashBoard'));
const Overview = React.lazy(() => import('./components/Overview/Overview'));
const IndividualExpenses = React.lazy(() => import('./components/Expenses/IndividualExpenses'));
const GroupList = React.lazy(() => import('./components/Groups/GroupList'));
const GroupDetail = React.lazy(() => import('./components/Groups/GroupDetail'));

function ProtectedRoute({ children }) {
  const { status } = useSelector((state) => state.auth);
  if (!status) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { status } = useSelector((state) => state.auth);
  if (status) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader text="Loading..." />}>
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          {/* Protected — Dashboard layout with nested pages */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashBoard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="expenses" element={<IndividualExpenses />} />
            <Route path="groups" element={<GroupList />} />
            <Route path="groups/:groupId" element={<GroupDetail />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;