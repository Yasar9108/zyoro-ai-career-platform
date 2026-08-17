import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFaceToFaceInterview } from "../../../services/auth.service";
import "./InterviewReport.css";

function InterviewReport() {

  const navigate = useNavigate();
  const { interviewId } = useParams();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadInterviewReport() {
      try {
        setLoading(true);
        setError("");

        if (!interviewId) {
          throw new Error("Interview id is missing.");
        }

        const response =
          await getFaceToFaceInterview(interviewId);

        if (!response?.success || !response?.interview) {
          throw new Error(
            response?.message ||
            "Unable to load interview report."
          );
        }

        if (isMounted) {
          setInterview(response.interview);
        }
      } catch (err) {
        console.error(
          "InterviewReport",
          "Unable to load report:",
          err
        );

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load interview report."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInterviewReport();

    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  const finalReport = interview?.finalReport || {};
  const speakingAnalytics = interview?.speakingAnalytics || {};
  const presentationAnalytics =
    interview?.presentationAnalytics || {};

  const overallScore = Number(finalReport.overallScore) || 0;
  const technicalScore =
    Number(finalReport.technicalScore) || 0;
  const communicationScore =
    Number(finalReport.communicationScore) || 0;

  const questionsAnswered =
    Number(speakingAnalytics.totalAnswers) ||
    interview?.conversations?.filter(
      (conversation) => conversation.answer?.trim()
    ).length ||
    0;

  const wordsPerMinute =
    Number(speakingAnalytics.wordsPerMinute) || 0;

  const cameraPresence =
    Number(presentationAnalytics.faceDetectedPercent) || 0;

  function getHiringSignal(score) {
    if (score >= 85) return "Strong Hire";
    if (score >= 70) return "Hire";
    if (score >= 55) return "Consider";
    return "Needs Improvement";
  }

  const hiringSignal = getHiringSignal(overallScore);

  const strengths = Array.isArray(finalReport.strengths)
    ? finalReport.strengths
    : [];

  const weaknesses = Array.isArray(finalReport.weaknesses)
    ? finalReport.weaknesses
    : [];

  const topicsToImprove =
    Array.isArray(finalReport.topicsToImprove)
      ? finalReport.topicsToImprove
      : [];

  const improvementItems =
    weaknesses.length > 0 ? weaknesses : topicsToImprove;


  function handleBack() {
    navigate("/interview-preparation");
  }

  function handleJobHunt() {
    navigate("/job-hunt");
  }

  if (loading) {
    return (
      <div className="interview-report-page">
        <div className="report-loading">
          <div className="report-loader" />
          <h2>Preparing your interview report...</h2>
          <p>Analyzing your completed interview.</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="interview-report-page">
        <div className="report-error">
          <div className="report-error-icon">!</div>
          <h2>Unable to load your report</h2>
          <p>{error || "Interview report not found."}</p>

          <button
            type="button"
            className="secondary-action"
            onClick={handleBack}
          >
            Back to Interview Preparation
          </button>
        </div>
      </div>
    );
  }

  return (

    <div className="interview-report-page">

      {/* =====================================================
          Top Navigation
      ===================================================== */}

      <div className="report-topbar">

        <button
          type="button"
          className="report-back-button"
          onClick={handleBack}
        >
          ← Back to Interview Preparation
        </button>

      </div>


      {/* =====================================================
          Header
      ===================================================== */}

      <header className="report-header">

        <div className="completed-badge">
          ✓ Interview Completed
        </div>

        <h1>
          Your Interview Report
        </h1>

        <p>
          A quick AI-powered summary of your interview
          performance.
        </p>

        <div className="report-role">

          <span>
            {interview?.targetRole || "Interview"}
          </span>

          {interview?.targetCompany && (
            <>
              <span className="role-divider">
                •
              </span>

              <span>
                {interview?.targetCompany}
              </span>
            </>
          )}

        </div>

      </header>


      {/* =====================================================
          Main Content
      ===================================================== */}

      <main className="report-container">

        {/* ===================================================
            Overall Result
        =================================================== */}

        <section className="overall-card">

          <div className="overall-score-section">

            <span className="section-label">
              Overall Score
            </span>

            <div className="overall-score">

              <strong>
                {overallScore}
              </strong>

              <span>
                /100
              </span>

            </div>

            <div className="score-progress">

              <div
                className="score-progress-fill"
                style={{
                  width: `${overallScore}%`,
                }}
              />

            </div>

          </div>


          <div className="hiring-section">

            <span className="section-label">
              AI Hiring Signal
            </span>

            <h2>
              {hiringSignal}
            </h2>

            <p>
              Based on your technical performance,
              communication, and overall interview quality.
            </p>

          </div>

        </section>


        {/* ===================================================
            Score Cards
        =================================================== */}

        <section className="score-grid">

          <div className="score-card">

            <div className="score-card-header">

              <span className="score-icon">
                ◈
              </span>

              <span>
                Technical
              </span>

            </div>

            <strong>
              {technicalScore}
            </strong>

            <span className="score-out-of">
              /100
            </span>

            <div className="mini-progress">

              <div
                style={{
                  width: `${technicalScore}%`,
                }}
              />

            </div>

          </div>


          <div className="score-card">

            <div className="score-card-header">

              <span className="score-icon">
                ◉
              </span>

              <span>
                Communication
              </span>

            </div>

            <strong>
              {communicationScore}
            </strong>

            <span className="score-out-of">
              /100
            </span>

            <div className="mini-progress">

              <div
                style={{
                  width: `${communicationScore}%`,
                }}
              />

            </div>

          </div>

        </section>


        {/* ===================================================
            AI Summary
        =================================================== */}

        <section className="summary-card">

          <div className="card-heading">

            <span className="heading-icon">
              ✦
            </span>

            <div>

              <h2>
                AI Summary
              </h2>

              <p>
                What your interviewer noticed
              </p>

            </div>

          </div>

          <p className="summary-text">
            {finalReport.finalFeedback || "Your AI interview report is ready."}
          </p>

        </section>


        {/* ===================================================
            Strengths + Improvements
        =================================================== */}

        <section className="insights-grid">

          <div className="insight-card">

            <div className="card-heading">

              <span className="heading-icon">
                ✓
              </span>

              <div>

                <h2>
                  Your Strengths
                </h2>

                <p>
                  What you did well
                </p>

              </div>

            </div>

            <ul>

              {strengths.map(
                (strength, index) => (

                  <li key={index}>
                    <span>✓</span>
                    {strength}
                  </li>

                )
              )}

            </ul>

          </div>


          <div className="insight-card">

            <div className="card-heading">

              <span className="heading-icon">
                ↑
              </span>

              <div>

                <h2>
                  Improve Next
                </h2>

                <p>
                  Focus areas for your next interview
                </p>

              </div>

            </div>

            <ul>

              {improvementItems.map(
                (item, index) => (

                  <li key={index}>
                    <span>→</span>
                    {item}
                  </li>

                )
              )}

            </ul>

          </div>

        </section>


        {/* ===================================================
            Quick Performance
        =================================================== */}

        <section className="performance-card">

          <div className="card-heading">

            <span className="heading-icon">
              ◌
            </span>

            <div>

              <h2>
                Interview Performance
              </h2>

              <p>
                A quick look at your interview habits
              </p>

            </div>

          </div>


          <div className="performance-grid">

            <div>

              <strong>
                {questionsAnswered}
              </strong>

              <span>
                Questions answered
              </span>

            </div>


            <div>

              <strong>
                {wordsPerMinute}
              </strong>

              <span>
                Words per minute
              </span>

            </div>


            <div>

              <strong>
                {cameraPresence}%
              </strong>

              <span>
                Camera presence
              </span>

            </div>

          </div>

        </section>


        {/* ===================================================
            AI Job Hunt CTA
        =================================================== */}

        <section className="job-hunt-card">

          <div className="job-hunt-content">

            <span className="job-hunt-badge">
              NEXT STEP
            </span>

            <h2>
              Ready to turn this interview
              into an opportunity?
            </h2>

            <p>
              Let Zyoro AI find jobs that match your
              resume, skills, and target role.
            </p>

          </div>

          <button
            type="button"
            className="job-hunt-button"
            onClick={handleJobHunt}
          >
            Explore AI Job Hunt
            <span>
              →
            </span>
          </button>

        </section>


        {/* ===================================================
            Bottom Action
        =================================================== */}

        <div className="report-bottom-action">

          <button
            type="button"
            onClick={handleBack}
            className="secondary-action"
          >
            Back to Interview Preparation
          </button>

        </div>

      </main>

    </div>
  );
}

export default InterviewReport;