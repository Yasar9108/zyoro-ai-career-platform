import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./InterviewSetup.css";

const LOG_TAG = "(DeviceSetup)=>";

function DeviceSetup() {

  const navigate = useNavigate();

  const { interviewId } = useParams();

  // ============================================================
  // Refs
  // ============================================================

  const videoRef = useRef(null);

  const streamRef = useRef(null);

  const audioContextRef = useRef(null);

  const analyserRef = useRef(null);

  const animationRef = useRef(null);

  /*
   * Prevents a late getUserMedia() response from
   * keeping the camera/microphone alive after leaving
   * this page.
   */
  const deviceCheckCancelledRef =
    useRef(false);

  // ============================================================
  // State
  // ============================================================

  const [cameraReady, setCameraReady] =
    useState(false);

  const [microphoneReady, setMicrophoneReady] =
    useState(false);

  const [instructionsAccepted, setInstructionsAccepted] =
    useState(false);

  const [checkingDevices, setCheckingDevices] =
    useState(true);

  const [cameraError, setCameraError] =
    useState("");

  const [microphoneError, setMicrophoneError] =
    useState("");

  const [audioLevel, setAudioLevel] =
    useState(0);

  const [startingInterview, setStartingInterview] =
    useState(false);

  // ============================================================
  // Stop Camera + Microphone
  // ============================================================

  function stopDevices() {

    console.debug(
      LOG_TAG,
      "Stopping camera and microphone..."
    );

    // ----------------------------------------------------------
    // Stop microphone animation
    // ----------------------------------------------------------

    if (animationRef.current) {

      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;

    }

    // ----------------------------------------------------------
    // Close AudioContext
    // ----------------------------------------------------------

    if (audioContextRef.current) {

      try {

        audioContextRef.current
          .close()
          .catch(() => {});

      } catch (err) {

        console.debug(
          LOG_TAG,
          "AudioContext cleanup error:",
          err
        );

      }

      audioContextRef.current =
        null;

    }

    analyserRef.current =
      null;

    // ----------------------------------------------------------
    // Stop every track from our stream
    // ----------------------------------------------------------

    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach((track) => {

          try {

            track.stop();

          } catch (err) {

            console.debug(
              LOG_TAG,
              "Track stop error:",
              err
            );

          }

        });

      streamRef.current =
        null;

    }

    // ----------------------------------------------------------
    // Also clean the video element
    // ----------------------------------------------------------

    if (videoRef.current) {

      const videoStream =
        videoRef.current.srcObject;

      if (videoStream) {

        videoStream
          .getTracks()
          .forEach((track) => {

            try {

              track.stop();

            } catch (err) {

              console.debug(
                LOG_TAG,
                "Video track stop error:",
                err
              );

            }

          });

      }

      try {

        videoRef.current.pause();

      } catch (err) {

        console.debug(
          LOG_TAG,
          "Video pause error:",
          err
        );

      }

      videoRef.current.srcObject =
        null;

    }

    // ----------------------------------------------------------
    // Reset UI
    // ----------------------------------------------------------

    setCameraReady(false);

    setMicrophoneReady(false);

    setAudioLevel(0);

    console.debug(
      LOG_TAG,
      "Camera and microphone stopped."
    );

  }

  // ============================================================
  // Microphone Test
  // ============================================================

  function startMicrophoneTest(stream) {

    try {

      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {

        return;

      }

      const audioContext =
        new AudioContext();

      audioContextRef.current =
        audioContext;

      const analyser =
        audioContext.createAnalyser();

      analyser.fftSize =
        256;

      analyserRef.current =
        analyser;

      const microphone =
        audioContext.createMediaStreamSource(
          stream
        );

      microphone.connect(
        analyser
      );

      const data =
        new Uint8Array(
          analyser.frequencyBinCount
        );

      function updateAudioLevel() {

        if (
          !analyserRef.current ||
          deviceCheckCancelledRef.current
        ) {

          return;

        }

        analyser.getByteFrequencyData(
          data
        );

        let total = 0;

        for (
          let i = 0;
          i < data.length;
          i++
        ) {

          total += data[i];

        }

        const average =
          data.length > 0
            ? total / data.length
            : 0;

        const level =
          Math.min(
            100,
            Math.round(
              average * 2
            )
          );

        setAudioLevel(
          level
        );

        animationRef.current =
          requestAnimationFrame(
            updateAudioLevel
          );

      }

      updateAudioLevel();

    } catch (err) {

      console.debug(
        LOG_TAG,
        "Microphone test error:",
        err
      );

    }

  }

  // ============================================================
  // Check Camera and Microphone
  // ============================================================

  async function checkDevices() {

    console.debug(
      LOG_TAG,
      "Entered into checkDevices: " +
        new Date().toISOString()
    );

    /*
     * This request is active.
     */
    deviceCheckCancelledRef.current =
      false;

    setCheckingDevices(true);

    setCameraReady(false);

    setMicrophoneReady(false);

    setCameraError("");

    setMicrophoneError("");

    try {

      // --------------------------------------------------------
      // Clean any previous stream first
      // --------------------------------------------------------

      stopDevices();

      // --------------------------------------------------------
      // Request camera + microphone
      // --------------------------------------------------------

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      // --------------------------------------------------------
      // IMPORTANT
      //
      // The page may have been unmounted while
      // getUserMedia() was waiting for permission.
      //
      // If that happened, immediately stop the newly
      // created stream so the camera light cannot remain on.
      // --------------------------------------------------------

      if (
        deviceCheckCancelledRef.current
      ) {

        console.debug(
          LOG_TAG,
          "Late device stream received. Stopping it."
        );

        stream
          .getTracks()
          .forEach((track) => {

            try {

              track.stop();

            } catch (err) {

              console.debug(
                LOG_TAG,
                "Late track stop error:",
                err
              );

            }

          });

        return;

      }

      // --------------------------------------------------------
      // Store stream
      // --------------------------------------------------------

      streamRef.current =
        stream;

      // --------------------------------------------------------
      // Camera
      // --------------------------------------------------------

      const videoTrack =
        stream.getVideoTracks()[0];

      if (videoTrack) {

        setCameraReady(true);

      } else {

        setCameraError(
          "Camera was not detected."
        );

      }

      // --------------------------------------------------------
      // Microphone
      // --------------------------------------------------------

      const audioTrack =
        stream.getAudioTracks()[0];

      if (audioTrack) {

        setMicrophoneReady(true);

        startMicrophoneTest(
          stream
        );

      } else {

        setMicrophoneError(
          "Microphone was not detected."
        );

      }

      // --------------------------------------------------------
      // Camera Preview
      // --------------------------------------------------------

      if (videoRef.current) {

        videoRef.current.srcObject =
          stream;

        try {

          await videoRef.current.play();

        } catch (playError) {

          console.debug(
            LOG_TAG,
            "Camera preview play error:",
            playError
          );

        }

      }

    } catch (err) {

      console.debug(
        LOG_TAG,
        "Device access error:",
        err
      );

      /*
       * If the component has already been cleaned up,
       * don't update the UI.
       */

      if (
        deviceCheckCancelledRef.current
      ) {

        return;

      }

      if (
        err.name === "NotAllowedError"
      ) {

        setCameraError(
          "Camera permission was denied."
        );

        setMicrophoneError(
          "Microphone permission was denied."
        );

      } else if (
        err.name === "NotFoundError"
      ) {

        setCameraError(
          "No camera was found."
        );

        setMicrophoneError(
          "No microphone was found."
        );

      } else if (
        err.name === "NotReadableError"
      ) {

        setCameraError(
          "Camera or microphone is being used by another application."
        );

        setMicrophoneError(
          "Camera or microphone is being used by another application."
        );

      } else {

        setCameraError(
          "Unable to access the camera."
        );

        setMicrophoneError(
          "Unable to access the microphone."
        );

      }

    } finally {

      if (
        !deviceCheckCancelledRef.current
      ) {

        setCheckingDevices(false);

      }

    }

    console.debug(
      LOG_TAG,
      "Exited from checkDevices: " +
        new Date().toISOString()
    );

  }

  // ============================================================
  // Check Devices When Page Opens
  // ============================================================

  useEffect(() => {

    deviceCheckCancelledRef.current =
      false;

    checkDevices();

    return () => {

      console.debug(
        LOG_TAG,
        "DeviceSetup cleanup started."
      );

      /*
       * Mark the current getUserMedia request as
       * cancelled BEFORE stopping the existing stream.
       */
      deviceCheckCancelledRef.current =
        true;

      stopDevices();

      console.debug(
        LOG_TAG,
        "DeviceSetup cleanup completed."
      );

    };

  }, []);

  // ============================================================
  // Start Interview
  // ============================================================

  function handleStartInterview() {

    if (
      !cameraReady ||
      !microphoneReady ||
      !instructionsAccepted ||
      startingInterview
    ) {

      return;

    }

    setStartingInterview(true);

    /*
     * Cancel any pending device operation.
     */
    deviceCheckCancelledRef.current =
      true;

    /*
     * IMPORTANT:
     * The setup stream must be completely released
     * before entering InterviewRoom.
     */
    stopDevices();

    navigate(
      `/interview-preparation/face-to-face/interview-room/${interviewId}`,
      {
        state: {
          deviceCheckCompleted: true,
        },
      }
    );

  }

  // ============================================================
  // Render
  // ============================================================

  return (

    <div className="device-setup-page">

      {/* ======================================================
          Header
      ====================================================== */}

      <header className="device-setup-header">

        <div>

          <span className="setup-brand">
            Zyoro AI
          </span>

          <h1>
            Get ready for your interview
          </h1>

          <p>
            Check your camera and microphone
            before starting your interview.
          </p>

        </div>

      </header>

      <main className="device-setup-container">

        {/* ======================================================
            Device Tests
        ====================================================== */}

        <section className="device-test-grid">

          {/* ====================================================
              Camera
          ==================================================== */}

          <div className="device-card">

            <div className="device-card-top">

              <div className="device-title">

                <span className="device-icon">
                  📷
                </span>

                <div>

                  <h2>
                    Camera
                  </h2>

                  <p>
                    Used for face and presentation analysis.
                  </p>

                </div>

              </div>

              <span
                className={
                  cameraReady
                    ? "status-badge ready"
                    : "status-badge"
                }
              >

                {cameraReady
                  ? "Ready"
                  : checkingDevices
                    ? "Checking..."
                    : "Not ready"}

              </span>

            </div>

            <div className="camera-preview">

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
              />

              {!cameraReady && (

                <div className="preview-message">

                  {checkingDevices
                    ? "Checking camera..."
                    : "Camera preview unavailable"}

                </div>

              )}

              {cameraReady && (

                <div className="camera-live">

                  <span></span>

                  Camera working

                </div>

              )}

            </div>

            {cameraError && (

              <p className="device-error">
                {cameraError}
              </p>

            )}

          </div>

          {/* ====================================================
              Microphone
          ==================================================== */}

          <div className="device-card">

            <div className="device-card-top">

              <div className="device-title">

                <span className="device-icon">
                  🎤
                </span>

                <div>

                  <h2>
                    Microphone
                  </h2>

                  <p>
                    Used for answering questions.
                  </p>

                </div>

              </div>

              <span
                className={
                  microphoneReady
                    ? "status-badge ready"
                    : "status-badge"
                }
              >

                {microphoneReady
                  ? "Ready"
                  : checkingDevices
                    ? "Checking..."
                    : "Not ready"}

              </span>

            </div>

            <div className="microphone-test">

              <div className="microphone-icon">
                🎤
              </div>

              <h3>

                {microphoneReady
                  ? "Microphone detected"
                  : "Checking microphone..."}

              </h3>

              <p>

                {microphoneReady
                  ? "Say something to test your microphone."
                  : "Allow microphone access when asked."}

              </p>

              <div className="audio-meter">

                <div
                  className="audio-meter-level"
                  style={{
                    width: `${audioLevel}%`,
                  }}
                ></div>

              </div>

              <span className="audio-status">

                {audioLevel > 10
                  ? "Voice detected"
                  : "Waiting for your voice..."}

              </span>

            </div>

            {microphoneError && (

              <p className="device-error">
                {microphoneError}
              </p>

            )}

          </div>

        </section>

        {/* ======================================================
            Retry
        ====================================================== */}

        {(
          !cameraReady ||
          !microphoneReady
        ) &&
          !checkingDevices && (

            <button
              type="button"
              className="retry-button"
              onClick={checkDevices}
            >
              Try Again
            </button>

          )}

        {/* ======================================================
            Instructions
        ====================================================== */}

        <section className="instructions-card">

          <div className="instructions-title">

            <span>
              📋
            </span>

            <div>

              <h2>
                Before you begin
              </h2>

              <p>
                Follow these simple tips for the best interview.
              </p>

            </div>

          </div>

          <div className="instructions-list">

            <div className="instruction">

              <span>
                01
              </span>

              <div>

                <strong>
                  Find a quiet place
                </strong>

                <p>
                  Avoid unnecessary background noise.
                </p>

              </div>

            </div>

            <div className="instruction">

              <span>
                02
              </span>

              <div>

                <strong>
                  Keep your face visible
                </strong>

                <p>
                  Make sure your face remains clearly visible.
                </p>

              </div>

            </div>

            <div className="instruction">

              <span>
                03
              </span>

              <div>

                <strong>
                  Look at the camera
                </strong>

                <p>
                  Maintain natural eye contact while answering.
                </p>

              </div>

            </div>

            <div className="instruction">

              <span>
                04
              </span>

              <div>

                <strong>
                  Speak clearly
                </strong>

                <p>
                  Answer naturally and take your time.
                </p>

              </div>

            </div>

            <div className="instruction">

              <span>
                05
              </span>

              <div>

                <strong>
                  Stay on the interview page
                </strong>

                <p>
                  Avoid switching tabs during the interview.
                </p>

              </div>

            </div>

            <div className="instruction">

              <span>
                06
              </span>

              <div>

                <strong>
                  Be yourself
                </strong>

                <p>
                  Give honest and natural answers.
                </p>

              </div>

            </div>

          </div>

          {/* ====================================================
              Confirmation
          ==================================================== */}

          <label className="instruction-check">

            <input
              type="checkbox"
              checked={
                instructionsAccepted
              }
              onChange={(event) =>
                setInstructionsAccepted(
                  event.target.checked
                )
              }
            />

            <span>
              I have checked my camera and microphone
              and I'm ready to begin.
            </span>

          </label>

        </section>

        {/* ======================================================
            Start Interview
        ====================================================== */}

        <section className="start-section">

          <div className="ready-summary">

            <span
              className={
                cameraReady
                  ? "ready-item active"
                  : "ready-item"
              }
            >

              {cameraReady
                ? "✓"
                : "○"}

              Camera

            </span>

            <span
              className={
                microphoneReady
                  ? "ready-item active"
                  : "ready-item"
              }
            >

              {microphoneReady
                ? "✓"
                : "○"}

              Microphone

            </span>

            <span
              className={
                instructionsAccepted
                  ? "ready-item active"
                  : "ready-item"
              }
            >

              {instructionsAccepted
                ? "✓"
                : "○"}

              Ready

            </span>

          </div>

          <button
            type="button"
            className="start-interview-button"
            onClick={
              handleStartInterview
            }
            disabled={
              checkingDevices ||
              !cameraReady ||
              !microphoneReady ||
              !instructionsAccepted ||
              startingInterview
            }
          >

            {startingInterview
              ? "Starting..."
              : "I'm Ready — Start Interview"}

            {!startingInterview && (

              <span>
                →
              </span>

            )}

          </button>

          <p className="privacy-note">
            Your camera and microphone are used
            only during the interview.
          </p>

        </section>

      </main>

    </div>

  );

}

export default DeviceSetup;