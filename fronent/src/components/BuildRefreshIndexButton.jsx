import { useState } from "react";

function BuildRefreshIndexButton() {
  const [loading, setLoading] = useState(false);

  const handleRefreshKB = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/build-refresh-index",
        {
          method: "POST",
        }
      );

      const text = await res.text();

      console.log("Raw Backend Response:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Backend returned invalid JSON");
      }

      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message || "Knowledge Base refreshed successfully");
      }
    } catch (error) {
      console.error(error);
      alert("Frontend Error: " + error.message);
    }

    setLoading(false);
  };

  return (
    <button
      className="refresh-btn"
      onClick={handleRefreshKB}
      disabled={loading}
    >
      {loading ? "Refreshing..." : "Build/Refresh Knowledge Base"}
    </button>
  );
}

export default BuildRefreshIndexButton;
