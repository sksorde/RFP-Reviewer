import { useState } from "react";
import { uploadFiles } from "../api";

function Upload({ setResults }) {
  const [rfp, setRfp] = useState(null);        // State to store uploaded RFP
  const [response, setResponse] = useState(null); // State to store uploaded response
  const [rfpText, setRfpText] = useState("");    // State to store text input for RFP
  const [responseText, setResponseText] = useState(""); // State to store text input for response
  const [loading, setLoading] = useState(false);
  
  const handleUpload = async () => {
    if ((!rfp && !rfpText) || (!response && !responseText)) {
      alert("Please upload both RFP and Draft Answer, or provide text input.");
      return;
    }

    setLoading(true);

    try {
      const data = await uploadFiles(rfp || rfpText, response || responseText);

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      setResults(data.results || []);
    } catch (error) {
      alert("Frontend Error: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="upload-card">
      <h2>Upload Documents</h2>

      {/* RFP Upload / Text Area */}
      <div className="file-group">
        <label>Upload RFP Document (optional)</label>
        <input
          type="file"
          onChange={(e) => setRfp(e.target.files[0])}
        />
        <textarea
          placeholder="Or paste RFP question text"
          value={rfpText}
          onChange={(e) => setRfpText(e.target.value)}
        />
      </div>

      {/* Draft Answer Upload / Text Area */}
      <div className="file-group">
        <label>Upload Draft Answer (optional)</label>
        <input
          type="file"
          onChange={(e) => setResponse(e.target.files[0])}
        />
        <textarea
          placeholder="Or paste answer text"
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
        />
      </div>

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Review Running..." : "Run Compliance Review"}
      </button>
    </div>
  );
}

export default Upload;
