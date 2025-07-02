import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuth, type AuthContextType } from "../../providers/AuthProvider";

export default function ProtectedAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth() as AuthContextType;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  return <>{children}</>;
}
