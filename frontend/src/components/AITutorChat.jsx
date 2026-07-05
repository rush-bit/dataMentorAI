import { useState } from "react";
import axiosClient from "../api/axiosClient";

function AITutorChat({
  datasetInfo,
  edaReport,
  targetInfo,
  advancedEDA,
  preprocessingPlan,
  trainingResult,
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasContext = datasetInfo || edaReport || targetInfo || trainingResult;

  const suggestedQuestions = [
    "What does this dataset seem to be about?",
    "Which column affects the target most?",
    "Why should I use StandardScaler?",
    "What does RMSE mean?",
    "Why is my R² low?",
    "How can I improve this model?",
    "Why did the best model perform better?",
  ];

  const handleAsk = async (customQuestion = null) => {
    const finalQuestion = customQuestion || question;

    if (!finalQuestion.trim()) {
      setError("Please enter a question.");
      return;
    }

    const userMessage = {
      role: "user",
      text: finalQuestion,
    };

    try {
      setLoading(true);
      setError("");
      setMessages((current) => [...current, userMessage]);
      setQuestion("");

      const response = await axiosClient.post("/api/tutor/chat", {
        question: finalQuestion,
        context: {
          datasetInfo,
          edaReport,
          targetInfo,
          advancedEDA,
          preprocessingPlan,
          trainingResult,
        },
      });

      const assistantMessage = {
        role: "assistant",
        text: response.data.answer,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      console.error("AI tutor error:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Something went wrong while asking the AI tutor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: "22px",
        background: "var(--bg-card)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>AI Tutor Chat</h2>

      <p style={{ color: "var(--text-muted)" }}>
        Ask questions about your dataset, EDA, preprocessing decisions, model
        results, and metrics.
      </p>

      {!hasContext && (
        <p style={{ color: "var(--danger)", fontWeight: 600 }}>
          Upload a dataset first so the tutor has context.
        </p>
      )}

      <div style={{ marginTop: "18px" }}>
        <strong>Suggested questions</strong>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "12px",
          }}
        >
          {suggestedQuestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleAsk(item)}
              disabled={loading || !hasContext}
              className="btn btn-secondary"
              style={{
                fontSize: "14px",
                padding: "8px 12px",
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "22px",
          minHeight: "180px",
          maxHeight: "420px",
          overflowY: "auto",
          padding: "14px",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          background: "#fff7ed",
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            No messages yet. Ask a question after uploading and analyzing a
            dataset.
          </p>
        ) : (
          messages.map((message, index) => (
            <ChatBubble key={index} message={message} />
          ))
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "16px",
        }}
      >
        <input
          className="input"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleAsk();
            }
          }}
          placeholder="Ask: Why did Random Forest perform better?"
          disabled={loading || !hasContext}
        />

        <button
          type="button"
          onClick={() => handleAsk()}
          disabled={loading || !hasContext}
          className="btn btn-primary"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {error && (
        <p
          style={{
            color: "var(--danger)",
            marginTop: "14px",
            fontWeight: 600,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          maxWidth: "78%",
          padding: "12px 14px",
          borderRadius: "14px",
          background: isUser ? "var(--primary)" : "#fffaf3",
          color: isUser ? "white" : "var(--text-main)",
          border: isUser ? "none" : "1px solid var(--border)",
          whiteSpace: "pre-wrap",
          lineHeight: 1.55,
        }}
      >
        {message.text}
      </div>
    </div>
  );
}

export default AITutorChat;