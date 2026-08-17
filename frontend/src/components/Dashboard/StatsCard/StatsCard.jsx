import "./StatsCard.css";
import {
    FaChartLine,
    FaMicrophone,
    FaBriefcase,
    FaStar
} from "react-icons/fa";

function Stats({ stats }) {

    const statCards = [
        {
            title: "Resume Analyses",
            value: stats.resumeAnalysisCount,
            icon: FaChartLine,
            color: "#2563EB"
        },
        {
            title: "Mock Interviews",
            value: stats.interviewCount,
            icon: FaMicrophone,
            color: "#10B981"
        },
        {
            title: "Jobs Applied",
            value: stats.jobsAppliedCount,
            icon: FaBriefcase,
            color: "#F59E0B"
        },
        {
            title: "Current Plan",
            value: "Free", // We'll replace this with subscription.plan in the next step.
            icon: FaStar,
            color: "#8B5CF6"
        }
    ];

    return (
        <section className="stats">

            {statCards.map((item) => {

                const Icon = item.icon;

                return (
                    <div
                        className="stat-card"
                        key={item.title}
                    >
                        <div
                            className="stat-icon"
                            style={{ backgroundColor: item.color }}
                        >
                            <Icon />
                        </div>

                        <div>
                            <h2>{item.value}</h2>
                            <p>{item.title}</p>
                        </div>

                    </div>
                );
            })}

        </section>
    );
}

export default Stats;