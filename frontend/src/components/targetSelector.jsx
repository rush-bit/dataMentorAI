import { useState } from "react";
import axiosClient from "../api/axiosClient";

function TargetSelector({ datasetId, columns, onTargetSelected }) {
  const [selectedTarget, setSelectedTarget] = useState("");
  const [targetInfo, setTargetInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyzeTarget = async () => {
    if (!selectedTarget) {
      setError("Please select a target column.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.post(
        `/api/datasets/${datasetId}/select-target`,
        {
          target_column: selectedTarget,
        }
      );

      setTargetInfo(response.data);

      if (onTargetSelected) {
        onTargetSelected(response.data);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Something went wrong while selecting target."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "32px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        maxWidth: "700px",
      }}
    >
      <h2>Select Target Column</h2>
      <p>
        Choose the column you want the model to predict.
      </p>

      <select
        value={selectedTarget}
        onChange={(event) => {
          setSelectedTarget(event.target.value);
          setTargetInfo(null);
          setError("");
        }}
        style={{
          padding: "10px",
          minWidth: "260px",
          marginTop: "12px",
        }}
      >
        <option value="">-- Select target column --</option>

        {columns.map((column) => (
          <option key={column} value={column}>
            {column}
          </option>
        ))}
      </select>

      <button
        onClick={handleAnalyzeTarget}
        disabled={loading}
        style={{
          marginLeft: "12px",
          padding: "10px 16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Target"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "12px" }}>
          {error}
        </p>
      )}

      {targetInfo && (
        <TargetInfoCard targetInfo={targetInfo} />
      )}
    </div>
  );
}

function TargetInfoCard({ targetInfo }) {
  return (
    <div
      style={{
        marginTop: "24px",
        padding: "16px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h3>Target Analysis</h3>

      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          marginTop: "12px",
          width: "100%",
        }}
      >
        <tbody>
          <tr>
            <td><strong>Target Column</strong></td>
            <td>{targetInfo.target_column}</td>
          </tr>

          <tr>
            <td><strong>Data Type</strong></td>
            <td>{targetInfo.target_dtype}</td>
          </tr>

          <tr>
            <td><strong>Problem Type</strong></td>
            <td>{targetInfo.problem_type}</td>
          </tr>

          <tr>
            <td><strong>Suitable for Training</strong></td>
            <td>{targetInfo.is_suitable ? "Yes" : "No"}</td>
          </tr>

          <tr>
            <td><strong>Total Rows</strong></td>
            <td>{targetInfo.total_rows}</td>
          </tr>

          <tr>
            <td><strong>Missing Values</strong></td>
            <td>{targetInfo.missing_values}</td>
          </tr>

          <tr>
            <td><strong>Unique Values</strong></td>
            <td>{targetInfo.unique_values}</td>
          </tr>

          <tr>
            <td><strong>Sample Values</strong></td>
            <td>{targetInfo.sample_values.join(", ")}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: "16px" }}>
        <strong>Reason:</strong>
        <p>{targetInfo.reason}</p>
      </div>
    </div>
  );
}

export default TargetSelector;