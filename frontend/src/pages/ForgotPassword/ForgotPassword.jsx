import "./ForgotPassword.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../../components/Same/Input/Input";
import Button from "../../components/Same/Button/Button";

import { forgotPasswordUser } from "../../services/auth.service";

function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const response = await forgotPasswordUser({
        email
      });

      console.log(response);

      alert(response.message);

      navigate("/verifyotp");

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="forgotPassword-container">

      {/* Left Section */}

      <div className="forgotPassword-left">

        <h1>Welcome to Zyoro AI</h1>

        <p>
          Your AI-powered career platform to analyze resumes,
          prepare for interviews, and discover the right jobs.
        </p>

        <div className="feature-list">
          <div>✅ Resume Analyzer</div>
          <div>✅ AI Interview Preparation</div>
          <div>✅ Smart Job Hunt</div>
        </div>

      </div>

      {/* Right Section */}

      <div className="forgotPassword-right">

        <div className="forgotPassword-card">

          <h2>Forgot Password?</h2>

          <p>
            Enter your registered email address.
            We'll send you a verification OTP.
          </p>

          <form onSubmit={handleSubmit}>

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>

          </form>

          <div className="login-link">
            <Link to="/login">
              ← Back to Login
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;