import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("isAuthed") === "1"
  );

  const login = (password) => {
    if (password === "Campanias@2025") {
      setAuthed(true);
      sessionStorage.setItem("isAuthed", "1");
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthed(false);
    sessionStorage.removeItem("isAuthed");
  };

  return (
    <AuthContext.Provider value={{ authed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
