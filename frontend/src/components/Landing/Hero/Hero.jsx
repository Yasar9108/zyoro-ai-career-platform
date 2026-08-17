import "./Hero.css";

function Hero() {
    return (
        <section className="landing-hero">

            <div className="hero-content">

                <span className="hero-eyebrow">Zyoro AI</span>

                <h1>
                    Your AI Career Partner
                </h1>

                <p>
                    Analyze resumes, prepare for interviews, discover jobs,
                    and accelerate your career with AI.
                </p>

                <div className="hero-buttons">
                    <button className="btn-primary">Get Started</button>
                    <button className="btn-secondary">Learn More</button>
                </div>

            </div>

        </section>
    );
}

export default Hero;