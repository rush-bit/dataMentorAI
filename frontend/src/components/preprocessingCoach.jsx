import { useState } from "react";
import axiosClient from "../api/axiosClient";

function PreprocessingCoach({ datasetId, targetInfo, onPlanGenerated }) {
  const [preprocessingPlan, setPreprocessingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGeneratePlan = async () => {
    if (!targetInfo?.target_column || !targetInfo?.problem_type) {
      setError("Please select a valid target column first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.post(
        `/api/datasets/${datasetId}/preprocessing-suggestions`,
        {
          target_column: targetInfo.target_column,
          problem_type: targetInfo.problem_type,
        }
      );

      setPreprocessingPlan(response.data);

      if (onPlanGenerated) {
        onPlanGenerated(response.data);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Something went wrong while generating preprocessing suggestions."
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
        maxWidth: "1000px",
      }}
    >
      <h2>Preprocessing Coach</h2>

      <p>
        This step analyzes the selected target and recommends how to clean and
        prepare the feature columns before model training.
      </p>

      <button
        onClick={handleGeneratePlan}
        disabled={loading || !targetInfo?.is_suitable}
        style={{
          marginTop: "12px",
          padding: "10px 16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating Suggestions..." : "Generate Preprocessing Suggestions"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "12px" }}>
          {error}
        </p>
      )}

      {preprocessingPlan && (
        <PreprocessingPlanView preprocessingPlan={preprocessingPlan} />
      )}
    </div>
  );
}

function PreprocessingPlanView({ preprocessingPlan }) {
  return (
    <div style={{ marginTop: "24px" }}>
      <h3>Feature Groups</h3>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <InfoCard
          title="Numeric Features"
          value={preprocessingPlan.numeric_features.length}
        />
        <InfoCard
          title="Categorical Features"
          value={preprocessingPlan.categorical_features.length}
        />
        <InfoCard
          title="Date Features"
          value={preprocessingPlan.date_features.length}
        />
      </div>

      <FeatureList
        title="Numeric Features"
        features={preprocessingPlan.numeric_features}
      />

      <FeatureList
        title="Categorical Features"
        features={preprocessingPlan.categorical_features}
      />

      <FeatureList
        title="Date Features"
        features={preprocessingPlan.date_features}
      />

      <h3 style={{ marginTop: "28px" }}>Suggestions</h3>

      {preprocessingPlan.suggestions.length === 0 ? (
        <p>No preprocessing issues found.</p>
      ) : (
        <div>
          {preprocessingPlan.suggestions.map((suggestion, index) => (
            <SuggestionCard key={index} suggestion={suggestion} />
          ))}
        </div>
      )}

      <PipelinePlan pipelinePlan={preprocessingPlan.pipeline_plan} />
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        minWidth: "160px",
      }}
    >
      <strong>{title}</strong>
      <p>{value}</p>
    </div>
  );
}

function FeatureList({ title, features }) {
  return (
    <div style={{ marginTop: "16px" }}>
      <strong>{title}</strong>

      {features.length === 0 ? (
        <p>No columns found.</p>
      ) : (
        <p>{features.join(", ")}</p>
      )}
    </div>
  );
}

function SuggestionCard({ suggestion }) {
  const severityColor =
    suggestion.severity === "warning" ? "#fff3cd" : "#f8f9fa";

  return (
    <div
      style={{
        marginTop: "12px",
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: severityColor,
      }}
    >
      <h4 style={{ margin: "0 0 8px 0" }}>
        {suggestion.category}
        {suggestion.column ? ` — ${suggestion.column}` : ""}
      </h4>

      <p>
        <strong>Issue:</strong> {suggestion.issue}
      </p>

      <p>
        <strong>Recommendation:</strong> {suggestion.recommendation}
      </p>

      <p>
        <strong>Reason:</strong> {suggestion.reason}
      </p>

      {suggestion.affected_columns && (
        <p>
          <strong>Affected Columns:</strong>{" "}
          {suggestion.affected_columns.join(", ")}
        </p>
      )}

      {suggestion.details && (
        <pre
          style={{
            padding: "12px",
            background: "#eee",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(suggestion.details, null, 2)}
        </pre>
      )}
    </div>
  );
}

function PipelinePlan({ pipelinePlan }) {
  if (!pipelinePlan) return null;

  return (
    <div style={{ marginTop: "32px" }}>
      <h3>Recommended scikit-learn Pipeline Plan</h3>

      <PipelineSection
        title="Numeric Pipeline"
        pipeline={pipelinePlan.numeric_pipeline}
      />

      <PipelineSection
        title="Categorical Pipeline"
        pipeline={pipelinePlan.categorical_pipeline}
      />

      <div
        style={{
          marginTop: "16px",
          padding: "16px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h4>Train-Test Split</h4>
        <p>
          <strong>Test Size:</strong>{" "}
          {pipelinePlan.train_test_split.test_size}
        </p>
        <p>
          <strong>Random State:</strong>{" "}
          {pipelinePlan.train_test_split.random_state}
        </p>
        <p>
          <strong>Use Stratify:</strong>{" "}
          {pipelinePlan.train_test_split.stratify ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
}

function PipelineSection({ title, pipeline }) {
  return (
    <div
      style={{
        marginTop: "16px",
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h4>{title}</h4>

      <p>
        <strong>Columns:</strong>{" "}
        {pipeline.columns.length > 0 ? pipeline.columns.join(", ") : "None"}
      </p>

      {pipeline.steps.map((step, index) => (
        <div key={index} style={{ marginTop: "12px" }}>
          <p>
            <strong>{step.name}:</strong> {step.method}
          </p>
          <p>{step.reason}</p>
        </div>
      ))}
    </div>
  );
}

export default PreprocessingCoach;