import {  useNavigate, Outlet } from "react-router";
import { useAuth, type AuthContextType } from "../../providers/AuthProvider";

export default function Protected() {
  const { user } = useAuth() as AuthContextType;
  const navigate = useNavigate();
  if (!user) {
    navigate("/login");
    return;
  }
  return (
    <div>
      <Outlet />
    </div>
  );
}
