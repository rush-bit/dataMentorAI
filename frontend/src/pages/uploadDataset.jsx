import { useEffect, useState } from "react";
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
import AIExplanationBox from "../components/AIExplainationBox";

import CollapsiblePanel from "../components/ui/CollapsiblePanel";

function UploadDataset() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [edaReport, setEdaReport] = useState(null);
  const [targetInfo, setTargetInfo] = useState(null);
  const [advancedEDA, setAdvancedEDA] = useState(null);
  const [preprocessingPlan, setPreprocessingPlan] = useState(null);
  const [trainingResult, setTrainingResult] = useState(null);

  const [activeStep, setActiveStep] = useState("upload");
  const [modelTab, setModelTab] = useState("trainer");

  const [uploadLoading, setUploadLoading] = useState(false);
  const [edaLoading, setEdaLoading] = useState(false);

  const [error, setError] = useState("");

  const resetAnalysisState = () => {
    setSelectedFile(null);
    setDatasetInfo(null);
    setEdaReport(null);
    setTargetInfo(null);
    setAdvancedEDA(null);
    setPreprocessingPlan(null);
    setTrainingResult(null);
    setActiveStep("upload");
    setModelTab("trainer");
    setError("");
  };

  useEffect(() => {
    const handleNewDataset = () => {
      resetAnalysisState();
    };

    window.addEventListener("start-new-dataset", handleNewDataset);

    return () => {
      window.removeEventListener("start-new-dataset", handleNewDataset);
    };
  }, []);

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
    setDatasetInfo(null);
    setEdaReport(null);
    setTargetInfo(null);
    setAdvancedEDA(null);
    setPreprocessingPlan(null);
    setTrainingResult(null);
    setActiveStep("upload");
    setModelTab("trainer");
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
      setActiveStep("preview");
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

  const canOpenPreview = Boolean(datasetInfo);
  const canOpenEDA = Boolean(datasetInfo);
  const canOpenPreprocessing = Boolean(targetInfo?.is_suitable);
  const canOpenModeling = Boolean(preprocessingPlan && targetInfo?.is_suitable);
  const canOpenReports = Boolean(trainingResult);

  const steps = [
    {
      key: "upload",
      label: "Upload",
      enabled: true,
    },
    {
      key: "preview",
      label: "Preview",
      enabled: canOpenPreview,
    },
    {
      key: "eda",
      label: "EDA",
      enabled: canOpenEDA,
    },
    {
      key: "preprocessing",
      label: "Preprocessing",
      enabled: canOpenPreprocessing,
    },
    {
      key: "modeling",
      label: "Modeling",
      enabled: canOpenModeling,
    },
    {
      key: "reports",
      label: "Reports",
      enabled: canOpenReports,
    },
  ];

  return (
    <div>
      <WorkflowTopBar
        steps={steps}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />

      <div style={{ marginTop: "22px" }}>
        {activeStep === "upload" && (
          <UploadPanel
            selectedFile={selectedFile}
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
            uploadLoading={uploadLoading}
            error={error}
          />
        )}

        {activeStep === "preview" && datasetInfo && (
          <PreviewPanel
            datasetInfo={datasetInfo}
            goToEDA={() => setActiveStep("eda")}
          />
        )}

        {activeStep === "eda" && datasetInfo && (
          <EDAPanel
            datasetInfo={datasetInfo}
            edaReport={edaReport}
            targetInfo={targetInfo}
            advancedEDA={advancedEDA}
            edaLoading={edaLoading}
            error={error}
            handleGenerateEDA={handleGenerateEDA}
            handleTargetSelected={handleTargetSelected}
            setAdvancedEDA={setAdvancedEDA}
            goToPreprocessing={() => setActiveStep("preprocessing")}
          />
        )}

        {activeStep === "preprocessing" && datasetInfo && targetInfo?.is_suitable && (
          <PreprocessingPanel
            datasetInfo={datasetInfo}
            targetInfo={targetInfo}
            preprocessingPlan={preprocessingPlan}
            setPreprocessingPlan={setPreprocessingPlan}
            goToModeling={() => setActiveStep("modeling")}
          />
        )}
        <AIExplanationBox
            sectionType="preprocessing"
            sectionTitle="Preprocessing Coach"
            disabled={!preprocessingPlan}
            context={{
              datasetInfo,
              targetInfo,
              preprocessingPlan,
            }}
          />

        {activeStep === "modeling" && datasetInfo && targetInfo?.is_suitable && (
          <ModelingPanel
            datasetInfo={datasetInfo}
            targetInfo={targetInfo}
            trainingResult={trainingResult}
            setTrainingResult={setTrainingResult}
            modelTab={modelTab}
            setModelTab={setModelTab}
          />
        )}

        {activeStep === "reports" && (
          <ReportsPanel />
        )}
      </div>

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

function WorkflowTopBar({ steps, activeStep, setActiveStep }) {
  return (
    <div
      className="card"
      style={{
        padding: "14px",
        background: "var(--bg-card)",
        position: "sticky",
        top: "88px",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
        }}
      >
        {steps.map((step, index) => (
          <button
            key={step.key}
            type="button"
            disabled={!step.enabled}
            onClick={() => setActiveStep(step.key)}
            className={
              activeStep === step.key ? "btn btn-primary" : "btn btn-secondary"
            }
            style={{
              opacity: step.enabled ? 1 : 0.45,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                display: "inline-grid",
                placeItems: "center",
                background:
                  activeStep === step.key ? "rgba(255,255,255,0.2)" : "#fff7ed",
                fontSize: "12px",
                fontWeight: 900,
              }}
            >
              {index + 1}
            </span>
            {step.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function UploadPanel({
  selectedFile,
  handleFileChange,
  handleUpload,
  uploadLoading,
  error,
}) {
  return (
    <CollapsiblePanel
      title="Upload Dataset"
      subtitle="Start by uploading a CSV file. Other tools unlock after upload."
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
  );
}

function PreviewPanel({ datasetInfo, goToEDA }) {
  return (
    <CollapsiblePanel
      title="Dataset Preview"
      subtitle="Review the uploaded dataset before moving to analysis."    
      rightContent={
        <button
          type="button"
          className="btn btn-primary"
          onClick={goToEDA}
        >
          Continue to EDA
        </button>
      }
    >
      <DatasetPreview datasetInfo={datasetInfo} />
      <AIExplanationBox
        sectionType="dataset_preview"
        sectionTitle="Dataset Preview"
        context={{
          datasetInfo,
        }}
      />
    </CollapsiblePanel>
  );
}

function EDAPanel({
  datasetInfo,
  edaReport,
  targetInfo,
  advancedEDA,
  edaLoading,
  error,
  handleGenerateEDA,
  handleTargetSelected,
  setAdvancedEDA,
  goToPreprocessing,
}) {
  const canContinue = Boolean(targetInfo?.is_suitable);

  return (
    <CollapsiblePanel
      title="EDA Workspace"
      subtitle="Run basic EDA, select a target, and generate advanced EDA."
      rightContent={
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canContinue}
          onClick={goToPreprocessing}
        >
          Continue to Preprocessing
        </button>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
        }}
      >
        <CollapsiblePanel
          title="Basic EDA"
          subtitle="Rows, columns, missing values, duplicates, and descriptive statistics."        
        >
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

          {edaReport && (
            <div style={{ marginTop: "20px" }}>
              <EDAReport edaReport={edaReport} />
            </div>
          )}
          <AIExplanationBox
            sectionType="basic_eda"
            sectionTitle="Basic EDA"
            disabled={!edaReport}
            disabledMessage="Generate Basic EDA first to unlock AI explanation."
            context={{
              datasetInfo,
              edaReport,
              targetInfo,
            }}
          />
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Target Selection"
          subtitle="Choose the target variable and detect regression/classification."
        >
          <TargetSelector
            datasetId={datasetInfo.dataset_id}
            columns={datasetInfo.column_names}
            onTargetSelected={handleTargetSelected}
          />
          <AIExplanationBox
            sectionType="target_selection"
            sectionTitle="Target Selection"
            disabled={!targetInfo}
            disabledMessage="Select and analyze a target column first."
            context={{
              datasetInfo,
              edaReport,
              targetInfo,
            }}
          />
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Advanced EDA"
          subtitle="Correlations, outliers, skewness, distributions, and feature-target relationships."
        >
          <ErrorBoundary>
            <AdvancedEDA
              datasetId={datasetInfo.dataset_id}
              targetInfo={targetInfo}
              onAdvancedEDAComplete={setAdvancedEDA}
            />
          </ErrorBoundary>
          <AIExplanationBox
            sectionType="advanced_eda"
            sectionTitle="Advanced EDA"
            disabled={!advancedEDA}
            disabledMessage="Generate Advanced EDA first to unlock AI explanation."
            context={{
              datasetInfo,
              edaReport,
              targetInfo,
              advancedEDA,
            }}
          />
        </CollapsiblePanel>

        {!canContinue && (
          <p
            style={{
              color: "var(--danger)",
              fontWeight: 600,
            }}
          >
            Select a suitable target column before continuing to preprocessing.
          </p>
        )}
      </div>
    </CollapsiblePanel>
  );
}

function PreprocessingPanel({
  datasetInfo,
  targetInfo,
  preprocessingPlan,
  setPreprocessingPlan,
  goToModeling,
}) {
  return (
    <CollapsiblePanel
      title="Preprocessing Coach"
      subtitle="Generate recommendations for imputation, scaling, encoding, and feature handling."
      rightContent={
        <button
          type="button"
          className="btn btn-primary"
          disabled={!preprocessingPlan}
          onClick={goToModeling}
        >
          Continue to Modeling
        </button>
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
  );
}

function ModelingPanel({
  datasetInfo,
  targetInfo,
  trainingResult,
  setTrainingResult,
  modelTab,
  setModelTab,
}) {
  return (
    <CollapsiblePanel
      title="Modeling Lab"
      subtitle="Train models and inspect metric explanations in separate tabs."

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
            modelTab === "trainer" ? "btn btn-primary" : "btn btn-secondary"
          }
        >
          Model Trainer
        </button>

        <button
          type="button"
          onClick={() => setModelTab("metrics")}
          className={
            modelTab === "metrics" ? "btn btn-primary" : "btn btn-secondary"
          }
        >
          Metric Explainer
        </button>
      </div>

      {modelTab === "trainer" && (
        <>
          <ModelTrainer
            datasetId={datasetInfo?.dataset_id}
            targetInfo={targetInfo}
            onTrainingComplete={setTrainingResult}
          />

          <AIExplanationBox
            sectionType="model_training"
            sectionTitle="Model Training Results"
            disabled={!trainingResult}
            disabledMessage="Train at least one model first."
            context={{
              datasetInfo,
              targetInfo,
              trainingResult,
            }}
          />
        </>
      )}

      {modelTab === "metrics" && (
        <>
          {trainingResult ? (
            <>
              <MetricExplainer trainingResult={trainingResult} />

              <AIExplanationBox
                sectionType="metric_explainer"
                sectionTitle="Metric Explainer"
                disabled={!trainingResult}
                disabledMessage="Train at least one model first."
                context={{
                  datasetInfo,
                  targetInfo,
                  trainingResult,
                }}
              />
            </>
          ) : (
            <div
              style={{
                padding: "18px",
                border: "1px dashed var(--border)",
                borderRadius: "12px",
                background: "#fff7ed",
              }}
            >
              <h3 style={{ marginTop: 0 }}>No training result yet</h3>

              <p style={{ color: "var(--text-muted)" }}>
                Train at least one model first. Then this tab will show MAE,
                RMSE, R², residual plots, confusion matrix, and metric
                explanations.
              </p>
            </div>
          )}
        </>
      )}
    </CollapsiblePanel>
  );
}

function ReportsPanel() {
  return (
    <CollapsiblePanel
      title="Reports"
      subtitle="Report generation will come after experiment tracking."
    >
      <p style={{ color: "var(--text-muted)" }}>
        This section will later generate downloadable project reports with
        dataset summary, EDA, preprocessing decisions, model comparison, and AI
        explanations.
      </p>
    </CollapsiblePanel>
  );
}

export default UploadDataset;