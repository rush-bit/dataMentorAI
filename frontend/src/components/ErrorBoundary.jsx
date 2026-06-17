import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, info) {
    console.error("React render error:", error);
    console.error("Error info:", info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            marginTop: "24px",
            padding: "20px",
            border: "1px solid red",
            borderRadius: "8px",
            color: "red",
            backgroundColor: "#fff5f5",
          }}
        >
          <h2>Something crashed in this section.</h2>
          <p>{String(this.state.error?.message || this.state.error)}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;