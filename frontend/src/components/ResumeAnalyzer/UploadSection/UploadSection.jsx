import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./UploadSection.css";
import { analyzeResume } from "../../../services/auth.service";
const ACCEPTED_TYPES = [".pdf", ".doc", ".docx"];
const MAX_SIZE_MB = 10;

function UploadSection() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const validateFile = (selected) => {
    const ext = "." + selected.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      return "Upload a PDF, DOC, or DOCX file.";
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Keep it under ${MAX_SIZE_MB}MB.`;
    }
    return "";
  };

  const handleFile = (selected) => {
    const validationError = validateFile(selected);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError("");
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("resume", file);
    // targetRole is optional — backend should treat empty string as "no target role specified"
    formData.append("targetRole", targetRole.trim());
    return formData;
  };

  const handleAnalyze = async () => {
    if (!file || isSubmitting) return;

    if (!targetRole.trim()) {
      setError("Enter a target role.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = buildFormData();

      const response = await analyzeResume(formData);

      if (response.success) {
        navigate("/resume-analyzer/result");
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Something went wrong analyzing your resume.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section className="upload-section">
      <span className="upload-eyebrow">
        <span className="upload-eyebrow-dot" />
        Zyoro AI Resume· Analyze & Generate
      </span>

      <h1>See your resume the way an ATS does.</h1>
      <p>
        Upload your resume and get a breakdown of your ATS score, keyword match,
        and formatting issues before a recruiter ever opens it.
      </p>

      <div
        className={`dropzone ${isDragging ? "dropzone--active" : ""} ${file ? "dropzone--filled" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          hidden
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />

        <div className="dropzone-doc">
          <svg
            viewBox="0 0 48 60"
            className="dropzone-doc-svg"
            aria-hidden="true"
          >
            <path d="M6 2h26l10 10v46H6z" className="doc-page" />
            <path d="M32 2v10h10z" className="doc-fold" />
            <line x1="12" y1="24" x2="36" y2="24" className="doc-line" />
            <line x1="12" y1="31" x2="36" y2="31" className="doc-line" />
            <line x1="12" y1="38" x2="28" y2="38" className="doc-line" />
          </svg>
          <div className="dropzone-scanline" />
        </div>

        {file ? (
          <>
            <p className="dropzone-filename">{file.name}</p>
            <p className="dropzone-hint">Click or drop to replace</p>
          </>
        ) : (
          <>
            <p className="dropzone-title">
              Drop your resume here, or <span>browse</span>
            </p>
            <p className="dropzone-hint">
              PDF, DOC, or DOCX · up to {MAX_SIZE_MB}MB
            </p>
          </>
        )}
      </div>

      {error && <p className="upload-error">{error}</p>}

      <div className="target-role-field">
        <label htmlFor="targetRole" className="target-role-label">
          Target role <span className="target-role-required">*</span>
        </label>
        <input
          id="targetRole"
          type="text"
          className="target-role-input"
          placeholder="e.g. Senior Frontend Engineer"
          value={targetRole}
          onChange={(e) => {
            setTargetRole(e.target.value);
            if (error === "Enter a target role.") setError("");
          }}
          maxLength={100}
          required
        />
      </div>

      <div className="cta-group">
        <button
          className="analyze-btn"
          disabled={!file || !targetRole.trim() || isSubmitting}
          onClick={handleAnalyze}
        >
          {isSubmitting ? "Analyzing…" : "Analyze my resume"}
        </button>
      </div>

      <ul className="upload-checks">
        <li>
          <span className="check-icon check-icon--score" />
          ATS compatibility score
        </li>
        <li>
          <span className="check-icon check-icon--keyword" />
          Keyword match
        </li>
        <li>
          <span className="check-icon check-icon--format" />
          Formatting &amp; structure check
        </li>
      </ul>
    </section>
  );
}

export default UploadSection;
