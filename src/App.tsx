
import { Routes, Route, useNavigate } from "react-router";
import LoginPage from "./pages/Login";
import Layout from "./components/Layout";
import UserManagement from "./components/UserManagement";
import MaterialManagement from "./components/MaterialMasterList";
import MaterialRequestManagement from "./components/MaterialRequestManagement";
import QuotationManagement from "./components/RFQ";
import Dashboard from "./components/Dashboard";
import { useEffect } from "react";

function App() {

const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname === '/') {
      navigate('/login');
    }
  }, [navigate]);
  
  return (
    <div>
      {/* Routes */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route
            path="material-requests"
            element={<MaterialRequestManagement />}
          />
          <Route path="materials" element={<MaterialManagement />} />
          <Route path="rfq" element={<QuotationManagement />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

