import { useState } from "react";

function BuildRefreshIndexButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuildRefreshIndex = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/build-refresh-index", {
        method: "POST",
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleBuildRefreshIndex}
        disabled={loading}
        style={{ padding: "14px", backgroundColor: "#111827", color: "white", borderRadius: "10px" }}
      >
        {loading ? "Refreshing Index..." : "Build / Refresh Index"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default BuildRefreshIndexButton;
