import { createContext, useContext, useEffect, useState } from "react";
import { loginApi, registerApi, getMeApi } from "../api/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking existing session

  // On first load, check if a token exists and validate it
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem("preppilot_token");
      const cachedUser = localStorage.getItem("preppilot_user");

      if (!token) {
        setLoading(false);
        return;
      }

      // Optimistically set cached user for instant UI, then verify with server
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          /* ignore parse errors */
        }
      }

      try {
        const { data } = await getMeApi();
        setUser(data.user);
        localStorage.setItem("preppilot_user", JSON.stringify(data.user));
      } catch (error) {
        localStorage.removeItem("preppilot_token");
        localStorage.removeItem("preppilot_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await loginApi({ email, password });
    localStorage.setItem("preppilot_token", data.token);
    localStorage.setItem("preppilot_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, targetRole) => {
    const { data } = await registerApi({ name, email, password, targetRole });
    localStorage.setItem("preppilot_token", data.token);
    localStorage.setItem("preppilot_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("preppilot_token");
    localStorage.removeItem("preppilot_user");
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
