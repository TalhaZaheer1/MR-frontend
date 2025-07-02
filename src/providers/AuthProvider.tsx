import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export interface AuthContextType {
  token: string | null;
  setToken: (newToken: string) => void;
  user: User | null;
  setUser: (user: User) => void;
  login: (payload: UserLoginPayload) => Promise<void>;
  logout: () => void
}

interface User {
  _id:string;
  username: string;
  email: string;
  role: string;
}

interface UserLoginPayload {
  username: string;
  password: string;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: (newToken: string) => console.log(newToken),
  user: null,
  setUser: (user: User) => console.log(user),
  login: async (payload: UserLoginPayload) => console.log(payload),
  logout: () => console.log("dummy logout")
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State to hold the authentication token
  const [token, setToken_] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  async function getUser() {
    try {
      const res = await axios.get("/user");
      setUser(res.data.user);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function login(payload: UserLoginPayload) {
    try {
      const res = await axios.post("/user/login", payload);
      console.log({res});
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success("Loggen In!");
      navigate("/dashboard");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  }

  function logout(){
    setToken_("");
    navigate("/login")
}

  // Function to set the authentication token
  const setToken = (newToken: string) => {
    setToken_(newToken);
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      localStorage.setItem("token", token);
      if (!user) {
        getUser();
      }
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      user,
      setUser,
      login,
      logout
    }),
    [token, user],
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
