const InterviewSession = require("../models/interviewSession.model");
const aiService = require("./gemini.service");

const LOG_TAG = "(interview.service)=>";


// ============================================================
// 1. Start Interview
// ============================================================

async function startInterview(
  userId,
  fileName,
  resumeText,
  targetRole,
  targetCompany,
  experienceLevel,
  interviewType,
  difficulty,
  duration,
  language
) {

  console.debug(
    LOG_TAG,
    " Entered into startInterview: " + new Date().toISOString()
  );

  try {

    if (!userId) {
      throw new Error("User id is required.");
    }

    if (!resumeText) {
      throw new Error("Resume is required.");
    }

    if (!targetRole) {
      throw new Error("Target role is required.");
    }

    if (!experienceLevel) {
      throw new Error("Experience level is required.");
    }


    // Generate first interview question
    const aiResult =
      await aiService.startFaceToFaceInterview(
        resumeText,
        targetRole,
        targetCompany,
        experienceLevel,
        interviewType,
        difficulty,
        language
      );


    // Create interview session
    const interviewSession = new InterviewSession({

      userId,

      resume: {
        fileName,
        extractedText: resumeText,
      },

      targetRole,
      targetCompany,
      experienceLevel,
      interviewType,
      difficulty,
      duration,
      language,

      currentDifficulty: aiResult.difficulty,

      conversations: [
        {
          question: aiResult.question,
          difficulty: aiResult.difficulty,
        },
      ],

    });


    await interviewSession.save();


    console.debug(
      LOG_TAG,
      " Exited from startInterview: " + new Date().toISOString()
    );


    return interviewSession;

  } catch (err) {

    console.error(
      LOG_TAG,
      " startInterview error:",
      err
    );

    throw err;
  }
}


// ============================================================
// 2. Submit Answer
// ============================================================

async function submitAnswer(
  userId,
  interviewId,
  candidateAnswer
) {

  console.debug(
    LOG_TAG, " Entered into submitAnswer: " + new Date().toISOString());

  try {

    if (!userId) {
      throw new Error("User id is required.");
    }

    if (!interviewId) {
      throw new Error("Interview id is required.");
    }

    if (!candidateAnswer || !candidateAnswer.trim()) {
      throw new Error("Candidate answer is required.");
    }

    // Find interview
    const interview =
      await InterviewSession.findOne({
        _id: interviewId,
        userId: userId,
      });

    if (!interview) {
      throw new Error("Interview session not found.");
    }

    // Make sure interview is active
    if (interview.status !== "In Progress") {
      throw new Error("Interview has already been completed.");
    }

    // Get current question
    const currentConversation =
      interview.conversations[
        interview.conversations.length - 1
      ];

    if (!currentConversation) {
      throw new Error("Current interview question not found.");
    }

    // Prevent answering same question twice
    if (currentConversation.answer) {
      throw new Error(
        "Current interview question has already been answered."
      );
    }

    // Ask AI to evaluate answer and generate next question
    const aiResult =
      await aiService.evaluateInterviewAnswer(

        interview.resume.extractedText,

        interview.targetRole,

        interview.targetCompany,

        interview.experienceLevel,

        interview.interviewType,

        interview.currentDifficulty,

        interview.conversations,

        currentConversation.question,

        candidateAnswer,

        interview.language
      );


    // Save candidate answer
    currentConversation.answer =
      candidateAnswer;


    // Save AI evaluation
    currentConversation.technicalScore =
      aiResult.technicalScore;

    currentConversation.communicationScore =
      aiResult.communicationScore;

    currentConversation.feedback =
      aiResult.feedback;


    // Update difficulty
    interview.currentDifficulty =
      aiResult.nextDifficulty;


    // Add next question
    interview.conversations.push({

      question:
        aiResult.nextQuestion,

      difficulty:
        aiResult.nextDifficulty,

    });


    interview.modifiedAt =
      new Date();


    await interview.save();


    console.debug(
      LOG_TAG,
      " Exited from submitAnswer: " + new Date().toISOString()
    );


    return {
      interviewId: interview._id,

      technicalScore:
        aiResult.technicalScore,

      communicationScore:
        aiResult.communicationScore,

      feedback:
        aiResult.feedback,

      difficulty:
        aiResult.nextDifficulty,

      nextQuestion:
        aiResult.nextQuestion,

      questionCategory:
        aiResult.questionCategory,

      topic:
        aiResult.topic,
    };

  } catch (err) {

    console.error(
      LOG_TAG,
      " submitAnswer error:",
      err
    );

    throw err;
  }
}


// ============================================================
// 3. End Interview
// ============================================================
async function endInterview(
  userId,
  interviewId,
  speakingAnalytics,
  presentationAnalytics
) {

  console.debug(
    LOG_TAG,
    " Entered into endInterview: " +
    new Date().toISOString()
  );


  try {

    // ============================================================
    // Validation
    // ============================================================

    if (!userId) {

      throw new Error(
        "User id is required."
      );

    }


    if (!interviewId) {

      throw new Error(
        "Interview id is required."
      );

    }


    // ============================================================
    // Find Interview
    // ============================================================

    const interview =
      await InterviewSession.findOne({

        _id: interviewId,

        userId: userId

      });


    if (!interview) {

      throw new Error(
        "Interview session not found."
      );

    }


    if (
      interview.status === "Completed"
    ) {

      throw new Error(
        "Interview has already been completed."
      );

    }


    // ============================================================
    // Get Answered Questions
    // ============================================================

    const answeredConversations =
      interview.conversations.filter(
        (conversation) =>

          conversation.answer &&

          conversation.answer.trim()
      );


    if (
      answeredConversations.length === 0
    ) {

      throw new Error(
        "Answer at least one question before ending interview."
      );

    }


    // ============================================================
    // Save Speaking Analytics
    // ============================================================

    interview.speakingAnalytics = {

      totalAnswers:
        Number(
          speakingAnalytics?.totalAnswers
        ) || 0,

      totalWords:
        Number(
          speakingAnalytics?.totalWords
        ) || 0,

      fillerWordCount:
        Number(
          speakingAnalytics?.fillerWordCount
        ) || 0,

      fillerWords:
        speakingAnalytics?.fillerWords || {},

      longPauseCount:
        Number(
          speakingAnalytics?.longPauseCount
        ) || 0,

      speakingDurationSeconds:
        Number(
          speakingAnalytics?.speakingDurationSeconds
        ) || 0,

      wordsPerMinute:
        Number(
          speakingAnalytics?.wordsPerMinute
        ) || 0

    };


    // ============================================================
    // Save Presentation Analytics
    // ============================================================

    interview.presentationAnalytics = {

      faceDetectedPercent:
        Number(
          presentationAnalytics?.faceDetectedPercent
        ) || 0,

      lookingAtCameraPercent:
        Number(
          presentationAnalytics?.lookingAtCameraPercent
        ) || 0,

      faceMissingCount:
        Number(
          presentationAnalytics?.faceMissingCount
        ) || 0,

      lookingAwayCount:
        Number(
          presentationAnalytics?.lookingAwayCount
        ) || 0

    };


    // ============================================================
    // Generate Final AI Report
    // ============================================================

    const report =
      await aiService.generateInterviewReport(

        interview.resume.extractedText,

        interview.targetRole,

        interview.targetCompany,

        interview.experienceLevel,

        interview.interviewType,

        answeredConversations,

        // NEW
        interview.speakingAnalytics,

        // NEW
        interview.presentationAnalytics

      );


    // ============================================================
    // Save Final Report
    // ============================================================

    interview.finalReport = {

      overallScore:
        report.overallScore,

      technicalScore:
        report.technicalScore,

      communicationScore:
        report.communicationScore,

      strengths:
        report.strengths,

      weaknesses:
        report.weaknesses,

      topicsToImprove:
        report.topicsToImprove,

      finalFeedback:
        report.finalFeedback

    };


    // ============================================================
    // Complete Interview
    // ============================================================

    interview.status =
      "Completed";


    interview.completedAt =
      new Date();


    interview.modifiedAt =
      new Date();


    await interview.save();


    console.debug(
      LOG_TAG,
      " Exited from endInterview: " +
      new Date().toISOString()
    );


    // ============================================================
    // Response
    // ============================================================

    return {

      interviewId:
        interview._id,

      status:
        interview.status,

      finalReport:
        interview.finalReport,

      speakingAnalytics:
        interview.speakingAnalytics,

      presentationAnalytics:
        interview.presentationAnalytics,

      hiringSignal:
        report.hiringSignal

    };


  } catch (err) {

    console.error(
      LOG_TAG,
      " endInterview error:",
      err
    );


    throw err;

  }

}


// get InterviewById
async function getInterview(
  userId,
  interviewId
) {

  console.debug(
    LOG_TAG,
    " Entered into getInterview: " +
      new Date().toISOString()
  );

  try {

    const interview = await InterviewSession.findOne({
        _id: interviewId,
        userId: userId,
      });

    if (!interview) {
      throw new Error("Interview not found.");
    }

    return interview;

  } catch (err) {

    console.error(
      LOG_TAG,
      " getInterview error:",
      err
    );

    throw err;
  }
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  startInterview,
  submitAnswer,
  endInterview,
  getInterview,
};