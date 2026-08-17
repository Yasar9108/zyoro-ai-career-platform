import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Input from "../../components/Same/Input/Input";
import PasswordInput from "../../components/Same/PasswordInput/PasswordInput";
import Button from "../../components/Same/Button/Button";
import { loginUser } from "../../services/auth.service";

function Login() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setLoading(true);

        try {

            const response = await loginUser({
                email: formData.email,
                password: formData.password,
            });

            alert(response.message || "Login Successful");

            navigate("/dashboard");

        } catch (error) {

            console.debug(error);

            alert(
                error.response?.data?.message || "Login Failed"
            );

        }finally{
            setLoading(false)
        }

    };

    return (

        <div className="login-container">

            {/* Left Section */}

            <div className="login-left">

                <h1>Welcome Back to Zyoro AI</h1>

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

            <div className="register-right">

                <div className="register-card">

                    <h2>Welcome Back To Zyoro AI</h2>

                    <p>Sign in to continue your AI career journey.</p>

                    <form onSubmit={handleSubmit}>

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />

                        <PasswordInput
                            label="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />

                        <br />

                        <div className="forgot-password-link">
                            <Link to="/ForgotPassword">
                                Forgot Password?
                            </Link>
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? "Logging in..."  : "Login"}
                        </Button>

                    </form>

                    <br />

                    <div className="register-link">

                        Don't have an account?

                        <Link to="/Register">
                            Sign Up
                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Login;