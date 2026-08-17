import "./Input.css";

function Input({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    error,
    required = false,
}) {
    return (
        <div className="input-group">

            <label className="input-label">
                {label}
                {required && <span className="required">*</span>}
            </label>

            <input
                className={`input-field ${error ? "input-error" : ""}`}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />

            {error && (
                <p className="error-text">{error}</p>
            )}

        </div>
    );
}

export default Input;