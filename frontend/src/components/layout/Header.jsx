import Badge from "../ui/Badge";

function Header() {
  return (
    <header
      style={{
        height: "74px",
        background: "white",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div>
        <strong style={{ fontSize: "16px" }}>Dashboard</strong>
        <p
          style={{
            margin: "4px 0 0",
            color: "var(--text-muted)",
            fontSize: "13px",
          }}
        >
          Upload, analyze, preprocess, and train models step by step.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <Badge variant="success">Local MVP</Badge>

        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "var(--primary-soft)",
            color: "var(--primary)",
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
          }}
        >
          R
        </div>
      </div>
    </header>
  );
}

export default Header;