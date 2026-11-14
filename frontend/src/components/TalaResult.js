import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Copy,
  Info,
  ListMusic,
  Music,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import "./TalaResult.css";

const TALA_DETAILS = {
  tishra: {
    subdivision: "3 per beat",
    syllables: "Ta - ki - ta",
    character: "Flowing and lilting",
    usage: "Gentle, meditative passages",
  },
  chatusra: {
    subdivision: "4 per beat",
    syllables: "Ta - ka - di - mi",
    character: "Steady and balanced",
    usage: "Foundation of classical training",
  },
  kandam: {
    subdivision: "5 per beat",
    syllables: "Ta - ka - ta - ki - ta",
    character: "Syncopated and powerful",
    usage: "Advanced, dynamic passages",
  },
};

function TalaResult({ result }) {
  const [copied, setCopied] = useState(false);

  const tala = result?.tala_info || {};
  const predicted = result?.predicted || "chatusra";
  const isUnknown = predicted === "unknown" || (result?.not_detected && (result?.confidence || 0) < 0.30);
  const isLowConfidence = Boolean(result?.is_low_confidence || ((result?.confidence || 0) < 0.50 && !isUnknown));
  const confidencePct = Math.round((result?.confidence || 0) * 100);
  const scores = result?.scores || {};
  const sections = result?.sections || [];
  const description = result?.description || tala.description || "";
  const details = TALA_DETAILS[predicted];

  const scoreItems = useMemo(
    () => [
      { key: "tishra", label: "Tishra (3)", color: "#D4AF37", value: scores.tishra || 0 },
      { key: "chatusra", label: "Chatusra (4)", color: "#C0392B", value: scores.chatusra || 0 },
      { key: "kandam", label: "Khanda (5)", color: "#1A6B8A", value: scores.kandam || 0 },
    ],
    [scores]
  );

  const ringSize = 128;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (confidencePct / 100) * circumference;

  const handleCopy = () => {
    if (!sections.length) return;
    const textToCopy = sections
      .map((sec) => `${sec.title || `Section ${sec.section_number}`}:\n${sec.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Sollukattu sections copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* SECTION A: TALA DETECTION & CLASSIFICATION (right column) */}
      {/* ========================================================= */}
      <motion.div
        className="section-container section-a"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-tag">
          <Sparkles size={14} /> Tala Classification
        </div>

        <div className="result-header">
          <div className="detected-badge">🥁 {isUnknown ? "Status" : "Detected Tala"}</div>

          <div className="name-block">
            <h3>{result?.tala_type || tala.name}</h3>
            {tala.sanskrit && <p className="lang-line">{tala.sanskrit}</p>}
            {tala.tamil && <p className="lang-line tamil">{tala.tamil}</p>}
          </div>

          {!isUnknown && (
            <div className="confidence-ring glow-pulse">
              <svg width={ringSize} height={ringSize} viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={radius} className="ring-bg" />
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  className="ring-progress"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: dashOffset,
                    stroke: tala.color || "#D4AF37",
                  }}
                />
              </svg>
              <span>{confidencePct}%</span>
              <small className="ring-label">Confidence</small>
            </div>
          )}
        </div>

        {/* Tala Description */}
        {description && (
          <div className="tala-description-box">
            <p className="tala-description-text">{description}</p>
          </div>
        )}

        {/* Tala facts (fills the space under the description) */}
        {!isUnknown && details && (
          <div className="tala-facts">
            <div className="fact-card">
              <label>Subdivision</label>
              <strong>{details.subdivision}</strong>
            </div>
            <div className="fact-card">
              <label>Syllables</label>
              <strong>{details.syllables}</strong>
            </div>
            <div className="fact-card">
              <label>Character</label>
              <strong>{details.character}</strong>
            </div>
            <div className="fact-card">
              <label>Used in</label>
              <strong>{details.usage}</strong>
            </div>
          </div>
        )}

        {/* Confidence breakdown bars */}
        <div className="score-bars">
          {scoreItems.map((item) => {
            const active = predicted === item.key;
            return (
              <div key={item.key} className="score-row">
                <label>{item.label}</label>
                <div className="score-track">
                  <div
                    className={`score-fill ${active ? "active" : ""}`}
                    style={{
                      width: `${Math.round(item.value * 100)}%`,
                      background: active ? item.color : "rgba(212,175,55,0.24)",
                    }}
                  />
                </div>
                <span>{Math.round(item.value * 100)}%</span>
              </div>
            );
          })}
        </div>

        {isLowConfidence && !isUnknown && (
          <div className="unknown-note" style={{ borderColor: "rgba(230,126,34,0.4)", color: "#F39C12" }}>
            <AlertCircle size={18} />
            <span>
              Moderate classification confidence ({confidencePct}%). Showing predefined Sollukattu sections for detected Tala.
            </span>
          </div>
        )}

        {isUnknown && (
          <div className="unknown-note">
            <AlertCircle size={18} />
            <span>
              Could not confidently detect Tishra, Chatusra, or Kandam from this audio.
              Please upload a clearer Alaripu sample with steady percussion and recitation.
            </span>
          </div>
        )}
      </motion.div>

      {/* ========================================================= */}
      {/* SECTION B: PREDEFINED SOLLUKATTU SECTIONS (full width)    */}
      {/* ========================================================= */}
      {!isUnknown && (
        <motion.div
          className="section-container section-sollukattu"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="section-head-bar">
            <div className="section-tag highlight-tag">
              <ListMusic size={15} /> Sollukattu Sections ({sections.length} Sections)
            </div>
            {sections.length > 0 && (
              <button type="button" className="copy-btn" onClick={handleCopy} title="Copy All Sections">
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy All"}
              </button>
            )}
          </div>

          {sections.length > 0 ? (
            <div className="sollukattu-sections-grid">
              {sections.map((sec) => (
                <div key={sec.section_number} className="sollukattu-section-card">
                  <div className="section-card-header">
                    <span className="section-index-badge">
                      <Music size={13} style={{ marginRight: 4, display: "inline-block", verticalAlign: "middle" }} />
                      {sec.title || `Section ${sec.section_number}`}
                    </span>
                    {sec.repetition > 1 && (
                      <span className="section-rep-badge" title={`Repeated ${sec.repetition} times`}>
                        ({sec.repetition})
                      </span>
                    )}
                  </div>
                  <pre className="section-text-content">{sec.text}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-transcription-note">
              <Info size={16} /> No predefined Sollukattu sections found for this Tala.
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}

export default TalaResult;