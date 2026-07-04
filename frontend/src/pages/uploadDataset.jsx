// import { useState } from "react";
// import axiosClient from "../api/axiosClient";

// import DatasetPreview from "../components/DatasetPreview";
// import EDAReport from "../components/EDAReport";
// import TargetSelector from "../components/TargetSelector";
// import PreprocessingCoach from "../components/PreprocessingCoach";
// import AdvancedEDA from "../components/AdvancedEDA"; 
// import ErrorBoundary from "../components/ErrorBoundary";

// function UploadDataset() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [datasetInfo, setDatasetInfo] = useState(null);
//   const [edaReport, setEdaReport] = useState(null);
//   const [targetInfo, setTargetInfo] = useState(null);
//   const [preprocessingPlan, setPreprocessingPlan] = useState(null);

//   const [uploadLoading, setUploadLoading] = useState(false);
//   const [edaLoading, setEdaLoading] = useState(false);

//   const [error, setError] = useState("");

//   const handleFileChange = (event) => {
//     setSelectedFile(event.target.files[0]);
//     setDatasetInfo(null);
//     setEdaReport(null);
//     setTargetInfo(null);
//     setPreprocessingPlan(null);
//     setError("");
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) {
//       setError("Please select a CSV file first.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       setUploadLoading(true);
//       setError("");
//       setEdaReport(null);
//       setTargetInfo(null);
//       setPreprocessingPlan(null);

//       const response = await axiosClient.post("/api/datasets/upload", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       setDatasetInfo(response.data);
//     } catch (err) {
//       console.error(err);
//       setError(
//         err.response?.data?.detail ||
//           "Something went wrong while uploading the file."
//       );
//     } finally {
//       setUploadLoading(false);
//     }
//   };

//   const handleGenerateEDA = async () => {
//     if (!datasetInfo?.dataset_id) {
//       setError("Please upload a dataset first.");
//       return;
//     }

//     try {
//       setEdaLoading(true);
//       setError("");

//       const response = await axiosClient.get(
//         `/api/datasets/${datasetInfo.dataset_id}/eda`
//       );

//       setEdaReport(response.data);
//     } catch (err) {
//       console.error(err);
//       setError(
//         err.response?.data?.detail ||
//           "Something went wrong while generating EDA."
//       );
//     } finally {
//       setEdaLoading(false);
//     }
//   };

//   const handleTargetSelected = (newTargetInfo) => {
//     setTargetInfo(newTargetInfo);
//     setPreprocessingPlan(null);
//   };

//   return (
//     <div style={{ padding: "40px", fontFamily: "Arial" }}>
//       <p>Upload a CSV dataset to start analysis.</p>

//       <div
//         style={{
//           marginTop: "24px",
//           padding: "20px",
//           border: "1px solid #ddd",
//           borderRadius: "8px",
//           maxWidth: "500px",
//         }}
//       >
//         <input type="file" accept=".csv" onChange={handleFileChange} />

//         <button
//           onClick={handleUpload}
//           disabled={uploadLoading}
//           style={{
//             display: "block",
//             marginTop: "16px",
//             padding: "10px 16px",
//             cursor: "pointer",
//           }}
//         >
//           {uploadLoading ? "Uploading..." : "Upload CSV"}
//         </button>

//         {error && (
//           <p style={{ color: "red", marginTop: "12px" }}>
//             {error}
//           </p>
//         )}
//       </div>

//       {datasetInfo && (
//         <>
//           <DatasetPreview datasetInfo={datasetInfo} />

//           <button
//             onClick={handleGenerateEDA}
//             disabled={edaLoading}
//             style={{
//               marginTop: "24px",
//               padding: "10px 16px",
//               cursor: "pointer",
//             }}
//           >
//             {edaLoading ? "Generating EDA..." : "Generate Basic EDA"}
//           </button>

//           <TargetSelector
//             datasetId={datasetInfo.dataset_id}
//             columns={datasetInfo.column_names}
//             onTargetSelected={handleTargetSelected}
//           />
//         </>
//       )}

//       {edaReport && <EDAReport edaReport={edaReport} />}

//       {targetInfo && targetInfo.is_suitable && (
//         <PreprocessingCoach
//           datasetId={datasetInfo.dataset_id}
//           targetInfo={targetInfo}
//           onPlanGenerated={setPreprocessingPlan}
//         />
//       )}

//       {targetInfo && !targetInfo.is_suitable && (
//         <div
//           style={{
//             marginTop: "32px",
//             padding: "16px",
//             border: "1px solid #ddd",
//             borderRadius: "8px",
//             maxWidth: "700px",
//           }}
//         >
//           <h3>Next Step</h3>
//           <p>
//             This target column is not suitable for training. Select another
//             target column.
//           </p>
//         </div>
//       )}
//       {datasetInfo && (
//         <ErrorBoundary>
//           <AdvancedEDA
//             datasetId={datasetInfo.dataset_id}
//             targetInfo={targetInfo}
//           />
//         </ErrorBoundary>
//       )}

//       {preprocessingPlan && (
//         <div
//           style={{
//             marginTop: "32px",
//             padding: "16px",
//             border: "1px solid #ddd",
//             borderRadius: "8px",
//             maxWidth: "700px",
//           }}
//         >
//           <h3>Next Step</h3>
//           <p>
//             Preprocessing plan generated. In the next layer, we will use this
//             plan to train machine learning models.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default UploadDataset;

import { useState } from "react";
import axiosClient from "../api/axiosClient";

import DatasetPreview from "../components/DatasetPreview";
import EDAReport from "../components/EDAReport";
import TargetSelector from "../components/TargetSelector";
import PreprocessingCoach from "../components/PreprocessingCoach";
import AdvancedEDA from "../components/AdvancedEDA";
import ErrorBoundary from "../components/ErrorBoundary";
import ModelTrainer from "../components/ModelTrainer";

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
    const file = event.target.files?.[0];

    setSelectedFile(file || null);
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

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Only CSV files are allowed.");
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
      console.error("Upload error:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
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
      console.error("EDA error:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
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
    <div>
      <section id="upload-section">
        <div
          className="card"
          style={{
            padding: "24px",
            background: "var(--bg-card)",
          }}
        >
          <h2
            style={{
              margin: 0,
              letterSpacing: "-0.03em",
              color: "var(--text-main)",
            }}
          >
            Upload Dataset
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: "var(--text-muted)",
              maxWidth: "650px",
            }}
          >
            Upload a CSV dataset to start analysis. The system will preview the
            file, generate EDA, detect the target type, and recommend
            preprocessing steps.
          </p>

          <div
            style={{
              marginTop: "22px",
              padding: "22px",
              border: "1px dashed var(--border)",
              borderRadius: "14px",
              background: "#fff7ed",
              maxWidth: "560px",
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="input"
            />

            {selectedFile && (
              <p
                style={{
                  margin: "12px 0 0",
                  color: "var(--text-muted)",
                }}
              >
                Selected file: <strong>{selectedFile.name}</strong>
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={uploadLoading}
              className="btn btn-primary"
              style={{
                display: "block",
                marginTop: "16px",
              }}
            >
              {uploadLoading ? "Uploading..." : "Upload CSV"}
            </button>

            {error && (
              <p
                style={{
                  color: "var(--danger)",
                  marginTop: "14px",
                  fontWeight: 600,
                }}
              >
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      {datasetInfo && (
        <section id="dataset-preview-section" style={{ marginTop: "24px" }}>
          <DatasetPreview datasetInfo={datasetInfo} />
        </section>
      )}

      {datasetInfo && (
        <section id="basic-eda-section" style={{ marginTop: "24px" }}>
          <div
            className="card"
            style={{
              padding: "22px",
              background: "var(--bg-card)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "var(--text-main)",
              }}
            >
              Basic EDA
            </h2>

            <p
              style={{
                marginTop: "6px",
                color: "var(--text-muted)",
              }}
            >
              Generate rows, columns, missing values, duplicate rows, data types,
              and descriptive statistics.
            </p>

            <button
              onClick={handleGenerateEDA}
              disabled={edaLoading}
              className="btn btn-primary"
              style={{
                marginTop: "12px",
              }}
            >
              {edaLoading ? "Generating EDA..." : "Generate Basic EDA"}
            </button>
          </div>

          {edaReport && (
            <div style={{ marginTop: "24px" }}>
              <EDAReport edaReport={edaReport} />
            </div>
          )}
        </section>
      )}

      {datasetInfo && (
        <section id="target-section" style={{ marginTop: "24px" }}>
          <TargetSelector
            datasetId={datasetInfo.dataset_id}
            columns={datasetInfo.column_names}
            onTargetSelected={handleTargetSelected}
          />
        </section>
      )}

      {datasetInfo && (
        <section id="advanced-eda-section" style={{ marginTop: "24px" }}>
          <ErrorBoundary>
            <AdvancedEDA
              datasetId={datasetInfo.dataset_id}
              targetInfo={targetInfo}
            />
          </ErrorBoundary>
        </section>
      )}

      {targetInfo && targetInfo.is_suitable && (
        <section id="preprocessing-section" style={{ marginTop: "24px" }}>
          <PreprocessingCoach
            datasetId={datasetInfo.dataset_id}
            targetInfo={targetInfo}
            onPlanGenerated={setPreprocessingPlan}
          />
        </section>
      )}

      {targetInfo && !targetInfo.is_suitable && (
        <section id="preprocessing-section" style={{ marginTop: "24px" }}>
          <div
            className="card"
            style={{
              padding: "22px",
              background: "var(--bg-card)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Target not suitable</h3>

            <p style={{ color: "var(--text-muted)" }}>
              This target column is not suitable for training. Select another
              target column.
            </p>
          </div>
        </section>
      )}

      {preprocessingPlan && (
        <div
          className="card"
          style={{
            marginTop: "24px",
            padding: "22px",
            background: "var(--bg-card)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Next Step</h3>

          <p style={{ color: "var(--text-muted)" }}>
            Preprocessing plan generated. In the next layer, we will use this
            plan to train machine learning models.
          </p>
        </div>
      )}

      {/* <section id="model-training-section" style={{ marginTop: "24px" }}>
        <div
          className="card"
          style={{
            padding: "22px",
            background: "var(--bg-card)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Model Training</h2>

          <p style={{ color: "var(--text-muted)" }}>
            This section will be added in the next layer. It will train Linear
            Regression, Ridge Regression, and Random Forest models using the
            preprocessing pipeline.
          </p>
        </div>
      </section> */}
      <section id="model-training-section" style={{ marginTop: "24px" }}>
      <ModelTrainer
        datasetId={datasetInfo?.dataset_id}
        targetInfo={targetInfo}
      />
    </section>

      <section id="reports-section" style={{ marginTop: "24px" }}>
        <div
          className="card"
          style={{
            padding: "22px",
            background: "var(--bg-card)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Reports</h2>

          <p style={{ color: "var(--text-muted)" }}>
            Report generation will be added later after model training and
            experiment tracking are complete.
          </p>
        </div>
      </section>
    </div>
  );
}

export default UploadDataset;