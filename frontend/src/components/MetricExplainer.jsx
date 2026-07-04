function MetricExplainer({ trainingResult }) {
  if (!trainingResult) return null;

  const successfulModels = (trainingResult.trained_models || []).filter(
    (model) => model.status === "success"
  );

  if (successfulModels.length === 0) {
    return null;
  }

  const bestModel = trainingResult.best_model || successfulModels[0];

  return (
    <div
      className="card"
      style={{
        marginTop: "24px",
        padding: "22px",
        background: "var(--bg-card)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Metric Explainer</h2>

      <p style={{ color: "var(--text-muted)" }}>
        This section explains what the model scores mean and shows diagnostic
        plots for the best model.
      </p>

      <div
        style={{
          marginTop: "18px",
          padding: "16px",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          background: "#fff7ed",
        }}
      >
        <strong>Explaining best model:</strong>
        <p style={{ margin: "8px 0 0" }}>{bestModel.display_name}</p>
      </div>

      <MetricExplanationCards model={bestModel} />

      {trainingResult.problem_type === "regression" ? (
        <RegressionDiagnostics model={bestModel} />
      ) : (
        <ClassificationDiagnostics model={bestModel} />
      )}
    </div>
  );
}

function MetricExplanationCards({ model }) {
  const explanations = model.metric_explanations || [];

  if (explanations.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <h3>Metric Explanations</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "14px",
        }}
      >
        {explanations.map((item) => (
          <div
            key={item.metric}
            style={{
              padding: "16px",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              background: "#fffaf3",
            }}
          >
            <strong>{item.metric}</strong>

            <p
              style={{
                margin: "8px 0 0",
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--primary)",
              }}
            >
              {item.value === null || item.value === undefined ? "-" : item.value}
            </p>

            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              {item.meaning}
            </p>

            <p style={{ fontSize: "14px" }}>{item.interpretation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegressionDiagnostics({ model }) {
  const artifacts = model.evaluation_artifacts || {};
  const actualVsPredicted = artifacts.actual_vs_predicted || [];
  const residuals = artifacts.residuals || [];
  const residualSummary = artifacts.residual_summary || {};

  return (
    <div style={{ marginTop: "28px" }}>
      <h3>Regression Diagnostics</h3>

      <ResidualSummary residualSummary={residualSummary} />

      <ActualVsPredictedPlot points={actualVsPredicted} />

      <ResidualPlot points={residuals} />
    </div>
  );
}

function ResidualSummary({ residualSummary }) {
  return (
    <div
      style={{
        marginTop: "16px",
        padding: "16px",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        background: "#fff7ed",
      }}
    >
      <strong>Residual Summary</strong>

      <div
        style={{
          marginTop: "12px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        <MiniMetric label="Mean Residual" value={residualSummary.mean_residual} />
        <MiniMetric label="Std Residual" value={residualSummary.std_residual} />
        <MiniMetric label="Min Residual" value={residualSummary.min_residual} />
        <MiniMetric label="Max Residual" value={residualSummary.max_residual} />
      </div>

      <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
        Residual = actual value - predicted value. Ideally, residuals should be
        scattered randomly around zero.
      </p>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div
      style={{
        padding: "12px",
        background: "#fffaf3",
        border: "1px solid var(--border)",
        borderRadius: "10px",
      }}
    >
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>
        {label}
      </p>

      <strong>{value === null || value === undefined ? "-" : value}</strong>
    </div>
  );
}

function ActualVsPredictedPlot({ points }) {
  if (!Array.isArray(points) || points.length === 0) {
    return <p>No actual-vs-predicted data available.</p>;
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <h4>Actual vs Predicted Plot</h4>

      <SimpleScatterPlot
        title="Actual vs Predicted"
        xLabel="Actual"
        yLabel="Predicted"
        points={points.map((point) => ({
          x: point.actual,
          y: point.predicted,
        }))}
        showDiagonal
      />

      <p style={{ color: "var(--text-muted)" }}>
        Points closer to the diagonal line indicate better predictions.
      </p>
    </div>
  );
}

function ResidualPlot({ points }) {
  if (!Array.isArray(points) || points.length === 0) {
    return <p>No residual data available.</p>;
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <h4>Residual Plot</h4>

      <SimpleScatterPlot
        title="Residuals"
        xLabel="Predicted"
        yLabel="Residual"
        points={points.map((point) => ({
          x: point.predicted,
          y: point.residual,
        }))}
        showZeroLine
      />

      <p style={{ color: "var(--text-muted)" }}>
        A good residual plot should not show a strong curve or pattern. Patterns
        may indicate non-linearity, missing features, or model bias.
      </p>
    </div>
  );
}

function SimpleScatterPlot({
  title,
  xLabel,
  yLabel,
  points,
  showDiagonal = false,
  showZeroLine = false,
}) {
  const width = 720;
  const height = 420;
  const padding = 54;

  const cleanPoints = points
    .map((point) => ({
      x: Number(point.x),
      y: Number(point.y),
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

  if (cleanPoints.length === 0) {
    return <p>Plot requires numeric values.</p>;
  }

  const xValues = cleanPoints.map((point) => point.x);
  const yValues = cleanPoints.map((point) => point.y);

  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const scaleX = (x) => {
    if (xMax === xMin) return width / 2;
    return padding + ((x - xMin) / (xMax - xMin)) * (width - padding * 2);
  };

  const scaleY = (y) => {
    if (yMax === yMin) return height / 2;
    return height - padding - ((y - yMin) / (yMax - yMin)) * (height - padding * 2);
  };

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "16px",
        background: "#fffaf3",
        overflowX: "auto",
      }}
    >
      <strong>{title}</strong>

      <svg width={width} height={height} style={{ display: "block", marginTop: "12px" }}>
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#3b2f2f"
        />

        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#3b2f2f"
        />

        {showDiagonal && (
          <line
            x1={scaleX(Math.max(xMin, yMin))}
            y1={scaleY(Math.max(xMin, yMin))}
            x2={scaleX(Math.min(xMax, yMax))}
            y2={scaleY(Math.min(xMax, yMax))}
            stroke="#8b5e34"
            strokeDasharray="6 6"
          />
        )}

        {showZeroLine && yMin <= 0 && yMax >= 0 && (
          <line
            x1={padding}
            y1={scaleY(0)}
            x2={width - padding}
            y2={scaleY(0)}
            stroke="#8b5e34"
            strokeDasharray="6 6"
          />
        )}

        {cleanPoints.slice(0, 250).map((point, index) => (
          <circle
            key={index}
            cx={scaleX(point.x)}
            cy={scaleY(point.y)}
            r="4"
            fill="#8b5e34"
            opacity="0.68"
          />
        ))}

        <text x={width / 2} y={height - 12} textAnchor="middle">
          {xLabel}
        </text>

        <text
          x="16"
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 16, ${height / 2})`}
        >
          {yLabel}
        </text>
      </svg>

      <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
        Showing up to 250 test samples.
      </p>
    </div>
  );
}

function ClassificationDiagnostics({ model }) {
  const artifacts = model.evaluation_artifacts || {};
  const labels = artifacts.labels || [];
  const matrixRows = artifacts.confusion_matrix || [];

  return (
    <div style={{ marginTop: "28px" }}>
      <h3>Classification Diagnostics</h3>

      <ConfusionMatrix labels={labels} matrixRows={matrixRows} />

      <ClassificationNotes model={model} />
    </div>
  );
}

function ConfusionMatrix({ labels, matrixRows }) {
  if (!Array.isArray(labels) || labels.length === 0 || matrixRows.length === 0) {
    return <p>No confusion matrix available.</p>;
  }

  const maxCount = Math.max(
    ...matrixRows.flatMap((row) => row.values.map((item) => item.count)),
    1
  );

  return (
    <div style={{ marginTop: "18px" }}>
      <h4>Confusion Matrix</h4>

      <div className="table-wrapper">
        <table
          border="1"
          cellPadding="8"
          style={{
            borderCollapse: "collapse",
            minWidth: "600px",
            background: "#fffaf3",
          }}
        >
          <thead>
            <tr>
              <th>Actual \ Predicted</th>
              {labels.map((label) => (
                <th key={String(label)}>{String(label)}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {matrixRows.map((row) => (
              <tr key={String(row.actual)}>
                <th>{String(row.actual)}</th>

                {row.values.map((item) => {
                  const intensity = item.count / maxCount;

                  return (
                    <td
                      key={String(item.predicted)}
                      style={{
                        textAlign: "center",
                        background: `rgba(139, 94, 52, ${0.12 + intensity * 0.55})`,
                        fontWeight: item.count > 0 ? 700 : 400,
                      }}
                    >
                      {item.count}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ color: "var(--text-muted)" }}>
        Large values on the diagonal mean correct predictions. Off-diagonal
        values are misclassifications.
      </p>
    </div>
  );
}

function ClassificationNotes({ model }) {
  const rocAuc = model.metrics?.roc_auc;

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
      <strong>ROC-AUC</strong>

      {rocAuc === null || rocAuc === undefined ? (
        <p style={{ color: "var(--text-muted)" }}>
          ROC-AUC was not available for this model/dataset combination. This can
          happen when probability scores are unavailable or class structure is
          not suitable.
        </p>
      ) : (
        <p style={{ color: "var(--text-muted)" }}>
          ROC-AUC is {rocAuc}. Values closer to 1.0 indicate stronger class
          separation.
        </p>
      )}
    </div>
  );
}

export default MetricExplainer;