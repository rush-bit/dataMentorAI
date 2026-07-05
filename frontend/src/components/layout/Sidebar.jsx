import { useEffect, useState } from "react";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [history, setHistory] = useState([]);

  const loadHistory = () => {
    const saved = localStorage.getItem("datasetHistory");

    if (!saved) {
      setHistory([]);
      return;
    }

    try {
      setHistory(JSON.parse(saved));
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();

    const handleHistoryUpdate = () => {
      loadHistory();
    };

    window.addEventListener("dataset-history-updated", handleHistoryUpdate);

    return () => {
      window.removeEventListener("dataset-history-updated", handleHistoryUpdate);
    };
  }, []);

  return (
    <aside
      style={{
        width: collapsed ? "72px" : "280px",
        minHeight: "100vh",
        background: "var(--bg-sidebar)",
        color: "var(--text-light)",
        padding: collapsed ? "18px 12px" : "22px 16px",
        position: "sticky",
        top: 0,
        transition: "width 0.2s ease",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: collapsed ? "center" : "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        {!collapsed && (
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "21px",
                letterSpacing: "-0.04em",
              }}
            >
              DataMentor AI
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#d6c3b0",
                fontSize: "13px",
              }}
            >
              Dataset history
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          title={collapsed ? "Open sidebar" : "Close sidebar"}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.16)",
            background: "var(--bg-sidebar-hover)",
            color: "var(--text-light)",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          {collapsed ? "☰" : "‹"}
        </button>
      </div>

      {!collapsed && (
        <>
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "none",
              background: "#fff7ed",
              color: "var(--primary)",
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "left",
              marginBottom: "18px",
            }}
          >
            + New Dataset
          </button>

          <div>
            <p
              style={{
                margin: "0 0 10px",
                color: "#d6c3b0",
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Recent uploads
            </p>

            {history.length === 0 ? (
              <div
                style={{
                  padding: "14px",
                  border: "1px dashed rgba(255,255,255,0.18)",
                  borderRadius: "12px",
                  color: "#d6c3b0",
                  fontSize: "14px",
                }}
              >
                No dataset history yet.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {history.map((item) => (
                  <div
                    key={item.dataset_id}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        fontSize: "14px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.filename}
                    </strong>

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#d6c3b0",
                        fontSize: "12px",
                      }}
                    >
                      {item.rows} rows · {item.columns} cols
                    </p>

                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "#bfa993",
                        fontSize: "11px",
                      }}
                    >
                      {item.created_at}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

export default Sidebar;