import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthPage from './components/AuthPages/AuthPage';
import DashBoard from './components/DashBoard/DashBoard';
import Overview from './components/Overview/Overview';
import IndividualExpenses from './components/Expenses/IndividualExpenses';
import GroupList from './components/Groups/GroupList';
import GroupDetail from './components/Groups/GroupDetail';

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
    </BrowserRouter>
  );
}

export default App;