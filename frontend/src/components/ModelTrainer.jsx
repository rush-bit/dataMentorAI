import { useState } from "react";
import axiosClient from "../api/axiosClient";
import MetricExplainer from "./MetricExplainer";

function ModelTrainer({ datasetId, targetInfo,onTrainingComplete  }) {
  const [suggestedModels, setSuggestedModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [trainingResult, setTrainingResult] = useState(null);

  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);

  const [testSize, setTestSize] = useState(0.2);
  const [error, setError] = useState("");

  const canUseTrainer =
    datasetId &&
    targetInfo?.is_suitable &&
    targetInfo?.target_column &&
    targetInfo?.problem_type;

  const handleGetSuggestions = async () => {
    if (!canUseTrainer) {
      setError("Select a suitable target column first.");
      return;
    }

    try {
      setSuggestionLoading(true);
      setError("");
      setTrainingResult(null);

      const response = await axiosClient.post(
        `/api/datasets/${datasetId}/model-suggestions`,
        {
          target_column: targetInfo.target_column,
          problem_type: targetInfo.problem_type,
        }
      );

      const models = response.data.suggested_models || [];

      setSuggestedModels(models);
      setSelectedModels(models.map((model) => model.model_key));
    } catch (err) {
      console.error("Model suggestion error:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Something went wrong while fetching model suggestions."
      );
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleToggleModel = (modelKey) => {
    setSelectedModels((current) => {
      if (current.includes(modelKey)) {
        return current.filter((key) => key !== modelKey);
      }

      return [...current, modelKey];
    });
  };

  const handleTrainModels = async () => {
    if (!canUseTrainer) {
      setError("Select a suitable target column first.");
      return;
    }

    if (selectedModels.length === 0) {
      setError("Select at least one model.");
      return;
    }

    try {
      setTrainingLoading(true);
      setError("");
      setTrainingResult(null);

      const response = await axiosClient.post(
        `/api/datasets/${datasetId}/train-models`,
        {
          target_column: targetInfo.target_column,
          problem_type: targetInfo.problem_type,
          selected_models: selectedModels,
          test_size: Number(testSize),
          random_state: 42,
        }
      );

      setTrainingResult(response.data);
      if (onTrainingComplete) {
        onTrainingComplete(response.data);
      }
    } catch (err) {
      console.error("Training error:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Something went wrong while training models."
      );
    } finally {
      setTrainingLoading(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: "22px",
        background: "var(--bg-card)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Model Trainer</h2>

      <p style={{ color: "var(--text-muted)" }}>
        Train multiple machine learning models using the preprocessing pipeline
        and compare their scores.
      </p>

      {!canUseTrainer && (
        <p style={{ color: "var(--danger)", fontWeight: 600 }}>
          Select and analyze a suitable target column before training models.
        </p>
      )}

      {canUseTrainer && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            background: "#fff7ed",
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Problem type:</strong> {targetInfo.problem_type}
          </p>

          <p style={{ margin: "8px 0 0" }}>
            <strong>Target column:</strong> {targetInfo.target_column}
          </p>
        </div>
      )}

      <div style={{ marginTop: "18px" }}>
        <button
          type="button"
          onClick={handleGetSuggestions}
          disabled={!canUseTrainer || suggestionLoading}
          className="btn btn-secondary"
        >
          {suggestionLoading ? "Loading Suggestions..." : "Suggest Models"}
        </button>
      </div>

      {suggestedModels.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h3>Suggested Models</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "14px",
            }}
          >
            {suggestedModels.map((model) => (
              <label
                key={model.model_key}
                style={{
                  display: "block",
                  padding: "16px",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  background: selectedModels.includes(model.model_key)
                    ? "var(--primary-soft)"
                    : "#fffaf3",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model.model_key)}
                  onChange={() => handleToggleModel(model.model_key)}
                  style={{ marginRight: "8px" }}
                />

                <strong>{model.display_name}</strong>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "var(--text-muted)",
                    fontSize: "14px",
                  }}
                >
                  {model.description}
                </p>
              </label>
            ))}
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>
              <strong>Test size</strong>
            </label>

            <select
              value={testSize}
              onChange={(event) => setTestSize(event.target.value)}
              className="input"
              style={{ maxWidth: "220px", marginTop: "8px" }}
            >
              <option value={0.2}>20% test / 80% train</option>
              <option value={0.25}>25% test / 75% train</option>
              <option value={0.3}>30% test / 70% train</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleTrainModels}
            disabled={trainingLoading}
            className="btn btn-primary"
            style={{ marginTop: "18px" }}
          >
            {trainingLoading ? "Training Models..." : "Train Selected Models"}
          </button>
        </div>
      )}

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

      {trainingResult && (
        <TrainingResults trainingResult={trainingResult} />
      )}
    </div>
  );
}

function TrainingResults({ trainingResult }) {
  const trainedModels = trainingResult.trained_models || [];

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Model Comparison</h3>

      <div
        style={{
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          background: "#fff7ed",
          marginBottom: "18px",
        }}
      >
        <strong>Summary</strong>
        <p style={{ margin: "8px 0 0", color: "var(--text-muted)" }}>
          {trainingResult.comparison_summary}
        </p>
      </div>

      {trainingResult.best_model && (
        <div
          style={{
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "var(--primary-soft)",
            marginBottom: "18px",
          }}
        >
          <strong>Best Model</strong>
          <p style={{ margin: "8px 0 0" }}>
            {trainingResult.best_model.display_name}
          </p>
        </div>
      )}

      {trainingResult.problem_type === "regression" ? (
        <RegressionResultsTable trainedModels={trainedModels} />
      ) : (
        <ClassificationResultsTable trainedModels={trainedModels} />
      )}

      <FailedModels trainedModels={trainedModels} />
      <MetricExplainer trainingResult={trainingResult} />
    </div>
  );
}

function RegressionResultsTable({ trainedModels }) {
  const successfulModels = trainedModels.filter(
    (model) => model.status === "success"
  );

  if (successfulModels.length === 0) {
    return <p>No regression model trained successfully.</p>;
  }

  return (
    <div className="table-wrapper">
      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          minWidth: "780px",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>Model</th>
            <th>MAE</th>
            <th>MSE</th>
            <th>RMSE</th>
            <th>R² Score</th>
          </tr>
        </thead>

        <tbody>
          {successfulModels.map((model) => (
            <tr key={model.model_key}>
              <td>{model.display_name}</td>
              <td>{model.metrics.mae}</td>
              <td>{model.metrics.mse}</td>
              <td>{model.metrics.rmse}</td>
              <td>{model.metrics.r2_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClassificationResultsTable({ trainedModels }) {
  const successfulModels = trainedModels.filter(
    (model) => model.status === "success"
  );

  if (successfulModels.length === 0) {
    return <p>No classification model trained successfully.</p>;
  }

  return (
    <div className="table-wrapper">
      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          minWidth: "780px",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>Model</th>
            <th>Accuracy</th>
            <th>Precision Weighted</th>
            <th>Recall Weighted</th>
            <th>F1 Weighted</th>
          </tr>
        </thead>

        <tbody>
          {successfulModels.map((model) => (
            <tr key={model.model_key}>
              <td>{model.display_name}</td>
              <td>{model.metrics.accuracy}</td>
              <td>{model.metrics.precision_weighted}</td>
              <td>{model.metrics.recall_weighted}</td>
              <td>{model.metrics.f1_weighted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FailedModels({ trainedModels }) {
  const failedModels = trainedModels.filter(
    (model) => model.status === "failed"
  );

  if (failedModels.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "22px" }}>
      <h4>Failed Models</h4>

      {failedModels.map((model) => (
        <div
          key={model.model_key}
          style={{
            marginTop: "10px",
            padding: "12px",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            background: "#fef2f2",
            color: "var(--danger)",
          }}
        >
          <strong>{model.display_name}</strong>
          <p style={{ margin: "6px 0 0" }}>{model.error}</p>
        </div>
      ))}
    </div>
  );
}

export default ModelTrainer;