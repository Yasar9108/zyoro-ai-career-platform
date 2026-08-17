import "./Navbar.css";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const NAV_LINKS = [
    { to: "/", label: "Home" },
    { to: "/resume-analyzer", label: "Resume Toolkit" },
    { to: "/interview-preparation", label: "Interview Preparation" },
    { to: "/job-hunt", label: "Job Hunt" },
    { to: "/software-services", label: "Software Services" },
];

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">

            <NavLink to="/" className="logo" onClick={closeMenu}>
                Zyoro AI
            </NavLink>

            <div
                className="menu-icon"
                onClick={() => setMenuOpen((prev) => !prev)}
                role="button"
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
            >
                {menuOpen ? <FaTimes /> : <FaBars />}
            </div>

            <div className={`nav-menu ${menuOpen ? "active" : ""}`}>

                {NAV_LINKS.map((link) => (
                    <NavLink key={link.to} to={link.to} onClick={closeMenu}>
                        {link.label}
                    </NavLink>
                ))}

                <div className="auth-links">
                    <NavLink to="/login" onClick={closeMenu}>
                        Login
                    </NavLink>
                    <NavLink to="/register" onClick={closeMenu}>
                        Register
                    </NavLink>
                </div>

            </div>

        </nav>
    );
}

export default Navbar;