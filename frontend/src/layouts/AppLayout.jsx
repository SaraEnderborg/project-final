import { useEffect, useRef, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { useLayers } from "../features/layers/hooks";
import TimelineControls from "../features/timeline/components/TimelineControls";
import { useAuthStore } from "../stores/authStore";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: layersData } = useLayers();
  const layers = layersData ?? [];
  const burgerRef = useRef(null);

  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSidebar();
        burgerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <button
          ref={burgerRef}
          className={styles.burger}
          onClick={() => setIsSidebarOpen((v) => !v)}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={isSidebarOpen}
          aria-controls="sidebar"
          type="button"
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
              <button
                className={styles.logoutBtn}
                onClick={logout}
                type="button"
              >
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

      {isSidebarOpen && (
        <>
          <button
            className={styles.overlay}
            onClick={closeSidebar}
            aria-label="Close menu overlay"
            type="button"
          />

          <aside
            id="sidebar"
            className={`${styles.sidebar} ${styles.sidebarOpen}`}
            aria-label="Sidebar"
          >
            <nav className={styles.sideNav} aria-label="Primary">
              <Link to="/" onClick={closeSidebar} className={styles.sideLink}>
                Timeline
              </Link>
            </nav>

            <div className={styles.sidebarContent}>
              <TimelineControls layers={layers} />
            </div>
          </aside>
        </>
      )}

      <div className={styles.shell}>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
