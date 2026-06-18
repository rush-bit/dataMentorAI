import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { FaArrowLeftLong } from "react-icons/fa6";

function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <AuthShell
      title="Welcome back"
    >
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input className="input" type="email" placeholder="you@example.com" />

        <div style={{ marginTop: "16px" }}>
          <label>Password</label>
          <input className="input" type="password" placeholder="Enter password" />
        </div>

        <Button type="submit" style={{ width: "100%", marginTop: "22px" }}>
          Login
        </Button>
      </form>

      <p style={{ marginTop: "18px", color: "var(--text-muted)" }}>
        New here?{" "}
        <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 700 }}>
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
            "radial-gradient(circle at top left, #ead7c0 0, #f6efe7 42%, #fffaf3 100%)",
      }}
    >
      <Card style={{ width: "100%", maxWidth: "430px" }}>
        <Link to="/" style={{ color: "var(--primary)", fontWeight: 800 }}>
            <FaArrowLeftLong />
        </Link>

        <h1 style={{ margin: "24px 0 8px", letterSpacing: "-0.04em" }}>
          {title}
        </h1>

        <p style={{ margin: "0 0 24px", color: "var(--text-muted)" }}>
          {subtitle}
        </p>

        {children}
      </Card>
    </div>
  );
}

export default LoginPage;