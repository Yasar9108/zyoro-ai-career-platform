import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import {
    FaHome,
    FaFileAlt,
    FaMicrophone,
    FaBriefcase,
    FaCreditCard,
    FaUser,
    FaCog,
    FaSignOutAlt,
} from "react-icons/fa";

const sidebarMenu = [
    {
        title: "Dashboard",
        path: "/dashboard",
        icon: FaHome,
    },
    {
        title: "Resume Analyzer",
        path: "/resume-analyzer",
        icon: FaFileAlt,
    },
    {
        title: "AI Interview",
        path: "/interview",
        icon: FaMicrophone,
    },
    {
        title: "AI Job Hunt",
        path: "/job-hunt",
        icon: FaBriefcase,
    },
    {
        title: "Subscription",
        path: "/subscription",
        icon: FaCreditCard,
    },
    {
        title: "Profile",
        path: "/profile",
        icon: FaUser,
    },
];

function Sidebar({ isOpen }) {
    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>

            {/* Logo */}
            <div className="sidebar-logo">
                <h2>Zyoro AI</h2>
                <p>AI Career Assistant</p>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {sidebarMenu.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.title}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive ? "sidebar-link active" : "sidebar-link"
                            }
                        >
                            <Icon className="sidebar-icon" />
                            <span>{item.title}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    <FaCog className="sidebar-icon" />
                    <span>Settings</span>
                </NavLink>

                <button className="logout-btn">
                    <FaSignOutAlt className="sidebar-icon" />
                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;