import AppLayout from "../components/layout/AppLayout";
import UploadDataset from "./UploadDataset";

function Dashboard() {
  return (
    <AppLayout>
      <div id="dashboard-top" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Dataset Workspace</h1>

        <p className="page-subtitle">
          Upload a dataset and move through preview, EDA, preprocessing,
          modeling, metrics, and AI tutoring.
        </p>
      </div>

      <UploadDataset />
    </AppLayout>
  );
}

export default Dashboard;