import { useState } from "react";
import axiosClient from "../api/axiosClient";

function AIExplanationBox({
  sectionType,
  sectionTitle,
  context,
  disabled = false,
}) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (disabled) {
    return null;
  }

  const handleExplain = async () => {
    try {
      setLoading(true);
      setError("");
      setExplanation("");

      const response = await axiosClient.post("/api/tutor/explain-section", {
        section_type: sectionType,
        section_title: sectionTitle,
        context,
      });

      setExplanation(response.data.explanation);
    } catch (err) {
      console.error("AI explanation error:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Something went wrong while generating the explanation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "18px",
        padding: "16px",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        background: "#fff7ed",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "14px",
          alignItems: "center",
        }}
      >
        <div>
          <strong>AI Explanation</strong>

          <p
            style={{
              margin: "5px 0 0",
              color: "var(--text-muted)",
              fontSize: "14px",
            }}
          >
            Get a beginner-friendly explanation of this section.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleExplain}
          disabled={loading}
        >
          {loading ? "Explaining..." : "Explain this section"}
        </button>
      </div>

      {error && (
        <p
          style={{
            marginTop: "12px",
            color: "var(--danger)",
            fontWeight: 600,
          }}
        >
          {error}
        </p>
      )}

      {explanation && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            borderRadius: "10px",
            background: "#fffaf3",
            border: "1px solid var(--border)",
            whiteSpace: "pre-wrap",
            lineHeight: 1.65,
          }}
        >
          {explanation}
        </div>
      )}
    </div>
  );
}

export default AIExplanationBox;