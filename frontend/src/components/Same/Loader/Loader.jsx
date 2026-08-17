import "./Loader.css";

function Loader({ size = "40px" }) {
    return (
        <div
            className="loader"
            style={{
                width: size,
                height: size,
            }}
        ></div>
    );
}

export default Loader;