import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuthStore } from "../stores/authStore";
import styles from "./AuthPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  function handleLogin(payload) {
    setAuth(payload);
    navigate("/");
  }

  return (
    <div className={styles.page}>
      <section className={styles.card} aria-label="Login">
        <h1 className={styles.title}>Log in</h1>
        <div className={styles.form}>
          <LoginForm handleLogin={handleLogin} />
        </div>
      </section>
    </div>
  );
}
