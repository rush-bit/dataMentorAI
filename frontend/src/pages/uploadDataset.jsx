import { useState } from "react";
import axiosClient from "../api/axiosClient";
import DatasetPreview from "../components/DatasetPreview";

function UploadDataset() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setDatasetInfo(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.post("/api/datasets/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setDatasetInfo(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Something went wrong while uploading the file."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>DataMentor AI</h1>
      <p>Upload a CSV dataset to start analysis.</p>

      <div
        style={{
          marginTop: "24px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          maxWidth: "500px",
        }}
      >
        <input type="file" accept=".csv" onChange={handleFileChange} />

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            display: "block",
            marginTop: "16px",
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          {loading ? "Uploading..." : "Upload CSV"}
        </button>

        {error && (
          <p style={{ color: "red", marginTop: "12px" }}>
            {error}
          </p>
        )}
      </div>

      {datasetInfo && <DatasetPreview datasetInfo={datasetInfo} />}
    </div>
  );
}

export default UploadDataset;