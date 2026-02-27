// frontend/src/layouts/AppLayout.jsx

import { Outlet, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          Chronos
        </Link>
        <div className={styles.navLinks}>
          {isAuthenticated() ? (
            <>
              <span className={styles.userEmail}>{user?.email}</span>
              <button className={styles.logoutBtn} onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>
                Log in
              </Link>
              <Link to="/register" className={styles.navLink}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
