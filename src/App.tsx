import { Routes, Route, useNavigate } from "react-router";
import LoginPage from "./pages/Login";
import Layout from "./components/Layout";
import UserManagement from "./components/UserManagement";
import MaterialManagement from "./components/MaterialMasterList";
import MaterialRequestManagement from "./components/MaterialRequestManagement";
import Dashboard from "./components/Dashboard";
import { useEffect } from "react";
import { useAuth } from "./providers/AuthProvider";
import QuotationRequestManagement from "./components/QuotationRequests";
import QuotationRequestDetails from "./components/QuotationRequestDetails";
import QuotationManagement from "./components/QuotationManagement";
import PoManagement from "./components/PoManagements";
import DepartmentManagement from "./components/DepartmentManagement";
import CreateMaterialRequest from "./components/CreateMaterialRequest";

function App() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (window.location.pathname === "/") {
      if (user) navigate("/dashboard");
      else navigate("/login");
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
          <Route
            path="material-requests/create"
            element={<CreateMaterialRequest />}
          />
          <Route path="materials" element={<MaterialManagement />} />
          <Route
            path="quotation-requests"
            element={<QuotationRequestManagement />}
          />
          <Route path="po" element={<PoManagement />} />
          <Route
            path="quotation-requests/:id"
            element={<QuotationRequestDetails />}
          />
          <Route path="quotations" element={<QuotationManagement />} />
          <Route path="department" element={<DepartmentManagement />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
