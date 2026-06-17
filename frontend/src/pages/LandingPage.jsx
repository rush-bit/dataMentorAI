import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
            "radial-gradient(circle at top left, #ead7c0 0, #f6efe7 42%, #fffaf3 100%)",
      }}
    >
      <nav
        style={{
          height: "74px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8%",
        }}
      >
        <strong style={{ fontSize: "22px" }}>DataMentor AI</strong>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/login">
            <Button variant="secondary">Login</Button>
          </Link>

          <Link to="/signup">
            <Button>Sign up</Button>
          </Link>
        </div>
      </nav>

      <section
        style={{
          padding: "80px 8% 40px",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "42px",
          alignItems: "center",
        }}
      >
        <div>
          <Badge>AI data science tutor</Badge>

          <h1
            style={{
              fontSize: "56px",
              lineHeight: 1.02,
              letterSpacing: "-0.06em",
              margin: "22px 0 18px",
            }}
          >
            Learn data science by analyzing real datasets.
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "var(--text-muted)",
              maxWidth: "620px",
              lineHeight: 1.7,
            }}
          >
            Upload a CSV, explore EDA, get preprocessing guidance, train models,
            compare metrics, and understand every step with AI explanations.
          </p>

          <div style={{ display: "flex", gap: "14px", marginTop: "30px" }}>
            <Link to="/dashboard">
              <Button>Try dashboard</Button>
            </Link>

            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
        </div>

        <Card>
          <h3 style={{ marginTop: 0 }}>Workflow</h3>

          <WorkflowItem number="1" title="Upload CSV" text="Preview columns, rows, missing values, and data types." />
          <WorkflowItem number="2" title="EDA Assistant" text="Analyze distributions, correlations, outliers, and skewness." />
          <WorkflowItem number="3" title="Preprocessing Coach" text="Understand imputation, encoding, scaling, and splitting." />
          <WorkflowItem number="4" title="Model Training" text="Train ML models and learn what the metrics mean." />
        </Card>
      </section>
    </div>
  );
}

function WorkflowItem({ number, title, text }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        padding: "16px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          background: "var(--primary-soft)",
          color: "var(--primary)",
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {number}
      </div>

      <div>
        <strong>{title}</strong>
        <p style={{ margin: "5px 0 0", color: "var(--text-muted)" }}>{text}</p>
      </div>
    </div>
  );
}

export default LandingPage;