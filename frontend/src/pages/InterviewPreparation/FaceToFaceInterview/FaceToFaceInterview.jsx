import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startFaceToFaceInterview } from "../../../services/auth.service";
import "./FaceToFaceInterview.css";

function FaceToFaceInterview() {

  const [resume, setResume] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    targetRole: "",
    targetCompany: "",
    experienceLevel: "",
    interviewType: "Technical",
    difficulty: "Adaptive",
    duration: "20",
    language: "English",
  });


  function handleChange(e) {

    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }


  function handleResumeChange(e) {

    const file = e.target.files[0];

    if (file) {
      setResume(file);
    }
  }


 async function handleStartInterview(e) {

  e.preventDefault();

  try {

    setError("");

    if (!resume) {
      setError("Please upload your resume.");
      return;
    }

    setLoading(true);

    const data = new FormData();

    data.append("resume", resume);
    data.append("targetRole", formData.targetRole);
    data.append("targetCompany", formData.targetCompany);
    data.append("experienceLevel", formData.experienceLevel);
    data.append("interviewType", formData.interviewType);
    data.append("difficulty", formData.difficulty);
    data.append("duration", formData.duration);
    data.append("language", formData.language);


    const response =
      await startFaceToFaceInterview(data);


    if (response.success) {
        navigate(
        `/interview/${response.interviewId}/setup`
         )
      
    }

  } catch (err) {

    console.log(err);

    setError(
      err.response?.data?.message ||
      "Unable to start interview."
    );

  } finally {

    setLoading(false);

  }
}

  return (

    <div className="face-interview-page">

      <div className="face-interview-container">

        {/* Header */}

        <div className="face-interview-header">

          <div className="face-interview-badge">
            AI INTERVIEW
          </div>

          <h1>
            Face-to-Face AI Interview
          </h1>

          <p>
            Practice a realistic interview tailored to your
            resume, experience and target role.
          </p>

        </div>


        {/* Main Card */}

        <form
          className="interview-setup-card"
          onSubmit={handleStartInterview}
        >

          <div className="setup-card-header">

            <div>
              <h2>Interview Setup</h2>

              <p>
                Tell Zyoro what kind of interview you want to practice.
              </p>
            </div>

            <span className="setup-step">
              Setup
            </span>

          </div>


          {/* Resume */}

          <div className="form-section">

            <div className="section-title">

              <span className="section-number">
                01
              </span>

              <div>
                <h3>Your Resume</h3>
                <p>
                  Your resume helps the AI ask questions about
                  your actual experience and projects.
                </p>
              </div>

            </div>


            <label
              className={`resume-upload ${
                resume ? "resume-selected" : ""
              }`}
            >

              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
              />


              <div className="upload-icon">
                ↑
              </div>


              {resume ? (

                <div className="upload-content">

                  <strong>
                    {resume.name}
                  </strong>

                  <span>
                    Resume selected successfully
                  </span>

                </div>

              ) : (

                <div className="upload-content">

                  <strong>
                    Upload your resume
                  </strong>

                  <span>
                    PDF format recommended
                  </span>

                </div>

              )}


              <div className="browse-button">
                {resume ? "Change" : "Browse"}
              </div>

            </label>

          </div>


          {/* Job Details */}

          <div className="form-section">

            <div className="section-title">

              <span className="section-number">
                02
              </span>

              <div>
                <h3>Target Position</h3>
                <p>
                  Choose the role and experience level you want
                  the interview to match.
                </p>
              </div>

            </div>


            <div className="form-grid">

              <div className="form-group">

                <label>
                  Target Role
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  placeholder="e.g. Backend Developer"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Target Company
                  <small> Optional</small>
                </label>

                <input
                  type="text"
                  name="targetCompany"
                  value={formData.targetCompany}
                  onChange={handleChange}
                  placeholder="e.g. Wipro"
                />

              </div>


              <div className="form-group">

                <label>
                  Experience Level
                  <span>*</span>
                </label>

                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select experience
                  </option>

                  <option value="Fresher">
                    Fresher
                  </option>

                  <option value="0-1 Year">
                    0 - 1 Year
                  </option>

                  <option value="1-2 Years">
                    1 - 2 Years
                  </option>

                  <option value="2-4 Years">
                    2 - 4 Years
                  </option>

                  <option value="4-7 Years">
                    4 - 7 Years
                  </option>

                  <option value="7+ Years">
                    7+ Years
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  Language
                </label>

                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                >

                  <option value="English">
                    English
                  </option>

                  <option value="Hindi">
                    Hindi
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* Interview Configuration */}

          <div className="form-section">

            <div className="section-title">

              <span className="section-number">
                03
              </span>

              <div>
                <h3>Interview Configuration</h3>
                <p>
                  Customize how your AI interview will be conducted.
                </p>
              </div>

            </div>


            {/* Interview Type */}

            <div className="option-block">

              <label className="option-title">
                Interview Type
              </label>


              <div className="option-grid three-options">

                {["Technical", "HR", "Mixed"].map((type) => (

                  <button
                    type="button"
                    key={type}
                    className={
                      formData.interviewType === type
                        ? "option-card active"
                        : "option-card"
                    }
                    onClick={() =>
                      setFormData({
                        ...formData,
                        interviewType: type,
                      })
                    }
                  >

                    <strong>
                      {type}
                    </strong>

                    <span>
                      {
                        type === "Technical"
                          ? "Skills & projects"
                          : type === "HR"
                          ? "Behavioral questions"
                          : "Technical + HR"
                      }
                    </span>

                  </button>

                ))}

              </div>

            </div>


            {/* Difficulty */}

            <div className="option-block">

              <label className="option-title">
                Difficulty
              </label>


              <div className="option-grid four-options">

                {[
                  ["Adaptive", "AI adjusts to you"],
                  ["Easy", "Fundamentals"],
                  ["Medium", "Practical depth"],
                  ["Hard", "Advanced"],
                ].map(([level, description]) => (

                  <button
                    type="button"
                    key={level}
                    className={
                      formData.difficulty === level
                        ? "option-card active"
                        : "option-card"
                    }
                    onClick={() =>
                      setFormData({
                        ...formData,
                        difficulty: level,
                      })
                    }
                  >

                    <strong>
                      {level}
                    </strong>

                    <span>
                      {description}
                    </span>

                  </button>

                ))}

              </div>

            </div>


            {/* Duration */}

            <div className="option-block">

              <label className="option-title">
                Interview Duration
              </label>


              <div className="duration-options">

                {["10", "20", "30"].map((time) => (

                  <button
                    type="button"
                    key={time}
                    className={
                      formData.duration === time
                        ? "duration-button active"
                        : "duration-button"
                    }
                    onClick={() =>
                      setFormData({
                        ...formData,
                        duration: time,
                      })
                    }
                  >

                    <strong>
                      {time}
                    </strong>

                    <span>min</span>

                  </button>

                ))}

              </div>

            </div>

          </div>


          {/* Start */}
          {error && (
            <div className="interview-error">
               {error}
            </div>
          )}

      <div className="start-interview-section"></div>

          <div className="start-interview-section">

            <div className="start-info">

              <span className="status-dot"></span>

              <p>
                Camera and microphone access will be requested
                before the interview begins.
              </p>

            </div>


            <button
                 type="submit"
                 className="start-interview-button"
                 disabled={loading}
              >
              {loading? "Preparing Interview..."
              : "Start AI Interview"}
               {!loading && <span>→</span>}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default FaceToFaceInterview;