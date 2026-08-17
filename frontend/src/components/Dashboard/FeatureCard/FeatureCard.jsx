import "./FeatureCard.css";
import {
    FaFileAlt,
    FaMicrophone,
    FaBriefcase
} from "react-icons/fa";

const features = [
    {
        title: "Resume Analyzer",
        description: "Analyze your resume and get AI-powered suggestions.",
        icon: FaFileAlt,
        color: "#2563EB"
    },
    {
        title: "AI Interview",
        description: "Practice interviews with AI and improve your confidence.",
        icon: FaMicrophone,
        color: "#10B981"
    },
    {
        title: "AI Job Hunt",
        description: "Discover jobs and manage your applications.",
        icon: FaBriefcase,
        color: "#F59E0B"
    }
];

function FeatureCards() {

    return (
        <section className="feature-cards">

            {features.map((feature) => {

                const Icon = feature.icon;

                return (

                    <div
                        className="feature-card"
                        key={feature.title}
                    >

                        <div
                            className="feature-icon"
                            style={{ backgroundColor: feature.color }}
                        >
                            <Icon />
                        </div>

                        <h3>{feature.title}</h3>

                        <p>{feature.description}</p>

                        <button>
                            Explore
                        </button>

                    </div>

                );
            })}

        </section>
    );
}

export default FeatureCards;