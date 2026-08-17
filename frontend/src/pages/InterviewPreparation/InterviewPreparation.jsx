import "./InterviewPreparation.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InterviewPreparation.css";

/**
 * InterviewPreparation
 * ---------------------
 * Mode-selection screen for ZyoroAI's Interview Prep module.
 *
 * Renders one card per practice mode:
 *   1. Face-to-Face Interview  -> webcam + expression analysis
 *   2. Live Coding with AI     -> real-time coding round
 *   3. Coming Soon             -> locked placeholder for future modes
 *
 * Clicking a card's button navigates to /interview-preparation/<mode-id>
 * (e.g. /interview-preparation/face-to-face) using React Router.
 *
 * Usage:
 *   <InterviewPreparation />
 *
 * If you ever need custom routing logic instead of the default
 * navigate() call, pass `onSelectMode={(id) => ...}` and it will be
 * used instead.
 */

// All the copy + config lives in one place so you can edit it
// without touching any JSX/markup below.
const MODES = [
  {
    id: "face-to-face",
    tag: "Live · Camera",
    title: "Face-to-Face Interview",
    description:
      "Talk to the AI interviewer on camera. It reads your tone, pace and expression while you answer, just like a real panel would.",
    points: [
      "Real-time expression feedback",
      "Voice tone & pace analysis",
      "Camera + mic required",
    ],
    cta: "Start face-to-face",
    variant: "camera",
  },
  {
    id: "live-coding",
    tag: "Live · Editor",
    title: "Live Coding with AI",
    description:
      "Solve a real problem in a live editor while the AI watches your approach, not just your final answer, and asks follow-ups as you go.",
    points: [
      "Streams your thought process",
      "Follow-up questions mid-solve",
      "Runs right in your browser",
    ],
    cta: "Start coding round",
    variant: "editor",
  },
  {
    id: "coming-soon",
    tag: "In the lab",
    title: "More rounds coming soon",
    description:
      "Group discussions, HR rounds and aptitude tests are next up. Vote on what you want first inside the community tab.",
    points: [],
    cta: "Notify me",
    variant: "locked",
  },
];

export default function InterviewPreparation({ onSelectMode }) {
  const navigate = useNavigate();

  // Tracks which card was last launched, purely for a visual "active" state.
  const [activeId, setActiveId] = useState(null);

  const handleStart = (mode) => {
    if (mode.variant === "locked") return;

    setActiveId(mode.id);

    if (typeof onSelectMode === "function") {
      // Let the parent decide how navigation works, if it wants to.
      onSelectMode(mode.id);
    } else {
      // Default behavior: go to /interview-preparation/<mode-id>
      // e.g. clicking "Start face-to-face" -> /interview-preparation/face-to-face
      navigate(`/interview-preparation/${mode.id}`);
    }
  };

  return (
    <section className="ip-page">
      {/* ---------------- Header ---------------- */}
      <header className="ip-header">
        <span className="ip-eyebrow">ZyoroAI · Interview Prep</span>
        <h1 className="ip-title">Practice like it&apos;s the real thing</h1>
        <p className="ip-subtitle">
          Pick a round below. The AI interviewer adapts to how you speak, type and think.
        </p>
        <div className="ip-live-pill">
          <span className="ip-live-dot" aria-hidden="true" />
          AI interviewer online
        </div>
      </header>

      {/* ---------------- Mode cards ---------------- */}
      <div className="ip-grid">
        {MODES.map((mode) => (
          <article
            key={mode.id}
            className={
              "ip-card ip-card--" +
              mode.variant +
              (activeId === mode.id ? " is-active" : "")
            }
          >
            {/* Decorative frame — changes per mode so each card reads
                instantly: a camera viewfinder, an editor tab bar, or a
                locked outline. Purely visual, hidden from screen readers. */}
            <div className="ip-card-frame" aria-hidden="true">
              {mode.variant === "camera" && (
                <>
                  <span className="ip-corner ip-corner--tl" />
                  <span className="ip-corner ip-corner--tr" />
                  <span className="ip-corner ip-corner--bl" />
                  <span className="ip-corner ip-corner--br" />
                </>
              )}

              {mode.variant === "editor" && (
                <div className="ip-tabbar">
                  <span className="ip-tabdot" />
                  <span className="ip-tabdot" />
                  <span className="ip-tabdot" />
                </div>
              )}

              {mode.variant === "locked" && <div className="ip-lock-outline" />}
            </div>

            <span className="ip-card-tag">{mode.tag}</span>
            <h2 className="ip-card-title">{mode.title}</h2>
            <p className="ip-card-description">{mode.description}</p>

            {mode.points.length > 0 && (
              <ul className="ip-card-points">
                {mode.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="ip-card-cta"
              onClick={() => handleStart(mode)}
              disabled={mode.variant === "locked"}
            >
              {mode.cta}
              {mode.variant !== "locked" && (
                <svg
                  className="ip-cta-arrow"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}