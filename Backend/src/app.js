const cookieParser = require("cookie-parser");
const express = require("express");
const auth_route = require("./routes/auth.route");
const profile_route = require("./routes/profile.route");
const resume_route = require("./routes/resume.route");
const aiInterview_route = require("./routes/interview.route");
const aiJobHunt_route = require("./routes/aiAutoApply.route");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

// authorization api
app.use("/api/auth", auth_route)

// user profile api
app.use("/api/profile", profile_route)

// resumeAnalyzer api
app.use("/api/resume", resume_route)

// // AI Interview Preparation API for of now we are not using this
// app.use("/api/aiInterview", aiInterview_route);

// AIJobHunt API
app.use("/api/aiJobHunt", aiJobHunt_route);

// AIInterviewprep APi
app.use("/api/interview", aiInterview_route);
module.exports = app;