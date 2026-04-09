export default function Results({ assessment, onRestart }) {
  if (!assessment || !assessment.summary) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
          Generating report... (If stuck, check backend logs)
        </p>
      </div>
    );
  }

  const recommendationStyle = {
    fontSize: 12,
    fontWeight: 500,
    padding: "4px 12px",
    borderRadius: 8,
    background: "var(--color-background-success)",
    color: "var(--color-text-success)",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "2.5rem 1rem", minHeight: 400 }}>
      <div style={{
        width: "100%",
        maxWidth: 520,
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12,
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ padding: "1.5rem 1.5rem 1.25rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>
            Interview result
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>
              Candidate assessment
            </p>
            <span style={recommendationStyle}>{assessment.recommendation || "Pending"}</span>
          </div>
        </div>

        {/* Summary */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 6px" }}>Summary</p>
          <p style={{ fontSize: 15, color: "var(--color-text-primary)", lineHeight: 1.6, margin: 0 }}>
            {assessment.summary || "No summary available"}
          </p>
        </div>

        {/* Recommendation detail */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 6px" }}>Recommendation</p>
          <p style={{ fontSize: 15, color: "var(--color-text-primary)", lineHeight: 1.6, margin: 0 }}>
            {assessment.recommendation || "Pending"}
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onRestart} style={{ fontSize: 14, padding: "8px 20px", borderRadius: 8, cursor: "pointer" }}>
            Restart
          </button>
        </div>

      </div>
    </div>
  );
}