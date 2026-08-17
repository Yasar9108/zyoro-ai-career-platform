import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getFaceToFaceInterview,
  submitInterviewAnswer,
  endFaceToFaceInterview,
} from "../../../services/auth.service";

import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

import "./InterviewRoom.css";


// ============================================================
// Constants
// ============================================================

const SILENCE_TO_SUBMIT_MS = 3000;

const LONG_PAUSE_MS = 1500;

const CLOSING_MESSAGE_SECONDS = 60;


// ============================================================
// Voice Selection — pick the most natural available voice
// ============================================================

let cachedVoice = null;

function getPreferredVoice() {
  if (cachedVoice) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();

  if (!voices.length) return null;

  // Priority order: best-sounding voices first (varies by OS/browser)
  const preferredNames = [
    "Google US English",
    "Microsoft Aria Online (Natural) - English (United States)",
    "Microsoft Jenny Online (Natural) - English (United States)",
    "Microsoft Guy Online (Natural) - English (United States)",
    "Samantha", // macOS
    "Google UK English Female",
  ];

  for (const name of preferredNames) {
    const match = voices.find((v) => v.name === name);
    if (match) {
      cachedVoice = match;
      return match;
    }
  }

  // Fallback: any English voice that isn't a "compact"/robotic one
  const fallback =
    voices.find(
      (v) => v.lang === "en-US" && !v.name.toLowerCase().includes("compact")
    ) || voices.find((v) => v.lang.startsWith("en"));

  cachedVoice = fallback || voices[0];
  return cachedVoice;
}

// Make sure voices are loaded (Chrome loads them async)
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    getPreferredVoice();
  };
}


// ============================================================
// Natural speech — splits into sentences, adds pacing/pauses
// ============================================================

function speakNaturally(text, { onStart, onEnd, onError } = {}) {
  if (!text) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.?!])\s+/)
    .filter((s) => s.trim());

  const voice = getPreferredVoice();

  let index = 0;
  let started = false;

  function speakNext() {
    if (index >= sentences.length) {
      if (onEnd) onEnd();
      return;
    }

    const sentence = sentences[index];
    index++;

    const utterance = new SpeechSynthesisUtterance(sentence);

    if (voice) utterance.voice = voice;

    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.02;
    utterance.volume = 1;

    utterance.onstart = () => {
      if (!started) {
        started = true;
        if (onStart) onStart();
      }
    };

    utterance.onend = () => {
      // small natural pause between sentences (150-280ms, slightly randomized)
      const pause = 150 + Math.random() * 130;
      setTimeout(speakNext, pause);
    };

    utterance.onerror = () => {
      if (onError) onError();
      speakNext();
    };

    window.speechSynthesis.speak(utterance);
  }

  speakNext();
}


// ============================================================
// Interview Room
// ============================================================

function InterviewRoom() {

  // ============================================================
  // Router
  // ============================================================

  const {
    interviewId,
  } = useParams();

  const location =
    useLocation();

  const navigate =
    useNavigate();


  // ============================================================
  // Device Setup
  // ============================================================

  /*
   * DeviceSetup sends this state when the user clicks:
   *
   * "I'm Ready — Start Interview"
   *
   * If the page is refreshed, React Router state disappears.
   *
   * Therefore a refresh will NOT automatically restart
   * the interview.
   */

  const deviceSetupCompleted =
    location.state?.deviceCheckCompleted === true;


  // ============================================================
  // DOM Refs
  // ============================================================

  const videoRef =
    useRef(null);


  // ============================================================
  // Media Refs
  // ============================================================

  const cameraStreamRef =
    useRef(null);

  const recognitionRef =
    useRef(null);

  const silenceTimerRef =
    useRef(null);


  // ============================================================
  // AI / Speech Refs
  // ============================================================

  const transcriptRef =
    useRef("");

  const answerStartTimeRef =
    useRef(null);

  const lastSpeechTimeRef =
    useRef(null);


  // ============================================================
  // Interview Refs
  // ============================================================

  const interviewStartedRef =
    useRef(false);

  const interviewEndedRef =
    useRef(false);

  const submittingRef =
    useRef(false);

  const endingInterviewRef =
    useRef(false);

  const answerSubmissionPromiseRef =
    useRef(null);

  const timerExpiredRef =
    useRef(false);

  const closingMessageStartedRef =
    useRef(false);

  const sessionStorageKeyRef =
    useRef(null);


  // ============================================================
  // Face Detection Refs
  // ============================================================

  const faceLandmarkerRef =
    useRef(null);

  const faceAnimationRef =
    useRef(null);


  // ============================================================
  // Answer Count
  // ============================================================

  const answeredQuestionsRef =
    useRef(0);


  // ============================================================
  // Speaking Analytics
  // ============================================================

  const speechMetricsRef =
    useRef({

      totalAnswers: 0,

      totalWords: 0,

      totalFillerWords: 0,

      totalSpeakingSeconds: 0,

      longPauseCount: 0,

      fillerWords: {},

    });


  // ============================================================
  // Presentation Analytics
  // ============================================================

  const presentationRef =
    useRef({

      totalFrames: 0,

      faceDetectedFrames: 0,

      lookingAtCameraFrames: 0,

      faceMissingCount: 0,

      lookingAwayCount: 0,

      wasFaceDetected: false,

      wasLookingAtCamera: false,

    });


  // ============================================================
  // Interview Data
  // ============================================================

  const [
    question,
    setQuestion,
  ] = useState("");

  const [
    introMessage,
    setIntroMessage,
  ] = useState("");

  const [
    difficulty,
    setDifficulty,
  ] = useState("");

  const [
    duration,
    setDuration,
  ] = useState(20);


  // ============================================================
  // Page State
  // ============================================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ============================================================
  // Interview State
  // ============================================================

  const [
    interviewStarted,
    setInterviewStarted,
  ] = useState(false);

  const [
    isInterviewEnded,
    setIsInterviewEnded,
  ] = useState(false);

  const [
    answeredQuestions,
    setAnsweredQuestions,
  ] = useState(0);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isEndingInterview,
    setIsEndingInterview,
  ] = useState(false);


  // ============================================================
  // AI State
  // ============================================================

  const [
    isAiSpeaking,
    setIsAiSpeaking,
  ] = useState(false);


  // ============================================================
  // Speech State
  // ============================================================

  const [
    isListening,
    setIsListening,
  ] = useState(false);

  const [
    transcript,
    setTranscript,
  ] = useState("");


  // ============================================================
  // Camera State
  // ============================================================

  const [
    cameraStarted,
    setCameraStarted,
  ] = useState(false);

  const [
    cameraError,
    setCameraError,
  ] = useState("");


  // ============================================================
  // Face Tracking
  // ============================================================

  const [
    faceTrackingReady,
    setFaceTrackingReady,
  ] = useState(false);

  const [
    faceDetected,
    setFaceDetected,
  ] = useState(false);

  const [
    lookingAtCamera,
    setLookingAtCamera,
  ] = useState(false);


  // ============================================================
  // Timer
  // ============================================================

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(null);


  // ============================================================
  // End Interview Confirmation
  // ============================================================

  const [
    showEndConfirmPopup,
    setShowEndConfirmPopup,
  ] = useState(false);


  // ============================================================
  // Keep Interview State in Refs
  // ============================================================

  useEffect(() => {

    interviewStartedRef.current =
      interviewStarted;

  }, [
    interviewStarted,
  ]);


  useEffect(() => {

    interviewEndedRef.current =
      isInterviewEnded;

  }, [
    isInterviewEnded,
  ]);


  // ============================================================
  // Fetch Interview
  // ============================================================

  useEffect(() => {

    async function fetchInterview() {

      try {

        setLoading(true);

        setError("");


        const response =
          await getFaceToFaceInterview(
            interviewId
          );


        if (!response.success) {

          throw new Error(
            response.message ||
            "Unable to load interview."
          );

        }


        const interview =
          response.interview;


        // ------------------------------------------------------
        // Already completed
        // ------------------------------------------------------

        if (
          interview.status === "Completed" ||
          interview.status === "completed" ||
          interview.isCompleted === true ||
          interview.completedAt
        ) {

          setIsInterviewEnded(true);

          return;

        }


        // ------------------------------------------------------
        // Interview information
        // ------------------------------------------------------

        setDifficulty(
          interview.currentDifficulty ||
          interview.difficulty ||
          "Medium"
        );


        setDuration(
          Number(interview.duration) || 20
        );


        setIntroMessage(
          interview.introMessage || ""
        );


        // ------------------------------------------------------
        // Conversations
        // ------------------------------------------------------

        const conversations =
          interview.conversations || [];


        const answeredCount =
          conversations.filter(
            (conversation) =>
              conversation.answer &&
              conversation.answer.trim()
          ).length;


        answeredQuestionsRef.current =
          answeredCount;


        setAnsweredQuestions(
          answeredCount
        );


        // ------------------------------------------------------
        // Current question
        // ------------------------------------------------------

        if (
          conversations.length > 0
        ) {

          const latestConversation =
            conversations[
              conversations.length - 1
            ];


          setQuestion(
            latestConversation.question || ""
          );

        }


        // ------------------------------------------------------
        // Timer storage
        // ------------------------------------------------------

        const storageKey =
          `zyoro_interview_${interviewId}`;


        sessionStorageKeyRef.current =
          storageKey;


        try {

          const savedProgress =
            JSON.parse(
              sessionStorage.getItem(
                storageKey
              ) || "null"
            );


          if (
            savedProgress &&
            Number.isFinite(
              savedProgress.remainingSeconds
            )
          ) {

            setRemainingSeconds(
              Math.max(
                0,
                savedProgress.remainingSeconds
              )
            );

          }

        } catch (storageError) {

          console.log(
            "Timer restore error:",
            storageError
          );

        }

      } catch (err) {

        console.log(
          "Fetch interview error:",
          err
        );


        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to load interview."
        );

      } finally {

        setLoading(false);

      }

    }


    if (
      interviewId
    ) {

      fetchInterview();

    }

  }, [
    interviewId,
  ]);


  // ============================================================
  // Start Camera + Microphone
  // ============================================================

  useEffect(() => {

    if (
      !deviceSetupCompleted ||
      isInterviewEnded
    ) {

      return;

    }


    let cancelled = false;

    let startupTimeout = null;


    async function startMedia() {

      try {

        setCameraError("");

        setCameraStarted(false);


        /*
         * DeviceSetup has already tested the devices.
         *
         * We request the actual InterviewRoom stream here.
         *
         * A short delay gives Chrome enough time to release
         * the DeviceSetup stream before requesting the devices
         * again.
         */

        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });


        if (cancelled) {
          return;
        }


        console.log(
          "InterviewRoom: requesting camera and microphone..."
        );


        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {

          throw new Error(
            "Camera and microphone access is not supported by this browser."
          );

        }


        const stream =
          await navigator.mediaDevices.getUserMedia({

            video: true,

            audio: true,

          });


        if (cancelled) {

          stream
            .getTracks()
            .forEach((track) => {

              try {
                track.stop();
              } catch (err) {
                console.debug(
                  "InterviewRoom",
                  "Unable to stop cancelled track:",
                  err
                );
              }

            });

          return;

        }


        console.log(
          "InterviewRoom: camera and microphone acquired."
        );


        cameraStreamRef.current =
          stream;


        if (!videoRef.current) {

          stream
            .getTracks()
            .forEach((track) => {

              try {
                track.stop();
              } catch (err) {
                console.debug(
                  "InterviewRoom",
                  "Unable to stop unused track:",
                  err
                );
              }

            });

          cameraStreamRef.current = null;

          throw new Error(
            "Interview camera element is not ready."
          );

        }


        videoRef.current.srcObject =
          stream;


        try {

          await videoRef.current.play();

        } catch (playError) {

          console.debug(
            "InterviewRoom",
            "Video autoplay was blocked:",
            playError
          );

        }


        if (!cancelled) {

          setCameraStarted(true);

          console.log(
            "InterviewRoom: camera started successfully."
          );

        }

      } catch (err) {

        console.error(
          "InterviewRoom: camera/microphone error:",
          err
        );


        if (cancelled) {
          return;
        }


        setCameraStarted(false);


        if (
          err?.name === "NotAllowedError"
        ) {

          setCameraError(
            "Camera or microphone permission was denied. Please allow access in your browser."
          );

        } else if (
          err?.name === "NotFoundError"
        ) {

          setCameraError(
            "Camera or microphone was not found."
          );

        } else if (
          err?.name === "NotReadableError"
        ) {

          setCameraError(
            "Camera or microphone is currently being used by another application."
          );

        } else {

          setCameraError(
            err?.message ||
            "Unable to start camera and microphone."
          );

        }

      }

    }


    startupTimeout =
      setTimeout(() => {

        if (
          !cancelled &&
          !cameraStreamRef.current
        ) {

          console.error(
            "InterviewRoom: media startup timed out."
          );


          setCameraError(
            "Camera is taking too long to start. Please check your camera permissions and try again."
          );

        }

      }, 10000);


    startMedia();


    return () => {

      cancelled = true;


      if (startupTimeout) {

        clearTimeout(
          startupTimeout
        );

        startupTimeout = null;

      }


      stopMedia();

    };

  }, [
    deviceSetupCompleted,
    isInterviewEnded,
  ]);


  // ============================================================
  // Stop Camera + Microphone
  // ============================================================

  function stopMedia() {
  console.debug(
    "InterviewRoom",
    "Stopping all camera and microphone tracks..."
  );

  // ----------------------------------------------------------
  // Stop stream stored in our ref
  // ----------------------------------------------------------

  if (cameraStreamRef.current) {
    cameraStreamRef.current
      .getTracks()
      .forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          console.debug(
            "InterviewRoom",
            "Track stop error:",
            err
          );
        }
      });

    cameraStreamRef.current = null;
  }

  // ----------------------------------------------------------
  // Also stop tracks attached directly to the video element
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
              "InterviewRoom",
              "Video track stop error:",
              err
            );
          }
        });
    }

    videoRef.current.pause();
    videoRef.current.srcObject = null;
  }

  // ----------------------------------------------------------
  // Update UI
  // ----------------------------------------------------------

  setCameraStarted(false);

  setFaceDetected(false);
  setLookingAtCamera(false);

  console.debug(
    "InterviewRoom",
    "All camera and microphone tracks stopped."
  );
}
  // ============================================================
  // Initialize Face Detection
  // ============================================================

  useEffect(() => {

    if (
      !deviceSetupCompleted
    ) {

      return;

    }


    let cancelled =
      false;


    async function initializeFaceDetection() {

      try {

        const vision =
          await FilesetResolver
            .forVisionTasks(
              "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
            );


        const faceLandmarker =
          await FaceLandmarker
            .createFromOptions(
              vision,
              {

                baseOptions: {

                  modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",

                },

                runningMode:
                  "VIDEO",

                numFaces: 1,

              }
            );


        if (
          cancelled
        ) {

          faceLandmarker.close();

          return;

        }


        faceLandmarkerRef.current =
          faceLandmarker;


        setFaceTrackingReady(
          true
        );


        console.log(
          "Face detection ready."
        );

      } catch (err) {

        console.log(
          "Face detection initialization error:",
          err
        );


        setFaceTrackingReady(
          false
        );

      }

    }


    initializeFaceDetection();


    return () => {

      cancelled = true;


      if (
        faceLandmarkerRef.current
      ) {

        faceLandmarkerRef.current.close();

        faceLandmarkerRef.current =
          null;

      }


      setFaceTrackingReady(
        false
      );

    };

  }, [
    deviceSetupCompleted,
  ]);


  // ============================================================
  // Face Detection + Gaze Tracking
  // ============================================================

  useEffect(() => {

    if (
      !interviewStarted ||
      !cameraStarted ||
      !faceTrackingReady ||
      isInterviewEnded
    ) {

      return;

    }


    let lastVideoTime =
      -1;


    function detectFace() {

      const video =
        videoRef.current;


      const faceLandmarker =
        faceLandmarkerRef.current;


      if (
        video &&
        faceLandmarker &&
        video.readyState >= 2
      ) {

        if (
          video.currentTime !==
          lastVideoTime
        ) {

          lastVideoTime =
            video.currentTime;


          try {

            const result =
              faceLandmarker
                .detectForVideo(
                  video,
                  performance.now()
                );


            const detected =
              !!(
                result.faceLandmarks &&
                result.faceLandmarks.length
              );


            setFaceDetected(
              detected
            );


            const analytics =
              presentationRef.current;


            analytics.totalFrames++;


            if (
              detected
            ) {

              analytics.faceDetectedFrames++;


              const landmarks =
                result.faceLandmarks[0];


              const nose =
                landmarks[1];

              const leftFace =
                landmarks[234];

              const rightFace =
                landmarks[454];


              const faceCenterX =
                (
                  leftFace.x +
                  rightFace.x
                ) / 2;


              const headOffset =
                Math.abs(
                  nose.x -
                  faceCenterX
                );


              const facingCamera =
                headOffset < 0.035;


              setLookingAtCamera(
                facingCamera
              );


              if (
                facingCamera
              ) {

                analytics
                  .lookingAtCameraFrames++;

              }


              if (
                !facingCamera &&
                analytics.wasLookingAtCamera
              ) {

                analytics
                  .lookingAwayCount++;

              }


              analytics.wasLookingAtCamera =
                facingCamera;

            } else {

              setLookingAtCamera(
                false
              );


              if (
                analytics.wasFaceDetected
              ) {

                analytics
                  .faceMissingCount++;

              }


              analytics.wasLookingAtCamera =
                false;

            }


            analytics.wasFaceDetected =
              detected;

          } catch (err) {

            console.log(
              "Face detection error:",
              err
            );

          }

        }

      }


      faceAnimationRef.current =
        requestAnimationFrame(
          detectFace
        );

    }


    detectFace();


    return () => {

      if (
        faceAnimationRef.current
      ) {

        cancelAnimationFrame(
          faceAnimationRef.current
        );


        faceAnimationRef.current =
          null;

      }

    };

  }, [
    interviewStarted,
    cameraStarted,
    faceTrackingReady,
    isInterviewEnded,
  ]);


  // ============================================================
  // Speak AI Text
  // ============================================================

  function speakText(
    text,
    onComplete
  ) {

    speakNaturally(
      text,
      {
        onStart: () => {

          setIsAiSpeaking(
            true
          );

          setIsListening(
            false
          );

        },

        onEnd: () => {

          setIsAiSpeaking(
            false
          );


          if (
            onComplete &&
            !interviewEndedRef.current &&
            !endingInterviewRef.current
          ) {

            onComplete();

          }

        },

        onError: () => {

          setIsAiSpeaking(
            false
          );

        },

      }
    );

  }


  // ============================================================
  // Speak Question
  // ============================================================

  function speakQuestion(
    questionText
  ) {

    if (
      !questionText ||
      interviewEndedRef.current ||
      endingInterviewRef.current
    ) {

      return;

    }


    if (
      recognitionRef.current
    ) {

      try {

        recognitionRef.current.stop();

      } catch (err) {

        console.log(err);

      }

    }


    speakNaturally(
      questionText,
      {
        onStart: () => {

          setIsAiSpeaking(
            true
          );

          setIsListening(
            false
          );

        },

        onEnd: () => {

          if (
            interviewEndedRef.current ||
            endingInterviewRef.current
          ) {

            return;

          }


          setIsAiSpeaking(
            false
          );


          startListening();

        },

        onError: () => {

          setIsAiSpeaking(
            false
          );

        },

      }
    );

  }


  // ============================================================
  // Start Actual Interview
  // ============================================================

  useEffect(() => {

    if (
      !deviceSetupCompleted ||
      loading ||
      !question ||
      !cameraStarted ||
      interviewStarted ||
      isInterviewEnded
    ) {

      return;

    }


    /*
     * Important:
     *
     * The interview starts only after:
     *
     * DeviceSetup
     *      ↓
     * Camera + microphone available
     *      ↓
     * InterviewRoom
     *      ↓
     * AI introduction
     *      ↓
     * Question
     */

    setInterviewStarted(
      true
    );


    interviewStartedRef.current =
      true;


    const storageKey =
      sessionStorageKeyRef.current ||
      `zyoro_interview_${interviewId}`;


    sessionStorageKeyRef.current =
      storageKey;


    let savedProgress =
      null;


    try {

      savedProgress =
        JSON.parse(
          sessionStorage.getItem(
            storageKey
          ) || "null"
        );

    } catch (err) {

      console.log(
        "Timer restore error:",
        err
      );

    }


    if (
      savedProgress &&
      Number.isFinite(
        savedProgress.remainingSeconds
      ) &&
      savedProgress.remainingSeconds > 0
    ) {

      setRemainingSeconds(
        savedProgress.remainingSeconds
      );


      /*
       * Explicit DeviceSetup completion means the user
       * intentionally entered the interview again.
       *
       * Continue with the current question.
       */

      speakQuestion(
        question
      );


      return;

    }


    // ----------------------------------------------------------
    // New interview
    // ----------------------------------------------------------

    const totalSeconds =
      Number(duration) * 60;


    setRemainingSeconds(
      totalSeconds
    );


    if (
      introMessage
    ) {

      speakText(
        introMessage,
        () => {

          speakQuestion(
            question
          );

        }
      );

    } else {

      speakQuestion(
        question
      );

    }

  }, [
    deviceSetupCompleted,
    loading,
    question,
    cameraStarted,
    interviewStarted,
    isInterviewEnded,
    duration,
    introMessage,
    interviewId,
  ]);


  // ============================================================
  // Start / Persist Timer
  // ============================================================

  useEffect(() => {

    if (
      !interviewStarted ||
      remainingSeconds === null ||
      isInterviewEnded
    ) {

      return;

    }


    const storageKey =
      sessionStorageKeyRef.current ||
      `zyoro_interview_${interviewId}`;


    sessionStorageKeyRef.current =
      storageKey;


    try {

      sessionStorage.setItem(
        storageKey,
        JSON.stringify({

          started: true,

          remainingSeconds,

          savedAt: Date.now(),

        })
      );

    } catch (err) {

      console.log(
        "Timer save error:",
        err
      );

    }

  }, [
    interviewStarted,
    remainingSeconds,
    isInterviewEnded,
    interviewId,
  ]);


  // ============================================================
  // Countdown Timer
  // ============================================================

  useEffect(() => {

    if (
      !interviewStarted ||
      isInterviewEnded ||
      remainingSeconds === null
    ) {

      return;

    }


    const timer =
      setInterval(() => {

        setRemainingSeconds(
          (previousSeconds) => {

            if (
              previousSeconds === null
            ) {

              return null;

            }


            if (
              previousSeconds <= 1
            ) {

              clearInterval(
                timer
              );


              return 0;

            }


            const nextSeconds =
              previousSeconds - 1;


            if (
              nextSeconds ===
                CLOSING_MESSAGE_SECONDS &&
              !closingMessageStartedRef.current
            ) {

              closingMessageStartedRef.current =
                true;


              speakClosingMessage();

            }


            return nextSeconds;

          }
        );

      }, 1000);


    return () => {

      clearInterval(
        timer
      );

    };

  }, [
    interviewStarted,
    isInterviewEnded,
  ]);


  // ============================================================
  // Timer Expired
  // ============================================================

  useEffect(() => {

    if (
      !interviewStarted ||
      isInterviewEnded ||
      remainingSeconds !== 0
    ) {

      return;

    }


    timerExpiredRef.current =
      true;


    /*
     * If an answer is currently being submitted,
     * the submission flow will finish the interview.
     */

    if (
      submittingRef.current
    ) {

      return;

    }


    /*
     * If the candidate is speaking and has transcript,
     * submit that answer first.
     */

    if (
      isListening &&
      transcriptRef.current.trim()
    ) {

      stopAndSubmitAnswer();

      return;

    }


    /*
     * Backend requires at least one answered question.
     */

    if (
      answeredQuestionsRef.current > 0
    ) {

      handleEndInterview(
        true
      );

    }

  }, [
    remainingSeconds,
    interviewStarted,
    isInterviewEnded,
    isListening,
  ]);


  // ============================================================
  // Start Listening
  // ============================================================

  function startListening() {

    if (
      !cameraStarted ||
      !interviewStartedRef.current ||
      interviewEndedRef.current ||
      endingInterviewRef.current ||
      submittingRef.current
    ) {

      return;

    }


    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (
      !SpeechRecognition
    ) {

      setError(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );

      return;

    }


    if (
      recognitionRef.current
    ) {

      try {

        recognitionRef.current.stop();

      } catch (err) {

        console.log(err);

      }

    }


    setTranscript("");

    transcriptRef.current =
      "";


    const recognition =
      new SpeechRecognition();


    recognition.continuous =
      true;

    recognition.interimResults =
      true;

    recognition.lang =
      "en-US";


    recognitionRef.current =
      recognition;


    recognition.onstart = () => {

      setIsListening(
        true
      );


      answerStartTimeRef.current =
        Date.now();


      lastSpeechTimeRef.current =
        null;

    };


    recognition.onresult = (
      event
    ) => {

      if (
        interviewEndedRef.current ||
        endingInterviewRef.current
      ) {

        return;

      }


      const currentTime =
        Date.now();


      if (
        lastSpeechTimeRef.current
      ) {

        const speechGap =
          currentTime -
          lastSpeechTimeRef.current;


        if (
          speechGap >=
          LONG_PAUSE_MS
        ) {

          speechMetricsRef.current
            .longPauseCount++;

        }

      }


      lastSpeechTimeRef.current =
        currentTime;


      let finalText =
        "";

      let interimText =
        "";


      for (
        let i =
          event.resultIndex;
        i <
          event.results.length;
        i++
      ) {

        const text =
          event.results[i][0]
            .transcript;


        if (
          event.results[i].isFinal
        ) {

          finalText +=
            text;

        } else {

          interimText +=
            text;

        }

      }


      if (
        finalText
      ) {

        transcriptRef.current =
          (
            transcriptRef.current +
            " " +
            finalText
          ).trim();

      }


      const fullTranscript =
        (
          transcriptRef.current +
          " " +
          interimText
        ).trim();


      setTranscript(
        fullTranscript
      );


      /*
       * Reset the 3-second silence timer
       * every time the user speaks.
       */

      if (
        silenceTimerRef.current
      ) {

        clearTimeout(
          silenceTimerRef.current
        );

      }


      if (
        fullTranscript
      ) {

        silenceTimerRef.current =
          setTimeout(
            () => {

              stopAndSubmitAnswer();

            },
            SILENCE_TO_SUBMIT_MS
          );

      }

    };


    recognition.onerror = (
      event
    ) => {

      console.log(
        "Speech recognition error:",
        event.error
      );


      setIsListening(
        false
      );

    };


    recognition.onend = () => {

      setIsListening(
        false
      );

    };


    try {

      recognition.start();

    } catch (err) {

      console.log(
        "Recognition start error:",
        err
      );

    }

  }


  // ============================================================
  // Stop Listening + Submit
  // ============================================================

  function stopAndSubmitAnswer() {

    if (
      submittingRef.current ||
      endingInterviewRef.current ||
      interviewEndedRef.current
    ) {

      return;

    }


    const answer =
      transcriptRef.current.trim();


    if (
      !answer
    ) {

      return;

    }


    submittingRef.current =
      true;


    analyzeSpeakingMetrics(
      answer
    );


    if (
      silenceTimerRef.current
    ) {

      clearTimeout(
        silenceTimerRef.current
      );


      silenceTimerRef.current =
        null;

    }


    if (
      recognitionRef.current
    ) {

      try {

        recognitionRef.current.stop();

      } catch (err) {

        console.log(err);

      }

    }


    setIsListening(
      false
    );


    handleSubmitAnswer(
      answer
    );

  }


  // ============================================================
  // Analyze Speaking
  // ============================================================

  function analyzeSpeakingMetrics(
    answer
  ) {

    if (
      !answer
    ) {

      return;

    }


    const words =
      answer
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    const fillerWords = [

      "um",

      "uh",

      "umm",

      "uhh",

      "like",

      "basically",

      "actually",

    ];


    let fillerCount =
      0;


    words.forEach(
      (word) => {

        const cleanWord =
          word
            .toLowerCase()
            .replace(
              /[.,!?]/g,
              ""
            );


        if (
          fillerWords.includes(
            cleanWord
          )
        ) {

          fillerCount++;


          speechMetricsRef.current
            .fillerWords[
              cleanWord
            ] =
            (
              speechMetricsRef.current
                .fillerWords[
                  cleanWord
                ] || 0
            ) + 1;

        }

      }
    );


    let speakingSeconds =
      0;


    if (
      answerStartTimeRef.current
    ) {

      speakingSeconds =
        (
          Date.now() -
          answerStartTimeRef.current
        ) / 1000;

    }


    speechMetricsRef.current
      .totalAnswers++;

    speechMetricsRef.current
      .totalWords +=
      words.length;

    speechMetricsRef.current
      .totalFillerWords +=
      fillerCount;

    speechMetricsRef.current
      .totalSpeakingSeconds +=
      speakingSeconds;


    answerStartTimeRef.current =
      null;

  }


  // ============================================================
  // Speaking Analytics Summary
  // ============================================================

  function getSpeakingSummary() {

    const metrics =
      speechMetricsRef.current;


    const minutes =
      metrics.totalSpeakingSeconds /
      60;


    const wordsPerMinute =
      minutes > 0
        ? Math.round(
            metrics.totalWords /
            minutes
          )
        : 0;


    return {

      totalAnswers:
        metrics.totalAnswers,

      totalWords:
        metrics.totalWords,

      fillerWordCount:
        metrics.totalFillerWords,

      fillerWords:
        metrics.fillerWords,

      longPauseCount:
        metrics.longPauseCount,

      speakingDurationSeconds:
        Math.round(
          metrics.totalSpeakingSeconds
        ),

      wordsPerMinute,

    };

  }


  // ============================================================
  // Presentation Analytics Summary
  // ============================================================

  function getPresentationSummary() {

    const metrics =
      presentationRef.current;


    const faceDetectedPercent =
      metrics.totalFrames > 0
        ? Math.round(
            (
              metrics.faceDetectedFrames /
              metrics.totalFrames
            ) * 100
          )
        : 0;


    const lookingAtCameraPercent =
      metrics.faceDetectedFrames > 0
        ? Math.round(
            (
              metrics.lookingAtCameraFrames /
              metrics.faceDetectedFrames
            ) * 100
          )
        : 0;


    return {

      faceDetectedPercent,

      lookingAtCameraPercent,

      faceMissingCount:
        metrics.faceMissingCount,

      lookingAwayCount:
        metrics.lookingAwayCount,

    };

  }


  // ============================================================
  // Submit Answer
  // ============================================================

  async function handleSubmitAnswer(
    answer
  ) {

    const submitPromise =
      (async () => {

        try {

          setIsSubmitting(
            true
          );


          const response =
            await submitInterviewAnswer(
              interviewId,
              answer
            );


          if (
            !response.success
          ) {

            throw new Error(
              response.message ||
              "Unable to submit answer."
            );

          }


          const interview =
            response.interview;


          const nextQuestion =
            interview.nextQuestion;


          answeredQuestionsRef.current +=
            1;


          setAnsweredQuestions(
            answeredQuestionsRef.current
          );


          setDifficulty(
            interview.currentDifficulty ||
            interview.difficulty ||
            difficulty
          );


          setTranscript("");

          transcriptRef.current =
            "";


          // ----------------------------------------------------
          // Timer expired
          // ----------------------------------------------------

          if (
            timerExpiredRef.current
          ) {

            if (
              answeredQuestionsRef.current >
              0
            ) {

              await handleEndInterview(
                true
              );

            }


            return response;

          }


          // ----------------------------------------------------
          // No next question
          // ----------------------------------------------------

          if (
            !nextQuestion
          ) {

            await handleEndInterview(
              true
            );


            return response;

          }


          // ----------------------------------------------------
          // Next question
          // ----------------------------------------------------

          setQuestion(
            nextQuestion
          );


          speakQuestion(
            nextQuestion
          );


          return response;

        } catch (err) {

          console.log(
            "Submit answer error:",
            err
          );


          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to submit your answer."
          );


          throw err;

        } finally {

          submittingRef.current =
            false;


          setIsSubmitting(
            false
          );

        }

      })();


    answerSubmissionPromiseRef.current =
      submitPromise;


    try {

      return await submitPromise;

    } finally {

      if (
        answerSubmissionPromiseRef.current ===
        submitPromise
      ) {

        answerSubmissionPromiseRef.current =
          null;

      }

    }

  }


  // ============================================================
  // Closing Message
  // ============================================================

  function speakClosingMessage() {

    if (
      interviewEndedRef.current ||
      endingInterviewRef.current
    ) {

      return;

    }


    if (
      recognitionRef.current
    ) {

      try {

        recognitionRef.current.stop();

      } catch (err) {

        console.log(err);

      }

    }


    speakNaturally(
      "We are entering the final minute of the interview. Please finish your current thought and continue with your answer.",
      {
        onStart: () => {

          setIsAiSpeaking(
            true
          );

          setIsListening(
            false
          );

        },

        onEnd: () => {

          setIsAiSpeaking(
            false
          );

        },

        onError: () => {

          setIsAiSpeaking(
            false
          );

        },

      }
    );

  }


  // ============================================================
  // End Interview Button
  // ============================================================

  function handleEndButtonClick() {

    if (
      endingInterviewRef.current ||
      isInterviewEnded ||
      isSubmitting ||
      isEndingInterview
    ) {

      return;

    }


    /*
     * Your backend currently requires at least one
     * answered question before completing an interview.
     */

    if (
      answeredQuestionsRef.current === 0
    ) {

      setShowEndConfirmPopup(
        true
      );

      return;

    }


    handleEndInterview(
      false
    );

  }


  // ============================================================
  // End Interview
  // ============================================================

  async function handleEndInterview(
    automatic = false
  ) {

    if (
      endingInterviewRef.current ||
      interviewEndedRef.current
    ) {

      return;

    }


    // ----------------------------------------------------------
    // Save current answer first
    // ----------------------------------------------------------

    const pendingAnswer =
      transcriptRef.current.trim();


    if (
      pendingAnswer &&
      !submittingRef.current
    ) {

      stopAndSubmitAnswer();

    }


    // ----------------------------------------------------------
    // Wait for answer submission
    // ----------------------------------------------------------

    if (
      answerSubmissionPromiseRef.current
    ) {

      try {

        await answerSubmissionPromiseRef.current;

      } catch (err) {

        console.log(
          "Pending answer submission failed:",
          err
        );

      }

    }


    // ----------------------------------------------------------
    // Backend requires at least one answer
    // ----------------------------------------------------------

    if (
      answeredQuestionsRef.current === 0
    ) {

      setShowEndConfirmPopup(
        true
      );

      return;

    }


    endingInterviewRef.current =
      true;


    setShowEndConfirmPopup(
      false
    );


    setIsEndingInterview(
      true
    );


    speakFarewellMessage(
      () => {

        finishEndingInterview(
          automatic
        );

      }
    );

  }


  // ============================================================
  // Farewell
  // ============================================================

  function speakFarewellMessage(
    onComplete
  ) {

    if (
      recognitionRef.current
    ) {

      try {

        recognitionRef.current.stop();

      } catch (err) {

        console.log(err);

      }

    }


    speakNaturally(
      "Thank you for attending the interview today. We are wrapping up your interview and preparing your results.",
      {
        onStart: () => {

          setIsAiSpeaking(
            true
          );

          setIsListening(
            false
          );

        },

        onEnd: () => {

          setIsAiSpeaking(
            false
          );


          onComplete();

        },

        onError: () => {

          setIsAiSpeaking(
            false
          );


          onComplete();

        },

      }
    );

  }


  // ============================================================
  // Finish End Interview
  // ============================================================

  // ============================================================
// Finish End Interview
// ============================================================

async function finishEndingInterview(
  automatic
) {

  try {

    // --------------------------------------------------------
    // Stop recognition
    // --------------------------------------------------------

    if (
      recognitionRef.current
    ) {

      try {

        recognitionRef.current.stop();

      } catch (err) {

        console.debug(
          "Recognition stop error:",
          err
        );

      }

      recognitionRef.current =
        null;

    }


    // --------------------------------------------------------
    // Clear silence timer
    // --------------------------------------------------------

    if (
      silenceTimerRef.current
    ) {

      clearTimeout(
        silenceTimerRef.current
      );

      silenceTimerRef.current =
        null;

    }


    // --------------------------------------------------------
    // Stop AI speech
    // --------------------------------------------------------

    window.speechSynthesis.cancel();

    setIsAiSpeaking(
      false
    );

    setIsListening(
      false
    );


    // --------------------------------------------------------
    // Stop face detection
    // --------------------------------------------------------

    if (
      faceAnimationRef.current
    ) {

      cancelAnimationFrame(
        faceAnimationRef.current
      );

      faceAnimationRef.current =
        null;

    }


    // --------------------------------------------------------
    // Stop camera + microphone
    // --------------------------------------------------------

    stopMedia();


    // --------------------------------------------------------
    // Analytics
    // --------------------------------------------------------

    const speakingAnalytics =
      getSpeakingSummary();


    const presentationAnalytics =
      getPresentationSummary();


    console.log(
      "Speaking Analytics:",
      speakingAnalytics
    );


    console.log(
      "Presentation Analytics:",
      presentationAnalytics
    );


    // --------------------------------------------------------
    // Complete backend interview
    // --------------------------------------------------------

    const response =
      await endFaceToFaceInterview(
        interviewId,
        speakingAnalytics,
        presentationAnalytics
      );


    if (
      !response.success
    ) {

      throw new Error(
        response.message ||
        "Unable to complete interview."
      );

    }


    // --------------------------------------------------------
    // Mark interview as completed
    // --------------------------------------------------------

    interviewEndedRef.current =
      true;


    setIsInterviewEnded(
      true
    );


    setIsEndingInterview(
      false
    );


    setRemainingSeconds(
      0
    );


    // --------------------------------------------------------
    // Clear saved timer
    // --------------------------------------------------------

    try {

      if (
        sessionStorageKeyRef.current
      ) {

        sessionStorage.removeItem(
          sessionStorageKeyRef.current
        );

      }

    } catch (storageError) {

      console.debug(
        "Timer cleanup error:",
        storageError
      );

    }


    // --------------------------------------------------------
    // Redirect to Interview Report
    // --------------------------------------------------------

    console.log(
      automatic
        ? "Interview automatically ended."
        : "Interview manually ended.",
      response
    );
    stopMedia();

if (videoRef.current) {
  const stream = videoRef.current.srcObject;

  if (stream) {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (err) {
        console.debug(
          "Final media cleanup error:",
          err
        );
      }
    });
  }

     videoRef.current.pause();
     videoRef.current.srcObject = null;
     }


    navigate(
      `/interview-preparation/face-to-face/report/${interviewId}`,
      {
        replace: true,
      }
    );


  } catch (err) {

    console.error(
      "End interview error:",
      err
    );


    setError(
      err.response?.data?.message ||
      err.message ||
      "Unable to complete interview."
    );


    endingInterviewRef.current =
      false;


    setIsEndingInterview(
      false
    );

  }

}


  // ============================================================
  // Cleanup
  // ============================================================

  useEffect(() => {

    return () => {

      console.debug(
        "InterviewRoom",
        "InterviewRoom cleanup started."
      );

      window.speechSynthesis.cancel();

      if (recognitionRef.current) {

        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.debug(
            "InterviewRoom",
            "Recognition cleanup error:",
            err
          );
        }

        recognitionRef.current = null;

      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (faceAnimationRef.current) {
        cancelAnimationFrame(faceAnimationRef.current);
        faceAnimationRef.current = null;
      }

      if (faceLandmarkerRef.current) {

        try {
          faceLandmarkerRef.current.close();
        } catch (err) {
          console.debug(
            "InterviewRoom",
            "Face landmarker cleanup error:",
            err
          );
        }

        faceLandmarkerRef.current = null;

      }

      stopMedia();

      console.debug(
        "InterviewRoom",
        "InterviewRoom cleanup completed."
      );

    };

  }, []);


  // ============================================================
  // Loading
  // ============================================================

  if (
    loading
  ) {

    return (

      <div className="interview-room">

        <div className="camera-placeholder">

          Loading interview...

        </div>

      </div>

    );

  }


  // ============================================================
  // Error
  // ============================================================

  if (
    error
  ) {

    return (

      <div className="interview-room">

        <div className="camera-placeholder">

          <h2>
            Unable to continue
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }


  // ============================================================
  // Refresh / Direct URL Protection
  // ============================================================

  if (
    !deviceSetupCompleted &&
    !isInterviewEnded
  ) {

    return (

      <div className="interview-room">

        <div className="camera-placeholder">

          <h2>
            Interview Setup Required
          </h2>


          <p>

            Please complete the camera and
            microphone check before entering
            the interview.

          </p>


          <button
            type="button"
            className="end-confirm-proceed"
            onClick={() =>
              navigate(
                `/interview/${interviewId}/setup`
              )
            }
          >

            Go to Device Setup

          </button>

        </div>

      </div>

    );

  }


  // ============================================================
  // Interview Completed
  // ============================================================

  if (
    isInterviewEnded
  ) {

    return (

      <div className="interview-room">

        <div className="camera-placeholder">

          <h2>
            Interview Completed
          </h2>


          <p>

            Your interview has been
            completed successfully.

          </p>

        </div>

      </div>

    );

  }


  // ============================================================
  // Main Interview UI
  // ============================================================

  return (

    <div className="interview-room">


      {/* ======================================================
          Header
      ====================================================== */}

      <header className="interview-room-header">

        <div>

          <h2>
            Zyoro AI Interview
          </h2>


          <span className="live-status">

            <span></span>

            Live Interview

          </span>

        </div>


        <div className="room-header-actions">


          <div
            className={
              remainingSeconds !== null &&
              remainingSeconds <= 60
                ? "interview-timer warning"
                : "interview-timer"
            }
          >

            {formatTimer(
              remainingSeconds
            )}

          </div>


          <button
            className="end-interview-btn"
            type="button"
            onClick={
              handleEndButtonClick
            }
            disabled={
              isSubmitting ||
              isEndingInterview
            }
          >

            {isEndingInterview
              ? "Ending..."
              : "End Interview"}

          </button>

        </div>

      </header>


      {/* ======================================================
          End Confirmation
      ====================================================== */}

      {showEndConfirmPopup && (

        <div className="end-confirm-overlay">

          <div className="end-confirm-popup">

            <h3>
              End interview?
            </h3>


            <p>

              You have not answered a question
              yet. Please answer at least one
              question before ending the interview.

            </p>


            <div className="end-confirm-actions">

              <button
                type="button"
                className="end-confirm-cancel"
                onClick={() =>
                  setShowEndConfirmPopup(
                    false
                  )
                }
              >

                Continue Interview

              </button>

            </div>

          </div>

        </div>

      )}


      {/* ======================================================
          Interview Content
      ====================================================== */}

      <main className="interview-room-content">


        {/* ====================================================
            Video Grid
        ==================================================== */}

        <div className="video-grid">


          {/* AI Interviewer */}

          <div className="participant-card">

            <div className="participant-label">

              AI Interviewer

            </div>


            <div className="ai-interviewer">

              <div className="ai-avatar">

                AI

              </div>


              <h3>

                Zyoro Interviewer

              </h3>


              <span
                className={
                  isAiSpeaking
                    ? "speaking-status active"
                    : "speaking-status"
                }
              >

                {isAiSpeaking
                  ? "Speaking..."
                  : isEndingInterview
                  ? "Ending..."
                  : "Waiting"}

              </span>

            </div>

          </div>


          {/* Candidate */}

          <div className="participant-card">

            <div className="participant-label">

              You

            </div>


            <div className="candidate-video">


              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
              />


              {cameraStarted && (

                <div className="face-status">

                  <span
                    className={
                      faceDetected
                        ? "face-dot detected"
                        : "face-dot"
                    }
                  ></span>


                  {faceDetected
                    ? "Face detected"
                    : "Face not detected"}

                </div>

              )}


              {cameraStarted &&
                faceDetected && (

                  <div className="gaze-status">

                    {lookingAtCamera
                      ? "👁 Facing camera"
                      : "↗ Looking away"}

                  </div>

              )}


              {!cameraStarted && (
                 <div className="camera-placeholder">
                  {isEndingInterview
                       ? "Camera and microphone stopped."
                           : cameraError ||
                              "Starting camera and microphone..."}
                </div> 
              )}

            </div>

          </div>

        </div>


        {/* ====================================================
            Question
        ==================================================== */}

        <section className="question-panel">


          <div className="question-heading">


            <span>

              AI QUESTION

              {answeredQuestions > 0 &&
                ` · ${answeredQuestions} answered`}

            </span>


            <span className="question-difficulty">

              {difficulty}

            </span>

          </div>


          <p className="question-text">

            {question ||
              "Preparing your question..."}

          </p>

        </section>


        {/* ====================================================
            Candidate Answer
        ==================================================== */}

        <section className="answer-panel">


          <button
            className={
              isListening
                ? "microphone-button listening"
                : "microphone-button"
            }
            type="button"
            disabled={
              isAiSpeaking ||
              isSubmitting ||
              isEndingInterview ||
              !cameraStarted
            }
            onClick={() => {

              if (
                isListening
              ) {

                stopAndSubmitAnswer();

              }

            }}
          >

            🎤

          </button>


          <div className="answer-status">


            <strong>

              {isAiSpeaking

                ? "AI is speaking..."

                : isEndingInterview

                ? "Ending interview..."

                : isSubmitting

                ? "Evaluating your answer..."

                : isListening

                ? "Listening..."

                : !cameraStarted

                ? "Preparing camera and microphone..."

                : "Waiting for your answer..."}

            </strong>


            <span>

              {isListening

                ? "Your answer will submit automatically after 3 seconds of silence."

                : isAiSpeaking

                ? "Listen carefully to the interviewer."

                : "Speak naturally when the interviewer finishes asking the question."}

            </span>

          </div>

        </section>


        {/* ====================================================
            Transcript
        ==================================================== */}

        {transcript && (

          <div className="transcript-box">

            <span>
              Your Answer
            </span>


            <p>
              {transcript}
            </p>

          </div>

        )}

      </main>

    </div>

  );

}


// ============================================================
// Format Timer
// ============================================================

function formatTimer(
  seconds
) {

  if (
    seconds === null ||
    seconds < 0
  ) {

    return "00:00";

  }


  const minutes =
    Math.floor(
      seconds / 60
    );


  const remaining =
    seconds % 60;


  return (

    `${String(minutes).padStart(2, "0")}:` +

    `${String(remaining).padStart(2, "0")}`

  );

}


export default InterviewRoom;