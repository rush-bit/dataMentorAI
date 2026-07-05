import { useState } from "react";
import axiosClient from "../api/axiosClient";

import DatasetPreview from "../components/DatasetPreview";
import EDAReport from "../components/EDAReport";
import TargetSelector from "../components/TargetSelector";
import PreprocessingCoach from "../components/PreprocessingCoach";
import AdvancedEDA from "../components/AdvancedEDA";
import ErrorBoundary from "../components/ErrorBoundary";
import ModelTrainer from "../components/ModelTrainer";
import MetricExplainer from "../components/MetricExplainer";
import AITutorDock from "../components/AITutorDock";

import CollapsiblePanel from "../components/ui/CollapsiblePanel";

function UploadDataset() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [edaReport, setEdaReport] = useState(null);
  const [targetInfo, setTargetInfo] = useState(null);
  const [advancedEDA, setAdvancedEDA] = useState(null);
  const [preprocessingPlan, setPreprocessingPlan] = useState(null);
  const [trainingResult, setTrainingResult] = useState(null);

  const [currentStep, setCurrentStep] = useState("upload");
  const [modelTab, setModelTab] = useState("trainer");

  const [uploadLoading, setUploadLoading] = useState(false);
  const [edaLoading, setEdaLoading] = useState(false);

  const [error, setError] = useState("");

  const resetAnalysisState = () => {
    setDatasetInfo(null);
    setEdaReport(null);
    setTargetInfo(null);
    setAdvancedEDA(null);
    setPreprocessingPlan(null);
    setTrainingResult(null);
    setCurrentStep("upload");
    setModelTab("trainer");
  };

  const saveToHistory = (dataset) => {
    const saved = localStorage.getItem("datasetHistory");
    let history = [];

    try {
      history = saved ? JSON.parse(saved) : [];
    } catch {
      history = [];
    }

    const newItem = {
      dataset_id: dataset.dataset_id,
      filename: dataset.filename,
      rows: dataset.rows,
      columns: dataset.columns,
      created_at: new Date().toLocaleString(),
    };

    const updatedHistory = [
      newItem,
      ...history.filter((item) => item.dataset_id !== dataset.dataset_id),
    ].slice(0, 10);

    localStorage.setItem("datasetHistory", JSON.stringify(updatedHistory));
    window.dispatchEvent(new Event("dataset-history-updated"));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setSelectedFile(file || null);
    resetAnalysisState();
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

      const response = await axiosClient.post("/api/datasets/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setDatasetInfo(response.data);
      setCurrentStep("preview");
      saveToHistory(response.data);
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
    setAdvancedEDA(null);
    setPreprocessingPlan(null);
    setTrainingResult(null);
    setModelTab("trainer");
  };

  const canGoToPreprocessing = targetInfo && targetInfo.is_suitable;
  const canGoToModelTrainer = preprocessingPlan && targetInfo?.is_suitable;

  return (
    <div>
      {currentStep === "upload" && (
        <section id="upload-section">
          <CollapsiblePanel
            title="Upload Dataset"
            subtitle="Start by uploading a CSV file. Other tools will unlock after upload."
            defaultOpen
          >
            <div
              style={{
                padding: "22px",
                border: "1px dashed var(--border)",
                borderRadius: "14px",
                background: "#fff7ed",
                maxWidth: "620px",
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
          </CollapsiblePanel>
        </section>
      )}

      {datasetInfo && currentStep !== "upload" && (
        <section id="dataset-preview-section">
          <CollapsiblePanel
            title="Dataset Preview"
            subtitle="Review the uploaded dataset before moving to analysis."
            defaultOpen
            rightContent={
              currentStep === "preview" ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep("eda")}
                >
                  Continue to EDA
                </button>
              ) : null
            }
          >
            <DatasetPreview datasetInfo={datasetInfo} />
          </CollapsiblePanel>
        </section>
      )}

      {datasetInfo &&
        ["eda", "preprocessing", "model"].includes(currentStep) && (
          <section id="eda-section" style={{ marginTop: "24px" }}>
            <CollapsiblePanel
              title="EDA Workspace"
              subtitle="Run basic EDA, select the target column, and generate advanced EDA."
              defaultOpen={currentStep === "eda"}
              rightContent={
                currentStep === "eda" ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!canGoToPreprocessing}
                    onClick={() => setCurrentStep("preprocessing")}
                  >
                    Continue to Preprocessing
                  </button>
                ) : null
              }
            >
              <div>
                <div
                  style={{
                    padding: "16px",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    background: "#fff7ed",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Basic EDA</h3>

                  <p style={{ color: "var(--text-muted)" }}>
                    Generate rows, columns, missing values, duplicate rows, data
                    types, and descriptive statistics.
                  </p>

                  <button
                    onClick={handleGenerateEDA}
                    disabled={edaLoading}
                    className="btn btn-primary"
                  >
                    {edaLoading ? "Generating EDA..." : "Generate Basic EDA"}
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

                {edaReport && (
                  <div style={{ marginTop: "20px" }}>
                    <EDAReport edaReport={edaReport} />
                  </div>
                )}

                <div style={{ marginTop: "20px" }}>
                  <TargetSelector
                    datasetId={datasetInfo.dataset_id}
                    columns={datasetInfo.column_names}
                    onTargetSelected={handleTargetSelected}
                  />
                </div>

                <div style={{ marginTop: "20px" }}>
                  <ErrorBoundary>
                    <AdvancedEDA
                      datasetId={datasetInfo.dataset_id}
                      targetInfo={targetInfo}
                      onAdvancedEDAComplete={setAdvancedEDA}
                    />
                  </ErrorBoundary>
                </div>

                {!canGoToPreprocessing && (
                  <p
                    style={{
                      marginTop: "18px",
                      color: "var(--danger)",
                      fontWeight: 600,
                    }}
                  >
                    Select a suitable target column before continuing to
                    preprocessing.
                  </p>
                )}
              </div>
            </CollapsiblePanel>
          </section>
        )}

      {datasetInfo &&
        currentStep !== "upload" &&
        canGoToPreprocessing &&
        ["preprocessing", "model"].includes(currentStep) && (
          <section id="preprocessing-section" style={{ marginTop: "24px" }}>
            <CollapsiblePanel
              title="Preprocessing Coach"
              subtitle="Get recommendations for imputation, scaling, encoding, and feature handling."
              defaultOpen={currentStep === "preprocessing"}
              rightContent={
                currentStep === "preprocessing" ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!canGoToModelTrainer}
                    onClick={() => setCurrentStep("model")}
                  >
                    Continue to Model Trainer
                  </button>
                ) : null
              }
            >
              <PreprocessingCoach
                datasetId={datasetInfo.dataset_id}
                targetInfo={targetInfo}
                onPlanGenerated={setPreprocessingPlan}
              />

              {!preprocessingPlan && (
                <p
                  style={{
                    marginTop: "18px",
                    color: "var(--text-muted)",
                  }}
                >
                  Generate the preprocessing plan to unlock model training.
                </p>
              )}
            </CollapsiblePanel>
          </section>
        )}

      {datasetInfo &&
        currentStep === "model" &&
        targetInfo?.is_suitable && (
          <section id="model-section" style={{ marginTop: "24px" }}>
            <CollapsiblePanel
              title="Modeling Lab"
              subtitle="Train models and inspect metric explanations in separate tabs."
              defaultOpen
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "18px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setModelTab("trainer")}
                  className={
                    modelTab === "trainer"
                      ? "btn btn-primary"
                      : "btn btn-secondary"
                  }
                >
                  Model Trainer
                </button>

                <button
                  type="button"
                  onClick={() => setModelTab("metrics")}
                  className={
                    modelTab === "metrics"
                      ? "btn btn-primary"
                      : "btn btn-secondary"
                  }
                >
                  Metric Explainer
                </button>
              </div>

              {modelTab === "trainer" && (
                <ModelTrainer
                  datasetId={datasetInfo?.dataset_id}
                  targetInfo={targetInfo}
                  onTrainingComplete={setTrainingResult}
                />
              )}

              {modelTab === "metrics" && (
                <>
                  {trainingResult ? (
                    <MetricExplainer trainingResult={trainingResult} />
                  ) : (
                    <div
                      style={{
                        padding: "18px",
                        border: "1px dashed var(--border)",
                        borderRadius: "12px",
                        background: "#fff7ed",
                      }}
                    >
                      <h3 style={{ marginTop: 0 }}>
                        No training result yet
                      </h3>

                      <p style={{ color: "var(--text-muted)" }}>
                        Train at least one model first. Then this tab will show
                        MAE, RMSE, R², residual plots, confusion matrix, and
                        other metric explanations.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CollapsiblePanel>
          </section>
        )}

      {datasetInfo && (
        <section id="reports-section" style={{ marginTop: "24px" }}>
          <CollapsiblePanel
            title="Reports"
            subtitle="Report generation will come after experiment tracking."
            defaultOpen={false}
          >
            <p style={{ color: "var(--text-muted)" }}>
              This section will later generate downloadable project reports with
              dataset summary, EDA, preprocessing decisions, model comparison,
              and AI explanations.
            </p>
          </CollapsiblePanel>
        </section>
      )}

      <AITutorDock
        datasetInfo={datasetInfo}
        edaReport={edaReport}
        targetInfo={targetInfo}
        advancedEDA={advancedEDA}
        preprocessingPlan={preprocessingPlan}
        trainingResult={trainingResult}
      />
    </div>
  );
}

export default UploadDataset;