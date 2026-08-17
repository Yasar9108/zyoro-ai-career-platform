import "./SubscriptionCard.css";
import { FaCrown } from "react-icons/fa";

function Subscription({ subscription }) {

    return (
        <section className="subscription-card">

            <div className="subscription-header">

                <FaCrown className="subscription-icon" />

                <h3>Current Plan</h3>

            </div>

            <div className="subscription-body">

                <h2>{subscription.plan} Plan</h2>

                <p>
                    {subscription.plan === "Free"
                        ? "Upgrade to Pro and unlock unlimited resume analysis, AI interviews, and advanced job hunt features."
                        : "You are enjoying all Pro features. Thank you for being a Pro member!"}
                </p>

            </div>

            {subscription.plan === "Free" && (
                <button className="upgrade-btn">
                    Upgrade to Pro
                </button>
            )}

        </section>
    );
}

export default Subscription;