function Sidebar() {
  const navItems = [
    { label: "Dashboard", sectionId: "dashboard-top" },
    { label: "Upload Dataset", sectionId: "upload-section" },
    { label: "Basic EDA", sectionId: "basic-eda-section" },
    { label: "EDA Assistant", sectionId: "advanced-eda-section" },
    { label: "Target Selection", sectionId: "target-section" },
    { label: "Preprocessing", sectionId: "preprocessing-section" },
    { label: "Model Training", sectionId: "model-training-section" },
    { label: "Reports", sectionId: "reports-section" },
  ];

  const handleScroll = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

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
            color: "#d6c3b0",
            fontSize: "13px",
          }}
        >
          Data science learning lab
        </p>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleScroll(item.sectionId)}
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              color: "var(--text-light)",
              background: "transparent",
              border: "none",
              textAlign: "left",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "var(--bg-sidebar-hover)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "transparent";
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;