import "./Button.css";

function Button({
    children,
    type = "button",
    onClick,
    disabled = false,
    loading = false,
    variant = "primary"
}) {

    return (
        <button
            type={type}
            className={`btn ${variant}`}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading ? (
                <span className="spinner"></span>
            ) : (
                children
            )}
        </button>
    );
}

export default Button;