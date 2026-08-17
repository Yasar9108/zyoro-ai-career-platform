import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import Home from "../pages/Home/Home";
import ResumeAnalyzer from "../pages/ResumeAnalyzer/ResumeAnalyzer";
import InterviewPreparation from "../pages/InterviewPreparation/InterviewPreparation";
import JobHunt from "../pages/JobHunt/JobHunt";
import SoftwareServices from "../pages/SoftwareServices/SoftwareServices";
import AboutUs from "../pages/AboutUs/AboutUs";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import NotFound from "../pages/NotFound/NotFound";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPaasword from "../pages/ResetPassword/ResetPassword";
import VerifyOtp from "../pages/VerifyOtp/VerifyOtp";
import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Resumereport from"../pages/ResumeAnalyzer/ResumeAnalyzeResult"
import FaceToFaceInterview from "../pages/InterviewPreparation/FaceToFaceInterview/FaceToFaceInterview";
import InterviewRoom from "../pages/InterviewPreparation/FaceToFaceInterview/InterviewRoom";
import InterviewSetup from "../pages/InterviewPreparation/FaceToFaceInterview/InterviewSetup";
import InterviewReport from "../pages/InterviewPreparation/FaceToFaceInterview/InterviewReport";


function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<MainLayout />}>

                     <Route index element={<Home />} />

                     <Route path="resume-analyzer" element={<ResumeAnalyzer />} />

                     <Route path="interview-preparation" element={<InterviewPreparation />} />

                     <Route path="job-hunt" element={<JobHunt />} />

                     <Route path="software-services" element={<SoftwareServices />} />

                     <Route path="about-us" element={<AboutUs />} />
 
                </Route>
                <Route element={<AuthLayout />}>
                
                    <Route path="login" element={<Login/>} />

                    <Route path="register" element ={<Register/>}/>

                    <Route path="ForgotPassword" element = {<ForgotPassword/>}/>

                    <Route path="ResetPassword" element={<ResetPaasword/>}/>

                    <Route path="VerifyOtp" element={<VerifyOtp/>}/>

                </Route>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} /> 
                  <Route path="/resume-analyzer/result" element={<Resumereport/>}/>
                  <Route path="/interview-preparation/face-to-face" element={<FaceToFaceInterview />} />
                  <Route path="/interview-preparation/face-to-face/interview-room/:interviewId"element={<InterviewRoom />}/>
                  <Route path="/interview/:interviewId/setup"element={<InterviewSetup />}/>
                  <Route path="/interview-preparation/face-to-face/report/:interviewId" element={<InterviewReport />}/>
               </Route>
                <Route path="*" element={<NotFound />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;