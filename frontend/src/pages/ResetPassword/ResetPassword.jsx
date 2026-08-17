import "./ResetPassword.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import PasswordInput from "../../components/Same/PasswordInput/PasswordInput";
import Button from "../../components/Same/Button/Button";

import { resetUserPassword } from "../../services/auth.service";

function ResetPassword() {

    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {

            const response = await resetUserPassword({
                password
            });

            console.log(response);

            alert(response.message);

            navigate("/login");

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

        <div className="resetPassword-container">

            {/* Left Section */}

            <div className="resetPassword-left">

                <h1>Welcome to Zyoro AI</h1>

                <p>
                    Create a strong password to secure your account and continue your career journey.
                </p>

                <div className="feature-list">

                    <div>✅ Resume Analyzer</div>

                    <div>✅ AI Interview Preparation</div>

                    <div>✅ Smart Job Hunt</div>

                </div>

            </div>

            {/* Right Section */}

            <div className="resetPassword-right">

                <div className="resetPassword-card">

                    <h2>Reset Password</h2>

                    <p>
                        Enter your new password below.
                    </p>

                    <form onSubmit={handleSubmit}>

                        <PasswordInput
                            label="New Password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <PasswordInput
                            label="Confirm Password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;