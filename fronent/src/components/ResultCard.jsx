function ResultCard({ results }) {
  if (!results || results.length === 0) return null;

  const compliantCount = results.filter(
    (r) => r.status === "COMPLIANT"
  ).length;

  const total = results.length;
  const coverage = ((compliantCount / total) * 100).toFixed(1);

  return (
    <div
      style={{
        marginTop: "40px",
        background: "#ffffff",
        borderRadius: "16px",
        padding: "30px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "40px",
        }}
      >
        {/* LEFT SIDE */}
        <div>
          <h2 style={{ marginBottom: "20px" }}>
            Compliance checklist (sub-questions)
          </h2>

          {results.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "14px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                }}
              >
                {item.status === "COMPLIANT" ? "✅" : "⚠️"}
              </span>

              <div>
                <div style={{ fontWeight: "600" }}>
                  {item.requirement}
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginTop: "4px",
                  }}
                >
                  {item.explanation}
                </div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: "35px" }}>
            <h2 style={{ marginBottom: "20px" }}>
              Retrieved context (Top chunks)
            </h2>

            {results.map((item, index) =>
              (item.evidence || []).slice(0, 2).map((ev, i) => (
                <div
                  key={`${index}-${i}`}
                  style={{
                    marginBottom: "18px",
                    padding: "14px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "6px",
                    }}
                  >
                    #{i + 1} source: {ev.source}
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#555",
                    }}
                  >
                    Category: {ev.category}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div>
          <h3 style={{ marginBottom: "10px" }}>
            Shipley-style Score
          </h3>

          <div
            style={{
              fontSize: "42px",
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            {compliantCount} / {total}
          </div>

          <div
            style={{
              color: "#16a34a",
              fontWeight: "600",
              marginBottom: "30px",
            }}
          >
            Acceptable
          </div>

          <h3 style={{ marginBottom: "10px" }}>
            Coverage
          </h3>

          <div
            style={{
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            {coverage}%
          </div>

          <div
            style={{
              color: "#16a34a",
              fontWeight: "600",
              marginBottom: "30px",
            }}
          >
            {compliantCount} / {total} sub-questions
          </div>

          <h3 style={{ marginBottom: "20px" }}>
            Rationale
          </h3>

          <ul
            style={{
              paddingLeft: "20px",
              lineHeight: "1.8",
              color: "#555",
            }}
          >
            <li>Answer may be indirect; consider explicit commitments.</li>
            <li>Benefits/outcomes not clear; add concise benefits early.</li>
            <li>Risks/dependencies assumptions not explicit.</li>
            <li>Add proof points without inventing facts.</li>
            <li>Good structural signals detected.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ResultCard;
