import "./SoftwareServices.css";

function SoftwareServices() {
    return (
        <section className="services">

            <h2>Our Software Services</h2>

            <p className="services-subtitle">
                We build modern, scalable, and AI-powered software solutions for businesses.
            </p>

            <div className="services-grid">

                <div className="service-card">
                    <div className="service-icon">🌐</div>
                    <h3>Web Development</h3>
                    <p>
                        Modern web applications using React, Node.js,
                        Express, and MongoDB.
                    </p>
                </div>

                <div className="service-card">
                    <div className="service-icon">🤖</div>
                    <h3>AI Solutions</h3>
                    <p>
                        AI chatbots, resume analysis, automation,
                        and intelligent business solutions.
                    </p>
                </div>

                <div className="service-card">
                    <div className="service-icon">📱</div>
                    <h3>Mobile Applications</h3>
                    <p>
                        Cross-platform mobile applications with
                        modern technologies.
                    </p>
                </div>

                <div className="service-card">
                    <div className="service-icon">🏢</div>
                    <h3>ERP Systems</h3>
                    <p>
                        Inventory, HR, finance, billing,
                        and complete enterprise software.
                    </p>
                </div>

            </div>

        </section>
    );
}

export default SoftwareServices;