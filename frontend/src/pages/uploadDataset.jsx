import { useState } from "react";
import axiosClient from "../api/axiosClient";

import DatasetPreview from "../components/DatasetPreview";
import EDAReport from "../components/EDAReport";
import TargetSelector from "../components/TargetSelector";
import PreprocessingCoach from "../components/PreprocessingCoach";
import AdvancedEDA from "../components/AdvancedEDA"; 
import ErrorBoundary from "../components/ErrorBoundary";

function UploadDataset() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [edaReport, setEdaReport] = useState(null);
  const [targetInfo, setTargetInfo] = useState(null);
  const [preprocessingPlan, setPreprocessingPlan] = useState(null);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [edaLoading, setEdaLoading] = useState(false);

  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setDatasetInfo(null);
    setEdaReport(null);
    setTargetInfo(null);
    setPreprocessingPlan(null);
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
      setUploadLoading(true);
      setError("");
      setEdaReport(null);
      setTargetInfo(null);
      setPreprocessingPlan(null);

      const response = await axiosClient.post("/api/datasets/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setDatasetInfo(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Something went wrong while uploading the file."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleGenerateEDA = async () => {
    if (!datasetInfo?.dataset_id) {
      setError("Please upload a dataset first.");
      return;
    }

    try {
      setEdaLoading(true);
      setError("");

      const response = await axiosClient.get(
        `/api/datasets/${datasetInfo.dataset_id}/eda`
      );

      setEdaReport(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Something went wrong while generating EDA."
      );
    } finally {
      setEdaLoading(false);
    }
  };

  const handleTargetSelected = (newTargetInfo) => {
    setTargetInfo(newTargetInfo);
    setPreprocessingPlan(null);
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
          disabled={uploadLoading}
          style={{
            display: "block",
            marginTop: "16px",
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          {uploadLoading ? "Uploading..." : "Upload CSV"}
        </button>

        {error && (
          <p style={{ color: "red", marginTop: "12px" }}>
            {error}
          </p>
        )}
      </div>

      {datasetInfo && (
        <>
          <DatasetPreview datasetInfo={datasetInfo} />

          <button
            onClick={handleGenerateEDA}
            disabled={edaLoading}
            style={{
              marginTop: "24px",
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            {edaLoading ? "Generating EDA..." : "Generate Basic EDA"}
          </button>

          <TargetSelector
            datasetId={datasetInfo.dataset_id}
            columns={datasetInfo.column_names}
            onTargetSelected={handleTargetSelected}
          />
        </>
      )}

      {edaReport && <EDAReport edaReport={edaReport} />}

      {targetInfo && targetInfo.is_suitable && (
        <PreprocessingCoach
          datasetId={datasetInfo.dataset_id}
          targetInfo={targetInfo}
          onPlanGenerated={setPreprocessingPlan}
        />
      )}

      {targetInfo && !targetInfo.is_suitable && (
        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            maxWidth: "700px",
          }}
        >
          <h3>Next Step</h3>
          <p>
            This target column is not suitable for training. Select another
            target column.
          </p>
        </div>
      )}
      {datasetInfo && (
        <ErrorBoundary>
          <AdvancedEDA
            datasetId={datasetInfo.dataset_id}
            targetInfo={targetInfo}
          />
        </ErrorBoundary>
      )}

      {preprocessingPlan && (
        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            maxWidth: "700px",
          }}
        >
          <h3>Next Step</h3>
          <p>
            Preprocessing plan generated. In the next layer, we will use this
            plan to train machine learning models.
          </p>
        </div>
      )}
    </div>
  );
}

export default UploadDataset;