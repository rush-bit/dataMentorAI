function DatasetPreview({ datasetInfo }) {
  const previewRows = datasetInfo.preview || [];
  const columns = datasetInfo.column_names || [];

  return (
    <div style={{ marginTop: "32px" }}>
      <h2>Dataset Preview</h2>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <InfoCard title="Filename" value={datasetInfo.filename} />
        <InfoCard title="Rows" value={datasetInfo.rows} />
        <InfoCard title="Columns" value={datasetInfo.columns} />
        <InfoCard title="Dataset ID" value={datasetInfo.dataset_id.slice(0, 8)} />
      </div>

      <h3>Column Data Types</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", marginBottom: "24px" }}>
        <thead>
          <tr>
            <th>Column</th>
            <th>Data Type</th>
            <th>Missing Values</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((column) => (
            <tr key={column}>
              <td>{column}</td>
              <td>{datasetInfo.data_types[column]}</td>
              <td>{datasetInfo.missing_values[column]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>First 5 Rows</h3>

      <div style={{ overflowX: "auto" }}>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {previewRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column}>
                    {row[column] === null ? "NULL" : String(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        minWidth: "140px",
      }}
    >
      <strong>{title}</strong>
      <p>{value}</p>
    </div>
  );
}

export default DatasetPreview;