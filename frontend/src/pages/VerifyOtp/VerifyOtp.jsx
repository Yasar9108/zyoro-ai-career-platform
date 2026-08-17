import "./VerifyOtp.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import Button from "../../components/Same/Button/Button";
import { verifyUserOtp } from "../../services/auth.service";

function VerifyOtp() {

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {

    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);

  }, [timer]);

  const handleChange = (value, index) => {

    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

  };

  const handleKeyDown = (e, index) => {

    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }

  };

  const handlePaste = (e) => {

    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const newOtp = [...otp];

    pasted.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    inputRefs.current[Math.min(pasted.length, 5)].focus();

  };

  const handleVerifyOtp = async () => {

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {

      const response = await verifyUserOtp({
        otp: enteredOtp
      });

      console.log(response);

      alert(response.message);

      navigate("/ResetPassword");

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

    <div className="verifyOtp-container">

      {/* Left */}

      <div className="verifyOtp-left">

        <h1>Welcome to Zyoro AI</h1>

        <p>
          Verify the OTP sent to your email to continue resetting your password.
        </p>

        <div className="feature-list">
          <div>✅ Resume Analyzer</div>
          <div>✅ AI Interview Preparation</div>
          <div>✅ Smart Job Hunt</div>
        </div>

      </div>

      {/* Right */}

      <div className="verifyOtp-right">

        <div className="verifyOtp-card">

          <h2>Verify OTP</h2>

          <p>
            Enter the 6-digit verification code sent to your email.
          </p>

          <div
            className="otp-container"
            onPaste={handlePaste}
          >

            {otp.map((digit, index) => (

              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) =>
                  handleChange(e.target.value, index)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, index)
                }
              />

            ))}

          </div>

          <div className="otp-timer">

            {timer > 0 ? (
              <>
                Resend OTP in{" "}
                <span>
                  00:{timer.toString().padStart(2, "0")}
                </span>
              </>
            ) : (
              <span>Resend OTP</span>
            )}

          </div>

          <Button
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="back-link">
            <Link to="/ForgotPassword">
              ← Back
            </Link>
          </div>

        </div>

      </div>

    </div>

  );

}

export default VerifyOtp;