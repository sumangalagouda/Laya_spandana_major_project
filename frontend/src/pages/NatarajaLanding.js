import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NatarajaLanding.css";

function NatarajaLanding() {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = window.scrollY / maxScroll;
      setRotation(progress * 320);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <button type="button" className="landing-brand" onClick={() => navigate("/")}>LayaSpandana</button>
        <div className="landing-nav-links">
          <button type="button" onClick={() => navigate("/about")}>About</button>
          <button type="button" onClick={() => navigate("/login")}>Sign In</button>
          <button type="button" onClick={() => navigate("/register")}>Sign Up</button>
        </div>
      </nav>

      <section className="landing-hero">
        <p className="landing-kicker">AI · Bharatanatyam · Tala Detection</p>
        <h1>Laya Spandana</h1>
        <p className="landing-sub">Scroll to explore</p>
      </section>

      <section className="landing-model-wrap">
        <div className="landing-model-frame">
          <img
            src="/images/nataraja.png"
            alt="Nataraja"
            className="landing-model"
            style={{ transform: `rotateY(${rotation}deg)` }}
          />
        </div>
      </section>

      <section className="landing-product">
        <h2>Detect | Analyze | Understand.</h2>
        <p>
          Our AI listens to Bharatanatyam performances and identifies tala patterns in real time,
          bridging ancient rhythm with modern intelligence.
        </p>
        <button type="button" className="landing-cta" onClick={() => navigate("/login")}>
          Get Started
        </button>
      </section>
    </div>
  );
}

export default NatarajaLanding;
