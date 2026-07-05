import { useState } from "react";
import AITutorChat from "./AITutorChat";

function AITutorDock({
  datasetInfo,
  edaReport,
  targetInfo,
  advancedEDA,
  preprocessingPlan,
  trainingResult,
}) {
  const [open, setOpen] = useState(false);
  const [wide, setWide] = useState(false);

  if (!datasetInfo) {
    return null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: "28px",
          bottom: "28px",
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          border: "1px solid var(--border)",
          background: "var(--primary)",
          color: "white",
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: "var(--shadow)",
          zIndex: 100,
        }}
      >
        AI
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        width: wide ? "620px" : "420px",
        maxWidth: "calc(100vw - 48px)",
        height: wide ? "78vh" : "560px",
        maxHeight: "calc(100vh - 48px)",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "18px",
        boxShadow: "0 22px 60px rgba(59, 47, 47, 0.22)",
        zIndex: 100,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: "54px",
          padding: "0 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff7ed",
        }}
      >
        <strong>AI Tutor</strong>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setWide((current) => !current)}
            className="btn btn-secondary"
            style={{ padding: "6px 10px" }}
          >
            {wide ? "Shrink" : "Stretch"}
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn btn-secondary"
            style={{ padding: "6px 10px" }}
          >
            Close
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
          background: "var(--bg-main)",
        }}
      >
        <AITutorChat
          datasetInfo={datasetInfo}
          edaReport={edaReport}
          targetInfo={targetInfo}
          advancedEDA={advancedEDA}
          preprocessingPlan={preprocessingPlan}
          trainingResult={trainingResult}
        />
      </div>
    </div>
  );
}

export default AITutorDock;