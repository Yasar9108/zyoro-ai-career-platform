import "./WhyChooseUs.css";

function WhyChooseUs() {
    return (
        <section className="why-choose-us">

            <h2>Why Choose Zyoro AI?</h2>

            <p className="why-subtitle">
                Everything you need to prepare, improve, and succeed in your career journey.
            </p>

            <div className="why-grid">

                <div className="why-card">
                    <div className="why-icon">🤖</div>
                    <h3>AI Powered</h3>

                    <p>
                        Get intelligent insights for resumes, interviews,
                        and job matching using AI.
                    </p>
                </div>

                <div className="why-card">
                    <div className="why-icon">⚡</div>
                    <h3>Fast &amp; Simple</h3>

                    <p>
                        Complete everything from one platform with a
                        clean and user-friendly experience.
                    </p>
                </div>

                <div className="why-card">
                    <div className="why-icon">🎯</div>
                    <h3>Career Focused</h3>

                    <p>
                        Designed specifically to help students and
                        professionals land better opportunities.
                    </p>
                </div>

                <div className="why-card">
                    <div className="why-icon">🔒</div>
                    <h3>Secure</h3>

                    <p>
                        Your resumes, personal information,
                        and interview data remain protected.
                    </p>
                </div>

            </div>

        </section>
    );
}

export default WhyChooseUs;