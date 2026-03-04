import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={styles.root}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <button
          className={styles.burger}
          onClick={() => setIsSidebarOpen((v) => !v)}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={isSidebarOpen}
          aria-controls="sidebar"
        >
          ☰
        </button>

        <Link to="/" className={styles.logo} onClick={closeSidebar}>
          Chronos
        </Link>

        <div className={styles.topbarRight}>
          {isAuthenticated() ? (
            <>
              <span className={styles.userEmail}>{user?.email}</span>
              <button className={styles.logoutBtn} onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={styles.navLink}
                onClick={closeSidebar}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className={styles.navLink}
                onClick={closeSidebar}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Overlay (mobile) */}
      {isMobile && isSidebarOpen && (
        <button
          className={styles.overlay}
          onClick={closeSidebar}
          aria-label="Close menu overlay"
        />
      )}

      <div className={styles.shell}>
        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`${styles.sidebar} ${
            isSidebarOpen ? styles.sidebarOpen : ""
          }`}
          aria-hidden={isMobile ? !isSidebarOpen : undefined}
        >
          <nav className={styles.sideNav}>
            <Link to="/" onClick={closeSidebar} className={styles.sideLink}>
              Timeline
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main
          className={styles.main}
          onClick={isMobile ? closeSidebar : undefined}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
