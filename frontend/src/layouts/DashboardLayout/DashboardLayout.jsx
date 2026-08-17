import "./DashboardLayout.css";
import { Outlet } from "react-router-dom";
import { useState } from "react";

import Navbar from "../../components/Dashboard/Navbar/Navbar";
import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";

function DashboardLayout() {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return (
        <div className="dashboard-layout">

            <Navbar toggleSidebar={toggleSidebar} />

            <div className="dashboard-body">

                <Sidebar isOpen={isSidebarOpen} />

                <main className="dashboard-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default DashboardLayout;