import api from "./axios";

/**
 * Register User
 */
export const registerUser = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

/**
 * Login User
 */
export const loginUser = async (loginData) => {

    const response = await api.post("/auth/login", loginData);

    return response.data;

};

/**
 * Logout User
 */
export const logoutUser = async () => {

    const response = await api.post("/auth/logout");

    return response.data;

};

/**
 * Get Current User
 */
export const getCurrentUser = async () => {

    const response = await api.get("/auth/me");

    return response.data;

};

export const forgotPasswordUser = async (emailData) =>{
    const response = await api.post("/auth/forgot-password", emailData);

    return response.data;
}

export const verifyUserOtp = async (otpData) =>{
    const response = await api.post("/auth/verify-otp",otpData);
    return response.data;
}

export const resetUserPassword = async (passwordData) => {
    const response = await api.post("/auth/reset-password", passwordData);
    return response.data;
};

export async function getDashboard() {
    const response = await api.get("/auth/dashboard");
    return response.data;
}

export const analyzeResume = async (formData) => {

    const response = await api.post(
        "/resume/analyze",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

export const generateOptimizedResume = async () => {

    const response = await api.post(
        "/resume/generate",
        {},
        {
            responseType: "blob",
        }
    );

    return response;
};

export const getResumeAnalysis = async () => {
    const response = await api.get("/resume/get");
    return response.data;
};

// ============================================================
// Face-to-Face AI Interview
// ============================================================


/**
 * Start Face-to-Face Interview
 */
export const startFaceToFaceInterview = async (formData) => {

    const response = await api.post(
        "/interview/start",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};


/**
 * Submit Interview Answer
 */
export const submitInterviewAnswer = async (
    interviewId,
    answer
) => {

    const response = await api.post(
        `/interview/${interviewId}/answer`,
        {
            answer: answer,
        }
    );

    return response.data;
};

/**
 * End Face-to-Face Interview
 */
export const endFaceToFaceInterview = async (
    interviewId,
    speakingAnalytics,
    presentationAnalytics
) => {

    const response = await api.post(
        `/interview/${interviewId}/end`,
        {
            speakingAnalytics,
            presentationAnalytics,
        }
    );

    return response.data;
};

export const getFaceToFaceInterview = async (
  interviewId
) => {

  const response = await api.get(`/interview/${interviewId}`);

  return response.data;
};