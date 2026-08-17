import { useState } from "react";
import "./PasswordInput.css";

function PasswordInput({
    label,
    name,
    value,
    onChange,
    placeholder,
    error,
    required = false,
}) {

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="password-group">

            <label className="password-label">
                {label}
                {required && <span className="required">*</span>}
            </label>

            <div className="password-wrapper">

                <input
                    className={`password-field ${error ? "password-error" : ""}`}
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                />

                <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? "🙈" : "👁️"}
                </button>

            </div>

            {error && <p className="error-text">{error}</p>}

        </div>
    );
}

export default PasswordInput;