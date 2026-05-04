import { useState } from "react";
import BuildRefreshIndexButton from "./components/BuildRefreshIndexButton";
import ResultCard from "./components/ResultCard";
import { uploadFiles } from "./api";
import "./index.css";

function App() {
  const [questionFile, setQuestionFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleReview = async () => {
    if ((!questionFile && !questionText) || (!answerFile && !answerText)) {
      console.log(data.error);
      alert("Please upload files or provide both Question and Draft Answer text.");
      return;
    }

    setLoading(true);

    try {
      const chunkSizeTokens = 2500; // Retrieve from the UI state
      const overlapTokens = 500;    // Retrieve from the UI state
      const topKChunks = 10;        // Retrieve from the UI state

      const data = await uploadFiles(
        questionFile || questionText,
        answerFile || answerText,
        chunkSizeTokens,
        overlapTokens,
        topKChunks
      );

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
    <div className="app-wrapper">
      <div className="dashboard">
        {/* LEFT SIDEBAR */}
        <div className="sidebar">
          <h2>Document Source</h2>

          <p className="sidebar-text">
            Recommended: Use OneDrive/Shared Drive sync and point DOCS_PATH
            to your synced folder.
          </p>

          <div className="input-group">
            <label>DOCS_PATH Folder</label>
            <input
              type="text"
              value="C:\SKS\react\backend\knowledge_base"
              readOnly
            />
          </div>
{/* 
          <div className="input-group">
            <label>INDEX_PATH Folder</label>
            <input
              type="text"
              value="./index"
              readOnly
            />
          </div> */}

          <div className="metric-box">
            <Metric label="Chunk size tokens" value="2500" />
            <Metric label="Overlap chunks" value="500" />
            <Metric label="Top-k retrieved chunks" value="10" />
          </div>

          <div className="refresh-box">
            <BuildRefreshIndexButton />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">
          <h1>
            BidReview RAG Tool (Phase-1) — Multi-doc Retrieval + Compliance
            Review
          </h1>

          <p className="subtitle">
            Phase-1 review validation only. The tool retrieves relevant context
            from your document set and checks answers for compliance, quality
            and Shipley score.
          </p>

          <div className="content-grid">
            {/* QUESTION / RFP */}
            <div>
              <h2>1) Question / RFP</h2>

              <UploadBox
                title="Upload Question"
                file={questionFile}
                setFile={setQuestionFile}
              />

              <textarea
                placeholder="Or paste question text"
                className="text-area"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>

            {/* DRAFT ANSWER */}
            <div>
              <h2>2) Draft Answer</h2>

              <UploadBox
                title="Upload Answer"
                file={answerFile}
                setFile={setAnswerFile}
              />

              <textarea
                placeholder="Or paste answer text"
                className="text-area"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />
            </div>
          </div>

          <div className="run-section">
            <button
              className="run-btn"
              onClick={handleReview}
              disabled={loading}
            >
              {loading ? "Review Running..." : "Run Compliance Review"}
            </button>
          </div>

          {/* RESULTS */}
          
          {results.length > 0 && (
            <div style={{ marginTop: "40px" }}>
              <h2>Compliance Review Results</h2>

              <ResultCard results={results} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadBox({ title, file, setFile }) {
  return (
    <div className="upload-box">
      <label>{title} (optional)</label>

      <div className="upload-inner">
        <div>
          <p className="upload-title">Drag and drop file here</p>
          <p className="upload-subtitle">
            Limit 200MB per file • DOCX, PDF, TXT
          </p>
        </div>

        <input
          type="file"
          id={title}
          className="hidden-input"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <label htmlFor={title} className="browse-btn">
          Browse files
        </label>
      </div>

      {file && (
        <p className="selected-file">
          Selected: {file.name}
        </p>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <div className="metric-header">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <input
        type="range"
        defaultValue="60"
      />
    </div>
  );
}

export default App;
