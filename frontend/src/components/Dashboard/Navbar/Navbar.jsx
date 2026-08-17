import "./Navbar.css";

import {
  FaBars,
  FaBell,
  FaSearch,
  FaChevronDown,
  FaUserCircle,
} from "react-icons/fa";

function Navbar({ toggleSidebar }) {
  return (
    <header className="navbar">

      {/* Left Section */}
      <div className="navbar-left">

        <button className="menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>

        <div className="search-box">
          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search..."
          />
        </div>

      </div>

      {/* Right Section */}
      <div className="navbar-right">

        <button className="notification-btn">
          <FaBell />
          <span className="notification-badge">2</span>
        </button>

        <div className="profile-section">

          <FaUserCircle className="profile-icon" />

          <div className="profile-info">
            <h4>Yasar</h4>
            <p>Free Plan</p>
          </div>

          <FaChevronDown className="dropdown-icon" />

        </div>

      </div>

    </header>
  );
}

export default Navbar;