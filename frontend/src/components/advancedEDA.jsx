import { useState } from "react";
import axiosClient from "../api/axiosClient";

function AdvancedEDA({ datasetId, targetInfo, onAdvancedEDAComplete }) {
  const [advancedEDA, setAdvancedEDA] = useState(null);
  const [selectedDistributionColumn, setSelectedDistributionColumn] = useState("");
  const [selectedRelationshipColumn, setSelectedRelationshipColumn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateAdvancedEDA = async () => {
    try {
      setLoading(true);
      setError("");
      setAdvancedEDA(null);

      const response = await axiosClient.post(
        `/api/datasets/${datasetId}/advanced-eda`,
        {
          target_column: targetInfo?.target_column || null,
          problem_type: targetInfo?.problem_type || null,
        }
      );

      const data = response.data;
      setAdvancedEDA(data);
      if (onAdvancedEDAComplete) {
        onAdvancedEDAComplete(data);
      }

      const distributionColumns = Object.keys(data?.distributions || {});
      setSelectedDistributionColumn(distributionColumns[0] || "");

      const scatterColumns = Object.keys(
        data?.feature_target_relationships?.scatter_samples || {}
      );
      setSelectedRelationshipColumn(scatterColumns[0] || "");
    } catch (err) {
      console.error("Advanced EDA error:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Something went wrong while generating advanced EDA."
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
        maxWidth: "1100px",
      }}
    >
      <h2>EDA Assistant</h2>

      <p>
        Generate correlations, distributions, outlier detection, skewness, and
        feature-target relationships.
      </p>

      <button
        onClick={handleGenerateAdvancedEDA}
        disabled={loading}
        style={{
          marginTop: "12px",
          padding: "10px 16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating Advanced EDA..." : "Generate Advanced EDA"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "12px" }}>
          {error}
        </p>
      )}

      {advancedEDA && (
        <div style={{ marginTop: "28px" }}>
          <EDAInsights insights={advancedEDA.eda_insights} />

          <CorrelationHeatmap correlationMatrix={advancedEDA.correlation_matrix} />

          <DistributionViewer
            distributions={advancedEDA.distributions}
            selectedColumn={selectedDistributionColumn}
            setSelectedColumn={setSelectedDistributionColumn}
          />

          <OutlierTable outliers={advancedEDA.outliers} />

          <SkewnessTable skewness={advancedEDA.skewness} />

          <FeatureTargetRelationship
            relationships={advancedEDA.feature_target_relationships}
            selectedColumn={selectedRelationshipColumn}
            setSelectedColumn={setSelectedRelationshipColumn}
          />
        </div>
      )}
    </div>
  );
}

function EDAInsights({ insights }) {
  if (!Array.isArray(insights) || insights.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "32px" }}>
      <h3>Automatic EDA Insights</h3>

      {insights.map((insight, index) => (
        <div
          key={index}
          style={{
            marginTop: "12px",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <strong>{insight.title || "Insight"}</strong>
          <p>{insight.message || "No message available."}</p>
        </div>
      ))}
    </div>
  );
}

function CorrelationHeatmap({ correlationMatrix }) {
  const matrix = correlationMatrix || {};
  const columns = Object.keys(matrix);

  if (columns.length < 2) {
    return (
      <div style={{ marginTop: "32px" }}>
        <h3>Correlation Heatmap</h3>
        <p>Not enough numeric columns to generate correlation heatmap.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "32px" }}>
      <h3>Correlation Heatmap</h3>

      <div style={{ overflowX: "auto" }}>
        <table
          cellPadding="8"
          style={{
            borderCollapse: "collapse",
            marginTop: "12px",
          }}
        >
          <thead>
            <tr>
              <th></th>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {columns.map((rowColumn) => (
              <tr key={rowColumn}>
                <th>{rowColumn}</th>

                {columns.map((colColumn) => {
                  const value = matrix[colColumn]?.[rowColumn];
                  const numericValue =
                    typeof value === "number" ? value : 0;

                  return (
                    <td
                      key={colColumn}
                      style={{
                        border: "1px solid #ddd",
                        backgroundColor: getCorrelationColor(numericValue),
                        textAlign: "center",
                        minWidth: "70px",
                      }}
                    >
                      {typeof value === "number" ? value.toFixed(2) : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "8px", fontSize: "14px" }}>
        Values close to 1 show strong positive correlation. Values close to -1
        show strong negative correlation.
      </p>
    </div>
  );
}

function getCorrelationColor(value) {
  const intensity = Math.min(Math.abs(value), 1);

  if (value > 0) {
    return `rgba(255, 99, 71, ${0.15 + intensity * 0.65})`;
  }

  if (value < 0) {
    return `rgba(65, 105, 225, ${0.15 + intensity * 0.65})`;
  }

  return "#f8f9fa";
}

function DistributionViewer({
  distributions,
  selectedColumn,
  setSelectedColumn,
}) {
  const allDistributions = distributions || {};
  const columns = Object.keys(allDistributions);

  if (columns.length === 0) {
    return null;
  }

  const activeColumn =
    selectedColumn && allDistributions[selectedColumn]
      ? selectedColumn
      : columns[0];

  const selectedDistribution = allDistributions[activeColumn];

  if (!selectedDistribution) {
    return null;
  }

  const histogram = Array.isArray(selectedDistribution.histogram)
    ? selectedDistribution.histogram
    : [];

  const categoryCounts = Array.isArray(selectedDistribution.category_counts)
    ? selectedDistribution.category_counts
    : [];

  return (
    <div style={{ marginTop: "32px" }}>
      <h3>Distribution Plot</h3>

      <select
        value={activeColumn}
        onChange={(event) => setSelectedColumn(event.target.value)}
        style={{
          padding: "10px",
          minWidth: "260px",
          marginBottom: "16px",
        }}
      >
        {columns.map((column) => (
          <option key={column} value={column}>
            {column}
          </option>
        ))}
      </select>

      {selectedDistribution.type === "numeric" && (
        <BarChart
          title={`Distribution of ${activeColumn}`}
          data={histogram.map((item) => ({
            label: item.label,
            value: item.count,
          }))}
        />
      )}

      {selectedDistribution.type === "categorical" && (
        <BarChart
          title={`Category counts for ${activeColumn}`}
          data={categoryCounts.map((item) => ({
            label: item.category,
            value: item.count,
          }))}
        />
      )}
    </div>
  );
}

function BarChart({ title, data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>No chart data available.</p>;
  }

  const maxValue = Math.max(...data.map((item) => Number(item.value) || 0), 1);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        marginTop: "12px",
      }}
    >
      <h4>{title}</h4>

      <div style={{ marginTop: "16px" }}>
        {data.map((item, index) => {
          const width = `${((Number(item.value) || 0) / maxValue) * 100}%`;

          return (
            <div key={index} style={{ marginBottom: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                <span>{String(item.label)}</span>
                <span>{item.value}</span>
              </div>

              <div
                style={{
                  height: "14px",
                  backgroundColor: "#eee",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width,
                    height: "100%",
                    backgroundColor: "#4f46e5",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OutlierTable({ outliers }) {
  const outlierData = outliers || {};
  const columns = Object.keys(outlierData);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "32px" }}>
      <h3>Outlier Detection</h3>

      <SimpleTable
        columns={[
          "Column",
          "Outlier Count",
          "Outlier %",
          "Lower Bound",
          "Upper Bound",
        ]}
        rows={columns.map((column) => [
          column,
          outlierData[column]?.outlier_count,
          `${outlierData[column]?.outlier_percentage ?? 0}%`,
          outlierData[column]?.lower_bound,
          outlierData[column]?.upper_bound,
        ])}
      />
    </div>
  );
}

function SkewnessTable({ skewness }) {
  const skewnessData = skewness || {};
  const columns = Object.keys(skewnessData);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "32px" }}>
      <h3>Skewness Detection</h3>

      <SimpleTable
        columns={["Column", "Skewness", "Interpretation"]}
        rows={columns.map((column) => [
          column,
          skewnessData[column]?.skewness,
          skewnessData[column]?.interpretation,
        ])}
      />
    </div>
  );
}

function FeatureTargetRelationship({
  relationships,
  selectedColumn,
  setSelectedColumn,
}) {
  if (!relationships || !relationships.target_column) {
    return (
      <div style={{ marginTop: "32px" }}>
        <h3>Feature-vs-Target Relationships</h3>
        <p>
          Select and analyze a target column first to generate feature-target
          relationships.
        </p>
      </div>
    );
  }

  const scatterSamples = relationships.scatter_samples || {};
  const scatterColumns = Object.keys(scatterSamples);

  const activeColumn =
    selectedColumn && scatterSamples[selectedColumn]
      ? selectedColumn
      : scatterColumns[0];

  const activeSamples = Array.isArray(scatterSamples[activeColumn])
    ? scatterSamples[activeColumn]
    : [];

  const classDistribution = Array.isArray(relationships.class_distribution)
    ? relationships.class_distribution
    : [];

  return (
    <div style={{ marginTop: "32px" }}>
      <h3>Feature-vs-Target Relationships</h3>

      {relationships.problem_type === "regression" && scatterColumns.length > 0 && (
        <>
          <select
            value={activeColumn}
            onChange={(event) => setSelectedColumn(event.target.value)}
            style={{
              padding: "10px",
              minWidth: "260px",
              marginBottom: "16px",
            }}
          >
            {scatterColumns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>

          <SimpleScatterPlot
            title={`${activeColumn} vs ${relationships.target_column}`}
            xLabel={activeColumn}
            yLabel={relationships.target_column}
            points={activeSamples}
          />
        </>
      )}

      {relationships.problem_type === "regression" && scatterColumns.length === 0 && (
        <p>No numeric feature-target scatter data found.</p>
      )}

      {relationships.problem_type === "classification" && classDistribution.length > 0 && (
        <BarChart
          title={`Class distribution of ${relationships.target_column}`}
          data={classDistribution.map((item) => ({
            label: item.class,
            value: item.count,
          }))}
        />
      )}

      {relationships.problem_type === "classification" &&
        classDistribution.length === 0 && (
          <p>No class distribution data found.</p>
        )}
    </div>
  );
}

function SimpleScatterPlot({ title, xLabel, yLabel, points }) {
  if (!Array.isArray(points) || points.length === 0) {
    return <p>No scatter data available.</p>;
  }

  const width = 700;
  const height = 420;
  const padding = 50;

  const xValues = points.map((point) => Number(point.x)).filter(Number.isFinite);
  const yValues = points.map((point) => Number(point.y)).filter(Number.isFinite);

  if (xValues.length === 0 || yValues.length === 0) {
    return <p>Scatter plot requires numeric x and y values.</p>;
  }

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
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        overflowX: "auto",
      }}
    >
      <h4>{title}</h4>

      <svg width={width} height={height}>
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#333"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#333"
        />

        {points.slice(0, 200).map((point, index) => {
          const x = Number(point.x);
          const y = Number(point.y);

          if (!Number.isFinite(x) || !Number.isFinite(y)) {
            return null;
          }

          return (
            <circle
              key={index}
              cx={scaleX(x)}
              cy={scaleY(y)}
              r="4"
              fill="#4f46e5"
              opacity="0.7"
            />
          );
        })}

        <text x={width / 2} y={height - 10} textAnchor="middle">
          {xLabel}
        </text>

        <text
          x="15"
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${height / 2})`}
        >
          {yLabel}
        </text>
      </svg>

      <p style={{ fontSize: "13px" }}>
        Showing up to 200 sample points.
      </p>
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          minWidth: "700px",
          marginTop: "12px",
        }}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>
                  {cell === null || cell === undefined ? "-" : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdvancedEDA;