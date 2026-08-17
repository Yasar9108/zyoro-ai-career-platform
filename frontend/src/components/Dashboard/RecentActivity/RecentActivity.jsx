import "./RecentActivity.css";

import {
    FaFileAlt,
    FaMicrophone,
    FaBriefcase,
    FaCheckCircle,
    FaCrown
} from "react-icons/fa";

function RecentActivity({ activities }) {

    function getActivityIcon(type) {
        switch (type) {
            case "resume":
                return FaFileAlt;

            case "mock_interview":
            case "face_to_face_interview":
                return FaMicrophone;

            case "job_application":
                return FaBriefcase;

            case "subscription":
                return FaCrown;

            default:
                return FaCheckCircle;
        }
    }

    if (!activities || activities.length === 0) {
        return (
            <section className="recent-activity">

                <div className="activity-header">

                    <h2>Recent Activity</h2>

                </div>

                <div className="empty-activity">

                    <h4>No recent activities yet.</h4>

                    <p>
                        Start by analyzing your resume or taking your first mock interview.
                    </p>

                </div>

            </section>
        );
    }

    return (

        <section className="recent-activity">

            <div className="activity-header">

                <h2>Recent Activity</h2>

                <button>View All</button>

            </div>

            <div className="activity-list">

                {activities.map((activity) => {

                    const Icon = getActivityIcon(activity.type);

                    return (

                        <div
                            className="activity-item"
                            key={activity._id}
                        >

                            <div className="activity-icon">
                                <Icon />
                            </div>

                            <div className="activity-content">

                                <h4>{activity.title}</h4>

                                <p>{activity.description}</p>

                            </div>

                            <span>
                                {new Date(activity.createdAt).toLocaleDateString()}
                            </span>

                        </div>

                    );

                })}

            </div>

        </section>

    );

}

export default RecentActivity;