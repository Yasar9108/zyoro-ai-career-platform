import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Input from "../../components/Same/Input/Input";
import PasswordInput from "../../components/Same/PasswordInput/PasswordInput";
import Button from "../../components/Same/Button/Button";
import { registerUser } from "../../services/auth.service";

function Register() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (!formData.terms) {
            alert("Please accept the Terms & Privacy Policy");
            return;
        }

        setLoading(true);

        try {

            const response = await registerUser({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            alert(response.message || "Registration Successful");

            navigate("/login");

        } catch (error) {
            console.debug(error);
            alert(
                error.response?.data?.message || "Registration Failed"
            );
            console.log("Status:", error.response?.status);
            console.log("Response:", error.response?.data);
            alert(JSON.stringify(error.response?.data));
        }finally{
            setLoading(false)
        }

    };

    return (

        <div className="register-container">

            {/* Left Section */}

            <div className="register-left">

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

            <div className="register-right">

                <div className="register-card">

                    <h2>Create Account</h2>

                    <p>Start your journey with Zyoro AI</p>

                    <form onSubmit={handleSubmit}>

                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />

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

                        <PasswordInput
                            label="Confirm Password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />

                        <div className="terms">

                            <input
                                type="checkbox"
                                id="terms"
                                name="terms"
                                checked={formData.terms}
                                onChange={handleChange}
                            />

                            <label htmlFor="terms">
                                I agree to the Terms & Privacy Policy
                            </label>

                        </div>

                        <br />

                        <Button type="submit" disabled={loading}>
                          {loading ? "Creating Account..." : "Create Account"}
                        </Button>

                    </form>

                    <br />

                    <div className="login-link">

                        Already have an account?

                        <Link to="/login">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;