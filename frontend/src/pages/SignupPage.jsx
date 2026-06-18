import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
// import { GoArrowLeft } from "react-icons/go";
import { FaArrowLeftLong } from "react-icons/fa6";

function SignupPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

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
      <Card style={{ width: "100%", maxWidth: "460px" }}>
        <Link to="/" style={{ color: "var(--primary)", fontWeight: 800 }}>
            {/* <GoArrowLeft /> */}
            <FaArrowLeftLong />
        </Link>

        <h1 style={{ margin: "24px 0 8px", letterSpacing: "-0.04em" }}>
          Create account
        </h1>


        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input className="input" type="text" placeholder="Your name" />

          <div style={{ marginTop: "16px" }}>
            <label>Email</label>
            <input className="input" type="email" placeholder="you@example.com" />
          </div>

          <div style={{ marginTop: "16px" }}>
            <label>Password</label>
            <input className="input" type="password" placeholder="Create password" />
          </div>

          <div style={{ marginTop: "16px" }}>
            <label>Confirm password</label>
            <input className="input" type="password" placeholder="Confirm password" />
          </div>

          <Button type="submit" style={{ width: "100%", marginTop: "22px" }}>
            Create account
          </Button>
        </form>

        <p style={{ marginTop: "18px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default SignupPage;