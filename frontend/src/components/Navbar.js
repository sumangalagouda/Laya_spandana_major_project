import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const avatarLetter = user?.username?.[0]?.toUpperCase() || "A";

  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => navigate("/")} role="button" tabIndex={0}>
        <img className="nav-logo" src="/images/laya-logo.png" alt="Laya Spandana logo" />
        <div>
          <h1>Laya Spandana</h1>
          <p>Bharatanatyam Alaripu</p>
        </div>
      </div>

      <div className="nav-center-line">✦ ✦ ✦</div>

      <nav className="nav-links">
        <NavLink to="/detect">Detect</NavLink>
        <NavLink to="/learn">🎓 Learn</NavLink>
        <NavLink to="/history">History</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/bharatanatyam"> Bharatanatyam</NavLink>
        {isAuthenticated && (
          <>
            <span className="avatar-circle">{avatarLetter}</span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
