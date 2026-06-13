function EDAReport({ edaReport }) {
  if (!edaReport) return null;

  const numericColumns = edaReport.numeric_columns || [];
  const categoricalColumns = edaReport.categorical_columns || [];
  const dateColumns = edaReport.date_columns || [];

  return (
    <div style={{ marginTop: "32px" }}>
      <h2>Basic EDA Report</h2>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <InfoCard title="Rows" value={edaReport.rows} />
        <InfoCard title="Columns" value={edaReport.columns} />
        <InfoCard title="Duplicate Rows" value={edaReport.duplicate_rows} />
        <InfoCard title="Numeric Columns" value={numericColumns.length} />
        <InfoCard title="Categorical Columns" value={categoricalColumns.length} />
        <InfoCard title="Date Columns" value={dateColumns.length} />
      </div>

      <Section title="Column Types">
        <ColumnList title="Numeric Columns" columns={numericColumns} />
        <ColumnList title="Categorical Columns" columns={categoricalColumns} />
        <ColumnList title="Date Columns" columns={dateColumns} />
      </Section>

      <Section title="Missing Values">
        <SimpleTable
          columns={["Column", "Missing Count", "Missing %"]}
          rows={Object.keys(edaReport.missing_values).map((column) => [
            column,
            edaReport.missing_values[column],
            `${edaReport.missing_percentage[column]}%`,
          ])}
        />
      </Section>

      <Section title="Unique Values">
        <SimpleTable
          columns={["Column", "Unique Values"]}
          rows={Object.keys(edaReport.unique_values).map((column) => [
            column,
            edaReport.unique_values[column],
          ])}
        />
      </Section>

      <Section title="Numeric Summary">
        <NumericSummaryTable numericSummary={edaReport.numeric_summary} />
      </Section>

      <Section title="Categorical Summary">
        <CategoricalSummaryTable categoricalSummary={edaReport.categorical_summary} />
      </Section>
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
        minWidth: "150px",
      }}
    >
      <strong>{title}</strong>
      <p>{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: "28px" }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function ColumnList({ title, columns }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <strong>{title}</strong>
      {columns.length === 0 ? (
        <p>No columns found.</p>
      ) : (
        <p>{columns.join(", ")}</p>
      )}
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
          minWidth: "500px",
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
                <td key={cellIndex}>{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NumericSummaryTable({ numericSummary }) {
  const columnNames = Object.keys(numericSummary || {});

  if (columnNames.length === 0) {
    return <p>No numeric columns found.</p>;
  }

  const metrics = ["count", "mean", "std", "min", "25%", "50%", "75%", "max"];

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
            <th>Column</th>
            {metrics.map((metric) => (
              <th key={metric}>{metric}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {columnNames.map((column) => (
            <tr key={column}>
              <td>{column}</td>
              {metrics.map((metric) => (
                <td key={metric}>
                  {numericSummary[column][metric] === null ||
                  numericSummary[column][metric] === undefined
                    ? "-"
                    : numericSummary[column][metric]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoricalSummaryTable({ categoricalSummary }) {
  const columnNames = Object.keys(categoricalSummary || {});

  if (columnNames.length === 0) {
    return <p>No categorical columns found.</p>;
  }

  return (
    <SimpleTable
      columns={["Column", "Unique Count", "Most Frequent", "Most Frequent Count"]}
      rows={columnNames.map((column) => [
        column,
        categoricalSummary[column].unique_count,
        categoricalSummary[column].most_frequent ?? "-",
        categoricalSummary[column].most_frequent_count,
      ])}
    />
  );
}

export default EDAReport;   