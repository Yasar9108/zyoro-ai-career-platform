import { useEffect, useState } from "react";
import "./Dashboard.css";

import Hero from "../../components/Dashboard/Hero/Hero";
import FeatureCards from "../../components/Dashboard/FeatureCard/FeatureCard";
import Stats from "../../components/Dashboard/StatsCard/StatsCard";
import RecentActivity from "../../components/Dashboard/RecentActivity/RecentActivity";
import Subscription from "../../components/Dashboard/SubscriptionCard/SubscriptionCard";

import { getDashboard } from "../../services/auth.service";

function Dashboard() {

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    async function fetchDashboard() {
        try {

            const response = await getDashboard();

            if (response.success) {
                setDashboardData(response.data);
            }

        } catch (error) {
            console.error("Failed to fetch dashboard:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (!dashboardData) {
        return <h2>No Dashboard Data Found</h2>;
    }

    return (
        <div className="dashboard-page">

            <Hero
                user={dashboardData.name}
            />

            <FeatureCards />

            <Stats
                stats={dashboardData.stats}
            />

            <div className="dashboard-bottom">

                <RecentActivity
                    activities={dashboardData.recentActivities}
                />

                <Subscription
                    subscription={dashboardData.subscription}
                />

            </div>

        </div>
    );
}

export default Dashboard;