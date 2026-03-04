import { useLayers } from "../features/layers/hooks";
import TimelineControls from "../features/timeline/components/TimelineControls";
import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 900);
  const { data: layersData } = useLayers();
  const layers = layersData ?? [];

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
          onClick={() => {
            if (isMobile) setIsSidebarOpen((v) => !v);
            else setIsSidebarCollapsed((v) => !v);
          }}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobile ? isSidebarOpen : !isSidebarCollapsed}
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

      <div
        className={`${styles.shell} ${
          !isMobile && isSidebarCollapsed ? styles.shellCollapsed : ""
        }`}
      >
        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`${styles.sidebar} ${
            isMobile && isSidebarOpen ? styles.sidebarOpen : ""
          } ${!isMobile && isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}
          aria-hidden={isMobile ? !isSidebarOpen : undefined}
        >
          <nav className={styles.sideNav}>
            <Link to="/" onClick={closeSidebar} className={styles.sideLink}>
              Timeline
            </Link>
          </nav>

          {!isMobile && !isSidebarCollapsed && (
            <div className={styles.sidebarContent}>
              <TimelineControls layers={layers} />
            </div>
          )}

          {isMobile && isSidebarOpen && (
            <div className={styles.sidebarContent}>
              <TimelineControls layers={layers} />
            </div>
          )}
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
