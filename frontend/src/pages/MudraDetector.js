import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    AlertCircle,
    Camera,
    CameraOff,
    Hand,
    Image as ImageIcon,
    ScanLine,
    Upload,
    Video,
    X,
} from "lucide-react";
import api from "../api/axios";
import "./MudraDetector.css";

const ACCEPT = ".jpg,.jpeg,.png,.webp";

const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17],
];

function MudraDetector() {
    const [mode, setMode] = useState("upload"); // "upload" | "webcam"
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [live, setLive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [resultImage, setResultImage] = useState("");

    const inputRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const busyRef = useRef(false);
    const captureUrlRef = useRef("");

    /* ---------------- upload preview ---------------- */
    useEffect(() => {
        if (!file) {
            setPreviewUrl("");
            return undefined;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const pickFile = (picked) => {
        if (!picked) return;
        if (!picked.type.startsWith("image/")) {
            toast.error("Please choose an image file (JPG, PNG or WEBP).");
            return;
        }
        setFile(picked);
        setResult(null);
    };

    const onDrop = (event) => {
        event.preventDefault();
        setDragOver(false);
        pickFile(event.dataTransfer.files?.[0]);
    };

    /* ---------------- detection ---------------- */
    const runDetection = useCallback(async (blob, overlayUrl, silent = false) => {
        if (busyRef.current) return;
        busyRef.current = true;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", blob, "mudra.jpg");
            const { data } = await api.post("/api/mudra/predict", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(data);
            setResultImage(overlayUrl);
            if (!silent) {
                if (!data?.hand_detected) {
                    toast("No hand found in this image.", { icon: "✋" });
                } else {
                    toast.success(`Mudra detected: ${data.predicted}`, { icon: "🙏" });
                }
            }
        } catch (err) {
            if (!silent) {
                if (!err?.response) {
                    toast.error("Cannot connect to backend server. Make sure Flask is running on port 5000.");
                } else {
                    toast.error(err?.response?.data?.error || "Detection failed. Please try another image.");
                }
            }
        } finally {
            busyRef.current = false;
            setLoading(false);
        }
    }, []);

    const detectUpload = () => {
        if (!file) return;
        runDetection(file, previewUrl);
    };

    /* ---------------- webcam ---------------- */
    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraOn(false);
        setLive(false);
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 720 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => { });
            }
            setCameraOn(true);
            setResult(null);
        } catch (err) {
            toast.error("Could not access the camera. Allow camera permission and try again.");
        }
    };

    const captureAndDetect = useCallback(
        (silent = false) => {
            const video = videoRef.current;
            if (!video || !video.videoWidth) {
                if (!silent) toast("Camera is not ready yet");
                return;
            }
            if (busyRef.current) return;
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0);
            canvas.toBlob(
                (blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    if (captureUrlRef.current) URL.revokeObjectURL(captureUrlRef.current);
                    captureUrlRef.current = url;
                    runDetection(blob, url, silent);
                },
                "image/jpeg",
                0.9
            );
        },
        [runDetection]
    );

    useEffect(() => {
        if (!live || !cameraOn) return undefined;
        const id = setInterval(() => captureAndDetect(true), 1200);
        return () => clearInterval(id);
    }, [live, cameraOn, captureAndDetect]);

    useEffect(
        () => () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            if (captureUrlRef.current) URL.revokeObjectURL(captureUrlRef.current);
        },
        []
    );

    const switchMode = (next) => {
        if (next === mode) return;
        if (next === "upload") stopCamera();
        setMode(next);
        setResult(null);
        setResultImage("");
    };

    /* ---------------- result values ---------------- */
    const detected = Boolean(result?.hand_detected);
    const confidencePct = Math.round((result?.confidence || 0) * 100);
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (confidencePct / 100) * circumference;

    // All detected hands (falls back to the single-hand field)
    const handsList = (
        result?.hands || (result?.landmarks ? [result.landmarks] : [])
    ).filter((h) => Array.isArray(h) && h.length === 21);

    return (
        <div className="mudra-page">
            <motion.section
                className="mudra-hero"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="mudra-hero-icon">
                    <Hand size={34} />
                </div>
                <h1>Mudra Detector</h1>
                <p>
                    Show a Bharatanatyam mudra by uploading a photo or using your
                    webcam, and the model will name the hand gesture.
                </p>
            </motion.section>

            <section className="mudra-grid">
                {/* ---------------- LEFT: INPUT ---------------- */}
                <motion.div
                    className="mudra-panel mudra-input-panel"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <h3>Input</h3>

                    <div className="mudra-tabs" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === "upload"}
                            className={mode === "upload" ? "active" : ""}
                            onClick={() => switchMode("upload")}
                        >
                            <ImageIcon size={15} /> Upload Image
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={mode === "webcam"}
                            className={mode === "webcam" ? "active" : ""}
                            onClick={() => switchMode("webcam")}
                        >
                            <Video size={15} /> Webcam
                        </button>
                    </div>

                    {mode === "upload" && (
                        <>
                            <div
                                className={`mudra-drop ${dragOver ? "drag-over" : ""}`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={onDrop}
                            >
                                {previewUrl ? (
                                    <div className="mudra-preview">
                                        <img src={previewUrl} alt="Selected mudra" />
                                        <button
                                            type="button"
                                            className="mudra-clear"
                                            onClick={() => {
                                                setFile(null);
                                                setResult(null);
                                            }}
                                            aria-label="Remove image"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mudra-drop-text">
                                        <Hand size={30} />
                                        <p className="mudra-drop-title">Drop your mudra image here</p>
                                        <p className="mudra-drop-sub">Accepted: .jpg .jpeg .png .webp</p>
                                    </div>
                                )}
                            </div>

                            {file && (
                                <div className="mudra-file-row">
                                    <span>{file.name}</span>
                                    <small>{(file.size / 1024).toFixed(1)} KB</small>
                                </div>
                            )}

                            <button type="button" className="mudra-browse" onClick={() => inputRef.current?.click()}>
                                <Upload size={16} /> Browse Files
                            </button>
                            <input
                                ref={inputRef}
                                type="file"
                                accept={ACCEPT}
                                hidden
                                onChange={(e) => {
                                    pickFile(e.target.files?.[0]);
                                    e.target.value = "";
                                }}
                            />

                            <button
                                type="button"
                                className="mudra-detect-btn"
                                onClick={detectUpload}
                                disabled={!file || loading}
                            >
                                {loading ? "Detecting..." : "Detect Mudra"}
                            </button>
                        </>
                    )}

                    {mode === "webcam" && (
                        <>
                            <div className="mudra-video-box">
                                <video ref={videoRef} playsInline muted className={cameraOn ? "on" : ""} />
                                {!cameraOn && (
                                    <div className="mudra-video-off">
                                        <CameraOff size={30} />
                                        <p>Camera is off</p>
                                    </div>
                                )}
                                {live && cameraOn && <span className="mudra-live-dot">LIVE</span>}
                            </div>

                            <div className="mudra-cam-actions">
                                {!cameraOn ? (
                                    <button type="button" className="mudra-browse" onClick={startCamera}>
                                        <Camera size={16} /> Start Camera
                                    </button>
                                ) : (
                                    <button type="button" className="mudra-browse" onClick={stopCamera}>
                                        <CameraOff size={16} /> Stop Camera
                                    </button>
                                )}
                                <label className={`mudra-live-toggle ${!cameraOn ? "disabled" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={live}
                                        disabled={!cameraOn}
                                        onChange={(e) => setLive(e.target.checked)}
                                    />
                                    Live detect
                                </label>
                            </div>

                            <button
                                type="button"
                                className="mudra-detect-btn"
                                onClick={() => captureAndDetect(false)}
                                disabled={!cameraOn || loading}
                            >
                                {loading ? "Detecting..." : "Capture & Detect"}
                            </button>
                        </>
                    )}

                    <p className="mudra-tip">
                        Tip: fill the frame with your hand, keep the background plain and well lit
                        (the training photos used a green background).
                    </p>
                </motion.div>

                {/* ---------------- RIGHT: RESULT ---------------- */}
                <motion.div
                    className="mudra-panel mudra-result-panel"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {!result && (
                        <div className="mudra-placeholder">
                            <ScanLine size={34} />
                            <p>Result will appear here after detection.</p>
                        </div>
                    )}

                    {result && (
                        <div className="mudra-result">
                            <div className="mudra-tag">
                                <ScanLine size={14} /> Mudra Classification
                            </div>

                            {!detected && (
                                <div className="mudra-note warn">
                                    <AlertCircle size={18} />
                                    <span>{result.message || "No hand found. Please try another image."}</span>
                                </div>
                            )}

                            {detected && (
                                <>
                                    <div className="mudra-result-head">
                                        <div className="mudra-badge">🙏 Detected Mudra</div>
                                        <h2>{result.predicted}</h2>

                                        <div className="mudra-ring">
                                            <svg width="128" height="128" viewBox="0 0 110 110">
                                                <circle cx="55" cy="55" r={radius} className="mudra-ring-bg" />
                                                <circle
                                                    cx="55"
                                                    cy="55"
                                                    r={radius}
                                                    className="mudra-ring-progress"
                                                    style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset }}
                                                />
                                            </svg>
                                            <span>{confidencePct}%</span>
                                            <small>Confidence</small>
                                        </div>
                                    </div>

                                    {result.is_low_confidence && (
                                        <div className="mudra-note warn">
                                            <AlertCircle size={18} />
                                            <span>
                                                Moderate confidence ({confidencePct}%). Try a clearer, closer photo of the hand.
                                            </span>
                                        </div>
                                    )}

                                    <div className="mudra-bars">
                                        {(result.top_predictions || []).map((item, idx) => {
                                            const pct = Math.round(item.confidence * 100);
                                            return (
                                                <div key={item.label} className="mudra-bar-row">
                                                    <label>{item.label}</label>
                                                    <div className="mudra-bar-track">
                                                        <div
                                                            className={`mudra-bar-fill ${idx === 0 ? "active" : ""}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span>{pct}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {resultImage && (
                                <div className="mudra-overlay-wrap">
                                    <div className="mudra-overlay">
                                        <img src={resultImage} alt="Analysed hand" />
                                        {detected && handsList.length > 0 && (
                                            <svg viewBox="0 0 1 1" preserveAspectRatio="none">
                                                {handsList.map((hand, h) => (
                                                    <g key={h}>
                                                        {HAND_CONNECTIONS.map(([a, b]) => (
                                                            <line
                                                                key={`${h}-${a}-${b}`}
                                                                x1={hand[a][0]}
                                                                y1={hand[a][1]}
                                                                x2={hand[b][0]}
                                                                y2={hand[b][1]}
                                                                className="mudra-bone"
                                                            />
                                                        ))}
                                                        {hand.map(([x, y], i) => (
                                                            <circle
                                                                key={`${h}-${i}`}
                                                                cx={x}
                                                                cy={y}
                                                                r="0.009"
                                                                className="mudra-joint"
                                                            />
                                                        ))}
                                                    </g>
                                                ))}
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </section>
        </div>
    );
}

export default MudraDetector;