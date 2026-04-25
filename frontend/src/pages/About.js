import React from "react";
import { motion } from "framer-motion";
import "./About.css";

const PROJECT_FEATURES = [
  {
    title: "AI Tala Detection",
    detail:
      "Analyzes uploaded audio and predicts Tishra, Chatusra, or Kandam nadai using a trained deep-learning model.",
  },
  {
    title: "Simple Audio Upload",
    detail:
      "Supports drag-and-drop and file-picker audio upload so learners can test practice clips instantly.",
  },
  {
    title: "Structured Learning Hub",
    detail:
      "Provides guided learning for all three nadais with recitation, media support, rhythmic visualization, and progress tracking.",
  },
  {
    title: "Cultural Knowledge Space",
    detail:
      "Includes Bharatanatyam foundations: history timeline, abhinaya, navarasa, margam structure, costume, and orchestra roles.",
  },
  {
    title: "User Accounts + History",
    detail:
      "Authentication-backed workflow lets users keep track of previous detections and continue learning systematically.",
  },
  {
    title: "Modern Full-Stack Architecture",
    detail:
      "Built with React frontend, Flask backend, MySQL persistence, and TensorFlow/YAMNet pipeline for robust analysis.",
  },
];

const WORKFLOW_STEPS = [
  "Capture audio through upload.",
  "Preprocess input for consistent quality and model-ready format.",
  "Extract meaningful acoustic embeddings through YAMNet.",
  "Run classification model to estimate nadai confidence scores.",
  "Return prediction to UI with learner-friendly interpretation.",
  "Store user activity so progress and history remain accessible.",
];

const MODULE_COVERAGE = [
  {
    name: "Detect Page",
    detail:
      "Audio ingestion, real-time preview, and AI-assisted tala prediction for practice validation.",
  },
  {
    name: "Learn Page",
    detail:
      "Step-by-step nadai learning with recitation tracks, rhythmic cues, and media-assisted understanding.",
  },
  {
    name: "Bharatanatyam Page",
    detail:
      "Comprehensive classical dance reference covering history, expression systems, ensemble, and performance grammar.",
  },
  {
    name: "History + Account Modules",
    detail:
      "Secured account flow with stored predictions and learning continuity across sessions.",
  },
];

const IMPACT_POINTS = [
  "Helps beginners understand tala structure with immediate practical feedback.",
  "Supports teachers by offering a supplementary rhythm-check tool during training.",
  "Encourages disciplined self-practice through measurable progress and repeatability.",
  "Connects classical knowledge with modern AI in a culturally respectful format.",
];

const NADAIS = [
  {
    color: "#D4AF37",
    name: "Tishra Nadai",
    tamil: "திஸ்ர நடை",
    meaning: "Triplet Flow",
    paragraph:
      "Tishra Nadai opens space for meditative expansion. The threefold pulse carries devotional intent and a wave-like inner breath through eye, neck, and torso transitions.",
  },
  {
    color: "#C0392B",
    name: "Chatusra Nadai",
    tamil: "சதுஸ்ர நடை",
    meaning: "Balanced Four",
    paragraph:
      "Chatusra Nadai is the foundational square of Bharatanatyam rhythm. It holds proportion, symmetry, and pedagogical clarity across beginner and advanced Alaripu renderings.",
  },
  {
    color: "#1A6B8A",
    name: "Kandam Nadai",
    tamil: "கண்ட நடை",
    meaning: "Dynamic Five",
    paragraph:
      "Kandam Nadai introduces asymmetrical strength and dramatic velocity. Its five-beat architecture demands deep internal counting and precise articulation of angular energy.",
  },
];

function About() {
  return (
    <div className="about-page">
      <motion.section className="about-hero" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="big-om">ॐ</div>
        <h1>About This Project</h1>
        <div className="intro-grid">
          <article>
            <p>
              Laya Spandana is a Bharatanatyam rhythm-learning and tala-detection platform designed to bridge
              classical pedagogy with AI-assisted analysis. It enables dancers, teachers, and students to
              understand nadai structure, improve rhythmic consistency, and connect practical training with
              cultural context.
            </p>
            <p>
              The project combines audio intelligence, interactive learning pages, and curated Bharatanatyam
              knowledge so users can not only detect talas, but also understand why rhythm matters in performance.
            </p>
          </article>
          <aside className="lotus-mandala">
            <div className="petal p1" />
            <div className="petal p2" />
            <div className="petal p3" />
            <div className="petal p4" />
            <div className="petal p5" />
            <div className="petal p6" />
          </aside>
        </div>
      </motion.section>

      <section className="project-features">
        <h2>Complete Feature Coverage</h2>
        <div className="feature-grid">
          {PROJECT_FEATURES.map((item) => (
            <article key={item.title} className="feature-card">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="project-impact">
        <h2>How This Project Is Helpful</h2>
        <div className="impact-grid">
          {IMPACT_POINTS.map((point) => (
            <article key={point} className="impact-card">
              <p>{point}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="project-workflow">
        <h2>End-to-End Workflow</h2>
        <ol className="workflow-list">
          {WORKFLOW_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="nadai-timeline">
        <h2>The Three Core Nadais</h2>
        {NADAIS.map((item) => (
          <article key={item.name} className="nadai-item" style={{ "--nadai-color": item.color }}>
            <div className="nadai-text">
              <h3>{item.name}</h3>
              <p className="tamil">{item.tamil}</p>
              <p className="meaning">{item.meaning}</p>
              <p>{item.paragraph}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="ai-works">
        <h2>How the AI Works</h2>
        <div className="tech-cards">
          <article>
            <h3>Audio Input</h3>
            <p>Uploaded files are prepared for consistent analysis at 16kHz mono.</p>
          </article>
          <article>
            <h3>Preprocessing</h3>
            <p>Noise reduction, silence trimming, and fixed 5-second normalization improve signal quality.</p>
          </article>
          <article>
            <h3>YAMNet Embedding</h3>
            <p>TensorFlow Hub YAMNet extracts semantically rich 1024-dimensional acoustic embeddings.</p>
          </article>
          <article>
            <h3>Classification</h3>
            <p>A trained Keras model predicts Tishra, Chatusra, or Kandam confidence scores.</p>
          </article>
        </div>
        <div className="stack-pills">
          <span><i />React</span>
          <span><i />Flask</span>
          <span><i />MySQL</span>
          <span><i />TensorFlow</span>
          <span><i />YAMNet</span>
          <span><i />JWT</span>
        </div>
      </section>

      <section className="module-coverage">
        <h2>Project Modules</h2>
        <div className="module-grid">
          {MODULE_COVERAGE.map((module) => (
            <article key={module.name}>
              <h3>{module.name}</h3>
              <p>{module.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="project-summary">
        <h2>Project Summary</h2>
        <p>
          This platform is built to make Bharatanatyam rhythm learning more accessible, measurable, and engaging.
          By combining tradition, technology, and thoughtful interface design, it supports both rigorous practice
          and deeper cultural understanding.
        </p>
      </section>
    </div>
  );
}

export default About;
