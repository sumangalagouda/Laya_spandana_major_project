import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import About from "./pages/About";
import BharatanatyamPage from "./pages/BharatanatyamPage";
import History from "./pages/History";
import Home from "./pages/Home";
import LearnTalas from "./pages/LearnTalas";
import Login from "./pages/Login";
import MudraDetector from "./pages/MudraDetector";
import NatarajaLandingEmbed from "./pages/NatarajaLandingEmbed";
import Register from "./pages/Register";
import "./App.css";

function App() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";
  const mainClassName = hideNavbar
    ? location.pathname === "/"
      ? "page-main landing-main"
      : "page-main auth-main"
    : "page-main";

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}
      <main className={mainClassName}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<NatarajaLandingEmbed />} />
          <Route
            path="/detect"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mudra"
            element={
              <ProtectedRoute>
                <MudraDetector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <LearnTalas />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/bharatanatyam"
            element={
              <ProtectedRoute>
                <BharatanatyamPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#2D1200",
            color: "#FDF6E3",
            border: "1px solid rgba(212,175,55,0.3)",
          },
        }}
      />
    </div>
  );
}

export default App;