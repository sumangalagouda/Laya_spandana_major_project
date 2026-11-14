import json
import os
import threading
import urllib.request

import cv2
import joblib
import mediapipe as mp
import numpy as np
from flask import Blueprint, jsonify, request
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

mudra_bp = Blueprint("mudra", __name__)

# ------------------------------------------------------------------ #
# SETTINGS                                                            #
# ------------------------------------------------------------------ #
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODEL_DIR, "best_mlp_model.keras")
LABELS_PATH = os.path.join(MODEL_DIR, "class_names.json")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")
HAND_MODEL_PATH = os.path.join(MODEL_DIR, "hand_landmarker.task")
HAND_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
)

LOW_CONFIDENCE = 0.60
MAX_IMAGE_SIDE = 1280
FEATURE_DIM = 614

USE_CROP_REFINE = True      # re-detect on a zoomed crop (helps small / far hands)
USE_FLIP_TTA = True         # also test a mirrored copy (helps left/right hand mismatch)
CROP_MARGIN = 0.35          # margin around the hand, relative to hand size
CROP_TARGET_SIDE = 640      # zoomed crop is resized so its longest side is ~this
# ------------------------------------------------------------------ #

_state = {"model": None, "scaler": None, "class_names": None, "landmarker": None}
_load_lock = threading.Lock()
_detect_lock = threading.Lock()

# ------------------------------------------------------------------ #
# Geometric features: identical to the Colab notebook                 #
# ------------------------------------------------------------------ #
CHAINS = [
    [0, 1, 2, 3, 4],
    [0, 5, 6, 7, 8],
    [0, 9, 10, 11, 12],
    [0, 13, 14, 15, 16],
    [0, 17, 18, 19, 20],
]
TIPS = [4, 8, 12, 16, 20]
MCPS = [2, 5, 9, 13, 17]
I_IDX, J_IDX = np.triu_indices(21, k=1)


def _cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)


def _extract_geometric_features(landmarks):
    points = landmarks - landmarks[0]
    scale = np.linalg.norm(points[9]) + 1e-8
    points = points / scale

    coordinates = points.flatten()                                     # 63
    distances = np.linalg.norm(points[I_IDX] - points[J_IDX], axis=1)  # 210

    angles = []                                                        # 19
    for chain in CHAINS:
        for k in range(1, 4):
            v1 = points[chain[k - 1]] - points[chain[k]]
            v2 = points[chain[k + 1]] - points[chain[k]]
            angles.append(_cosine_similarity(v1, v2))
    for k in range(4):
        v1 = points[TIPS[k]] - points[MCPS[k]]
        v2 = points[TIPS[k + 1]] - points[MCPS[k + 1]]
        angles.append(_cosine_similarity(v1, v2))

    return np.concatenate([coordinates, distances, np.array(angles)]).astype(np.float32)


def _extract_complete_features(hands):
    if hands is None or len(hands) == 0:
        return None

    features = np.zeros(FEATURE_DIM, dtype=np.float32)
    features[1:293] = _extract_geometric_features(hands[0])

    if len(hands) >= 2:
        features[0] = 1.0
        features[293:585] = _extract_geometric_features(hands[1])

        a, b = hands[0], hands[1]
        scale = (np.linalg.norm(a[9] - a[0]) + np.linalg.norm(b[9] - b[0])) / 2 + 1e-8

        wrist_vector = (b[0] - a[0]) / scale
        wrist_distance = np.linalg.norm(wrist_vector)
        tip_distances = np.linalg.norm(
            (a[TIPS][:, None, :] - b[TIPS][None, :, :]) / scale, axis=2
        ).flatten()

        features[585:] = np.concatenate([wrist_vector, [wrist_distance], tip_distances])

    return features


# ------------------------------------------------------------------ #
# Loading                                                             #
# ------------------------------------------------------------------ #
def _load_labels():
    if not os.path.exists(LABELS_PATH):
        raise FileNotFoundError(f"Class names file not found at {LABELS_PATH}")
    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict):
        return [data[k] for k in sorted(data, key=lambda x: int(x))]
    return list(data)


def _ensure_hand_model_file():
    if os.path.exists(HAND_MODEL_PATH):
        return
    os.makedirs(MODEL_DIR, exist_ok=True)
    try:
        urllib.request.urlretrieve(HAND_MODEL_URL, HAND_MODEL_PATH)
    except Exception as exc:
        raise RuntimeError(
            "hand_landmarker.task is missing and could not be downloaded. "
            f"Download it from {HAND_MODEL_URL} and put it in {MODEL_DIR}. ({exc})"
        )


def _ensure_loaded():
    if _state["model"] is not None and _state["landmarker"] is not None:
        return
    with _load_lock:
        if _state["model"] is not None and _state["landmarker"] is not None:
            return

        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Mudra model not found at {MODEL_PATH}")
        if not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(f"Scaler not found at {SCALER_PATH}")

        from tensorflow.keras.models import load_model

        model = load_model(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        class_names = _load_labels()

        if model.input_shape[-1] != FEATURE_DIM:
            raise RuntimeError(
                f"Model expects {model.input_shape[-1]} features but backend builds {FEATURE_DIM}."
            )
        if len(class_names) != model.output_shape[-1]:
            raise RuntimeError(
                f"class_names.json has {len(class_names)} names but model has "
                f"{model.output_shape[-1]} outputs."
            )
        if getattr(scaler, "n_features_in_", FEATURE_DIM) != FEATURE_DIM:
            raise RuntimeError(
                f"Scaler was fitted on {scaler.n_features_in_} features, expected {FEATURE_DIM}."
            )

        _ensure_hand_model_file()
        options = vision.HandLandmarkerOptions(
            base_options=mp_python.BaseOptions(model_asset_path=HAND_MODEL_PATH),
            running_mode=vision.RunningMode.IMAGE,
            num_hands=2,
            min_hand_detection_confidence=0.35,
            min_hand_presence_confidence=0.35,
        )
        _state["landmarker"] = vision.HandLandmarker.create_from_options(options)
        _state["scaler"] = scaler
        _state["class_names"] = class_names
        _state["model"] = model


# ------------------------------------------------------------------ #
# Detection helpers                                                   #
# ------------------------------------------------------------------ #
def _detect_hands(bgr):
    """Returns (pixel_landmarks_list, normalized_xy_list) sorted by wrist x, or (None, None)."""
    h, w = bgr.shape[:2]
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))

    with _detect_lock:
        result = _state["landmarker"].detect(mp_image)

    if not result.hand_landmarks:
        return None, None

    pairs = []
    for hand in result.hand_landmarks:
        px = np.array([[p.x * w, p.y * h, p.z * w] for p in hand], dtype=np.float32)
        norm = [[float(p.x), float(p.y)] for p in hand]
        pairs.append((px, norm))

    pairs.sort(key=lambda item: item[0][0, 0])  # same sorting as training
    return [p[0] for p in pairs], [p[1] for p in pairs]


def _crop_around_hands(bgr, hands_norm):
    h, w = bgr.shape[:2]
    xs = [pt[0] * w for hand in hands_norm for pt in hand]
    ys = [pt[1] * h for hand in hands_norm for pt in hand]
    min_x, max_x, min_y, max_y = min(xs), max(xs), min(ys), max(ys)

    margin = CROP_MARGIN * max(max_x - min_x, max_y - min_y)
    x0 = int(max(0, min_x - margin))
    x1 = int(min(w, max_x + margin))
    y0 = int(max(0, min_y - margin))
    y1 = int(min(h, max_y + margin))
    if x1 - x0 < 40 or y1 - y0 < 40:
        return None

    crop = bgr[y0:y1, x0:x1]
    scale = CROP_TARGET_SIDE / max(crop.shape[:2])
    interp = cv2.INTER_CUBIC if scale > 1 else cv2.INTER_AREA
    return cv2.resize(crop, None, fx=scale, fy=scale, interpolation=interp)


def _crop_candidate(img, hands_norm, expected_hands, tag):
    crop = _crop_around_hands(img, hands_norm)
    if crop is None:
        return None
    c_px, _ = _detect_hands(crop)
    if c_px is not None and len(c_px) == expected_hands:
        return (tag, c_px)
    return None


def _build_candidates(bgr, hands_px, hands_norm):
    candidates = [("original/full", hands_px)]

    if USE_CROP_REFINE:
        c = _crop_candidate(bgr, hands_norm, len(hands_px), "original/crop")
        if c:
            candidates.append(c)

    if USE_FLIP_TTA:
        flipped = cv2.flip(bgr, 1)
        f_px, f_norm = _detect_hands(flipped)
        if f_px is not None:
            candidates.append(("flipped/full", f_px))
            if USE_CROP_REFINE:
                c = _crop_candidate(flipped, f_norm, len(f_px), "flipped/crop")
                if c:
                    candidates.append(c)

    return candidates


def _predict_from_hands(hands_px):
    features = _extract_complete_features(hands_px).reshape(1, -1)
    scaled = _state["scaler"].transform(features)
    probs = np.asarray(_state["model"].predict(scaled, verbose=0)[0], dtype=np.float32)
    outlier = float(np.max(np.abs(scaled)))  # large value => input unlike the training data
    return probs, outlier


# ------------------------------------------------------------------ #
# Route                                                               #
# ------------------------------------------------------------------ #
@mudra_bp.route("/api/mudra/predict", methods=["POST"])
def predict_mudra():
    upload = request.files.get("image")
    if upload is None:
        return jsonify({"error": "No image uploaded. Send the file in the 'image' field."}), 400

    data = np.frombuffer(upload.read(), dtype=np.uint8)
    image = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if image is None:
        return jsonify({"error": "Could not read this image. Try a JPG or PNG file."}), 400

    try:
        _ensure_loaded()
    except Exception as exc:
        return jsonify({"error": f"Mudra model could not be loaded: {exc}"}), 500

    h, w = image.shape[:2]
    longest = max(h, w)
    if longest > MAX_IMAGE_SIDE:
        s = MAX_IMAGE_SIDE / longest
        image = cv2.resize(image, (int(w * s), int(h * s)))

    try:
        hands_px, hands_norm = _detect_hands(image)
    except Exception as exc:
        return jsonify({"error": f"Hand detection failed: {exc}"}), 500

    if hands_px is None:
        return jsonify({
            "hand_detected": False,
            "predicted": "unknown",
            "confidence": 0.0,
            "message": "No hand found. Keep one hand fully visible with good lighting.",
        })

    try:
        results = []
        for tag, cand_hands in _build_candidates(image, hands_px, hands_norm):
            probs, outlier = _predict_from_hands(cand_hands)
            results.append((tag, probs, outlier))
    except Exception as exc:
        return jsonify({"error": f"Mudra prediction failed: {exc}"}), 500

    names = _state["class_names"]
    # Test-time variants are alternate views of the same hand, not separate
    # predictions. Choosing the most confident variant lets one unstable
    # detection override the other views, especially for mirrored images.
    best_probs = np.mean(np.stack([probs for _, probs, _ in results]), axis=0)
    strongest_tag, _, strongest_outlier = max(
        results, key=lambda r: float(np.max(r[1]))
    )
    best_outlier = float(np.mean([outlier for _, _, outlier in results]))

    order = np.argsort(best_probs)[::-1]
    top = [{"label": names[i], "confidence": float(best_probs[i])} for i in order[:3]]
    best = top[0]

    debug = {
        "chosen_variant": "ensemble",
        "strongest_variant": strongest_tag,
        "outlier_score": round(best_outlier, 2),
        "variant_count": len(results),
        "candidates": [
            {
                "variant": tag,
                "label": names[int(np.argmax(p))],
                "confidence": round(float(np.max(p)), 4),
                "outlier_score": round(o, 2),
            }
            for tag, p, o in results
        ],
    }

    return jsonify({
        "hand_detected": True,
        "hands_detected": len(hands_px),
        "predicted": best["label"],
        "confidence": best["confidence"],
        "is_low_confidence": best["confidence"] < LOW_CONFIDENCE,
        "top_predictions": top,
        "landmarks": hands_norm[0],
        "hands": hands_norm,
        "debug": debug,
    })