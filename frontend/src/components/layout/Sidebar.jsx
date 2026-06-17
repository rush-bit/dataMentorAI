import { NavLink } from "react-router-dom";

function Sidebar() {
  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Upload Dataset", path: "/dashboard" },
    { label: "EDA Assistant", path: "/dashboard" },
    { label: "Model Training", path: "/dashboard" },
    { label: "Experiments", path: "/dashboard" },
    { label: "Reports", path: "/dashboard" },
  ];

  return (
    <aside
      style={{
        width: "260px",
        minHeight: "100vh",
        background: "var(--bg-sidebar)",
        color: "var(--text-light)",
        padding: "24px 18px",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ marginBottom: "34px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            letterSpacing: "-0.03em",
          }}
        >
          DataMentor AI
        </h2>
        <p
          style={{
            margin: "6px 0 0",
            color: "#94a3b8",
            fontSize: "13px",
          }}
        >
          Data science learning lab
        </p>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            style={({ isActive }) => ({
              padding: "12px 14px",
              borderRadius: "10px",
              color: "#e2e8f0",
              background: isActive ? "var(--bg-sidebar-hover)" : "transparent",
              fontWeight: isActive ? 700 : 500,
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;