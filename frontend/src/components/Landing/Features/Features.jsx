import "./Features.css";

function Features() {
    return (
        <section className="features">

            <h2>Everything You Need To Build Your Career</h2>

            <p className="features-subtitle">
                Powerful AI tools designed to help you prepare, improve,
                and succeed.
            </p>

            <div className="feature-cards">

                <div className="feature-card">
                    <div className="feature-icon">📄</div>
                    <h3>AI Resume Analyzer &amp; Generator</h3>

                    <p>
                        Get an instant ATS score with personalized suggestions,
                        or generate a fresh resume tailored to your target role
                        — all from one upload.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">🎤</div>
                    <h3>AI Interview Preparation</h3>

                    <p>
                        Practice HR and technical interviews with
                        instant AI feedback to improve your confidence.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">💼</div>
                    <h3>Smart Job Hunt</h3>

                    <p>
                        Discover jobs that match your skills and
                        simplify your application process.
                    </p>
                </div>

            </div>

        </section>
    );
}

export default Features;