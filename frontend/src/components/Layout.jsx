import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "⊞" },
  { to: "/receitas", label: "Receitas", icon: "↑" },
  { to: "/despesas", label: "Despesas", icon: "↓" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>Financeiro</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user?.nome?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.nome}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    width: 240,
    background: "var(--bg-secondary)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 0",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 24px 24px",
    borderBottom: "1px solid var(--border)",
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 22,
    color: "var(--accent-green)",
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
    color: "var(--text-primary)",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "0 12px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-secondary)",
    textDecoration: "none",
    transition: "all 0.2s",
  },
  navItemActive: {
    background: "rgba(0, 212, 170, 0.1)",
    color: "var(--accent-green)",
  },
  navIcon: {
    fontSize: 16,
    width: 20,
    textAlign: "center",
  },
  userSection: {
    padding: "16px 16px 0",
    borderTop: "1px solid var(--border)",
    marginTop: "auto",
    paddingTop: 16,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "var(--accent-blue)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 700,
    flexShrink: 0,
  },
  logoutBtn: {
    width: "100%",
    padding: "8px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text-muted)",
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s",
  },
};
