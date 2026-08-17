import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResumeAnalyzeResult.css";
import {
    getResumeAnalysis,
    generateOptimizedResume
} from "../../services/auth.service";

function getAtsStatus(score) {
    if (score >= 85) return "excellent";
    if (score >= 60) return "good";
    return "poor";
}

const statusLabels = {
    excellent: "Excellent",
    good: "Good",
    poor: "Poor",
};

function ResumeAnalyzeResult() {

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [resumeUrl, setResumeUrl] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchResumeAnalysis();
    }, []);

    // Clean generated blob URL when component closes
    useEffect(() => {
        return () => {
            if (resumeUrl) {
                window.URL.revokeObjectURL(resumeUrl);
            }
        };
    }, [resumeUrl]);

    const fetchResumeAnalysis = async () => {
        try {

            const response = await getResumeAnalysis();

            if (response.success) {
                setResult(response.message);
            } else {
                setError(response.message);
            }

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to fetch resume analysis."
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // Generate Resume
    // =========================

    const handleGenerateResume = async () => {

        if (generating) return;

        try {

            setGenerating(true);
            setError("");

            const response = await generateOptimizedResume();

            const blob = new Blob(
                [response.data],
                {
                    type: "application/pdf"
                }
            );

            const url = window.URL.createObjectURL(blob);

            setResumeUrl(url);

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to generate optimized resume."
            );

        } finally {
            setGenerating(false);
        }
    };

    // =========================
    // View Resume
    // =========================

    const handleViewResume = () => {

        if (!resumeUrl) return;

        window.open(
            resumeUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // =========================
    // Download Resume
    // =========================

    const handleDownloadResume = () => {

        if (!resumeUrl) return;

        const link = document.createElement("a");

        link.href = resumeUrl;

        link.download = "Optimized_Resume.pdf";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    };

    // =========================
    // Back
    // =========================

    const handleBack = () => {
        navigate(-1);
    };

    // =========================
    // Loading
    // =========================

    if (loading) {
        return (
            <div className="resume-result-page">
                <h2>Loading...</h2>
            </div>
        );
    }

    // =========================
    // Error
    // =========================

    if (error && !result) {
        return (
            <div className="resume-result-page">

                <h2>{error}</h2>

                <button
                    className="back-resume-btn"
                    onClick={handleBack}
                >
                    ← Back
                </button>

            </div>
        );
    }

    const {
        atsScore,
        summary,
        skills = [],
        missingSkills = [],
        suggestions = [],
    } = result;

    const status = getAtsStatus(atsScore);

    return (
        <div className="resume-result-page">

            {/* =========================
                Back
            ========================= */}

            <div className="resume-result-top-actions">

                <button
                    className="back-resume-btn"
                    onClick={handleBack}
                >
                    ← Back
                </button>

            </div>


            {/* =========================
                Header
            ========================= */}

            <div className="result-header">

                <h1>Resume Analysis</h1>

                <p>
                    AI Powered ATS Report
                </p>

            </div>


            {/* =========================
                ATS Score
            ========================= */}

            <div
                className={`score-card score-card--${status}`}
            >

                <span className="score-label">
                    ATS Score
                </span>

                <div className="score-circle">

                    <span className="score-value">
                        {atsScore}
                    </span>

                </div>

                <span className="score-status">
                    {statusLabels[status]}
                </span>

            </div>


            {/* =========================
                Summary
            ========================= */}

            {summary && (

                <div className="result-section">

                    <h3>
                        Professional Summary
                    </h3>

                    <p className="summary-text">
                        {summary}
                    </p>

                </div>

            )}


            {/* =========================
                Skills
            ========================= */}

            {skills.length > 0 && (

                <div className="result-section">

                    <h3>Skills</h3>

                    <div className="tag-list">

                        {skills.map(
                            (skill, index) => (

                                <span
                                    key={index}
                                    className="tag tag--skill"
                                >
                                    {skill}
                                </span>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* =========================
                Missing Skills
            ========================= */}

            {missingSkills.length > 0 && (

                <div className="result-section">

                    <h3>
                        Missing Skills
                    </h3>

                    <div className="tag-list">

                        {missingSkills.map(
                            (skill, index) => (

                                <span
                                    key={index}
                                    className="tag tag--missing"
                                >
                                    {skill}
                                </span>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* =========================
                Suggestions
            ========================= */}

            {suggestions.length > 0 && (

                <div className="result-section">

                    <h3>Suggestions</h3>

                    <ul className="suggestions-list">

                        {suggestions.map(
                            (item, index) => (

                                <li key={index}>
                                    {item}
                                </li>

                            )
                        )}

                    </ul>

                </div>

            )}


            {/* =========================
                Resume Actions
            ========================= */}

            <div className="resume-result-actions">

                {!resumeUrl ? (

                    <button
                        className="generate-ai-resume-btn"
                        onClick={handleGenerateResume}
                        disabled={generating}
                    >

                        {generating
                            ? "Generating..."
                            : "Generate Optimized Resume"}

                    </button>

                ) : (

                    <div className="generated-resume-actions">

                        <div className="resume-ready-message">

                            <span className="resume-ready-icon">
                                ✓
                            </span>

                            <div>
                                <strong>
                                    Your optimized resume is ready
                                </strong>

                                <p>
                                    Preview your resume or download the PDF.
                                </p>
                            </div>

                        </div>


                        <div className="resume-action-buttons">

                            <button
                                className="view-resume-btn"
                                onClick={handleViewResume}
                            >
                                View Resume
                            </button>

                            <button
                                className="download-resume-btn"
                                onClick={handleDownloadResume}
                            >
                                Download Resume
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}

export default ResumeAnalyzeResult;