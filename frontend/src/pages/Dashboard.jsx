import AppLayout from "../components/layout/AppLayout";
import UploadDataset from "./UploadDataset";

function Dashboard() {
  return (
    <AppLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Dataset Workspace</h1>
        <p className="page-subtitle">
          Start with CSV upload, then move through EDA, target selection,
          preprocessing, and model training.
        </p>
      </div>

      <UploadDataset />
    </AppLayout>
  );
}

export default Dashboard;