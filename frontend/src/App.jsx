import { useState, useEffect } from "react";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";

import { API_BASE_URL } from "./constants";

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <main>
      !user ? (
      <>
        <SignupForm handleLogin={handleLogin} />
        <LoginForm handleLogin={handleLogin} />
      </>
      ) : (
      <>
        <p>Logged in as: {user.username}</p>
        <button onClick={handleLogout}>Logout</button>
      </>
      )
    </main>
  );
};
export default App;
