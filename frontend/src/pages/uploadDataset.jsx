// import { useState } from "react";
// import axiosClient from "../api/axiosClient";
// import DatasetPreview from "../components/DatasetPreview";
// import EDAReport from "../components/EDAReport";

// function UploadDataset() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [datasetInfo, setDatasetInfo] = useState(null);
//   const [edaReport, setEdaReport] = useState(null);

//   const [uploadLoading, setUploadLoading] = useState(false);
//   const [edaLoading, setEdaLoading] = useState(false);

//   const [error, setError] = useState("");

//   const handleFileChange = (event) => {
//     setSelectedFile(event.target.files[0]);
//     setDatasetInfo(null);
//     setEdaReport(null);
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

//       const response = await axiosClient.post("/api/datasets/upload", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       setDatasetInfo(response.data);
//     } catch (err) {
//       console.error(err);
//       setError(
//         err.response?.data?.detail || "Something went wrong while uploading the file."
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
//         err.response?.data?.detail || "Something went wrong while generating EDA."
//       );
//     } finally {
//       setEdaLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: "40px", fontFamily: "Arial" }}>
//       <h1>DataMentor AI</h1>
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
//         </>
//       )}

//       {edaReport && <EDAReport edaReport={edaReport} />}
//     </div>
//   );
// }

// export default UploadDataset;

import { useState } from "react";
import axiosClient from "../api/axiosClient";
import DatasetPreview from "../components/DatasetPreview";
import EDAReport from "../components/EDAReport";

function UploadDataset() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [edaReport, setEdaReport] = useState(null);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [edaLoading, setEdaLoading] = useState(false);

  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setDatasetInfo(null);
    setEdaReport(null);
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
      setUploadLoading(false);
    }
  };

  const handleGenerateEDA = async () => {
    if (!datasetInfo?.dataset_id) return;

    try {
      setEdaLoading(true);
      setError("");

      const response = await axiosClient.get(`/api/datasets/${datasetInfo.dataset_id}/eda`);
      setEdaReport(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Something went wrong while generating the EDA report."
      );
    } finally {
      setEdaLoading(false);
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
          disabled={uploadLoading}
          style={{
            display: "block",
            marginTop: "16px",
            padding: "10px 16px",
            cursor: uploadLoading ? "not-allowed" : "pointer",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px"
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
          
          <div style={{ marginTop: "32px", padding: "20px", borderTop: "2px solid #eee" }}>
            <h3>Ready for Deeper Analysis?</h3>
            <button
              onClick={handleGenerateEDA}
              disabled={edaLoading}
              style={{
                padding: "10px 16px",
                cursor: edaLoading ? "not-allowed" : "pointer",
                backgroundColor: "#10b981", // Green color for the next step
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px"
              }}
            >
              {edaLoading ? "Analyzing Dataset..." : "Generate EDA Report"}
            </button>
          </div>
        </>
      )}

      {edaReport && <EDAReport edaReport={edaReport} />}
    </div>
  );
}

export default UploadDataset;