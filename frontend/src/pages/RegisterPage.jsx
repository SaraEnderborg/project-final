import { useNavigate } from "react-router-dom";
import SignupForm from "../components/SignupForm";
import { useAuthStore } from "../stores/authStore";
import styles from "./AuthPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  function handleLogin(payload) {
    setAuth(payload);
    navigate("/");
  }

  return (
    <div className={styles.page}>
      <section className={styles.card} aria-label="Register">
        <h1 className={styles.title}>Register</h1>
        <div className={styles.form}>
          <SignupForm handleLogin={handleLogin} />
        </div>
      </section>
    </div>
  );
}
