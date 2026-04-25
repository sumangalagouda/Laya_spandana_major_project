import React, { useEffect, useRef, useState } from "react";
import { Headphones, Mic, Music, Square, Upload, X } from "lucide-react";
import "./AudioUploader.css";

const ACCEPT = ".wav,.aac,.mp3,.flac,.m4a";
const RECORDING_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function interleaveChannels(left, right) {
  const totalLength = left.length + right.length;
  const result = new Float32Array(totalLength);
  let index = 0;
  let inputIndex = 0;

  while (index < totalLength) {
    result[index++] = left[inputIndex];
    result[index++] = right[inputIndex];
    inputIndex++;
  }

  return result;
}

function getSupportedRecordingMimeType() {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
  return RECORDING_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function extensionFromMimeType(mimeType) {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  return "webm";
}

function floatTo16BitPCM(view, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function encodeWav(audioBuffer) {
  const numberOfChannels = Math.min(audioBuffer.numberOfChannels, 2);
  const sampleRate = audioBuffer.sampleRate;
  const left = audioBuffer.getChannelData(0);
  const pcmData =
    numberOfChannels > 1
      ? interleaveChannels(left, audioBuffer.getChannelData(1))
      : new Float32Array(left);

  const bytesPerSample = 2;
  const blockAlign = numberOfChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + pcmData.length * bytesPerSample);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + pcmData.length * bytesPerSample, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, pcmData.length * bytesPerSample, true);
  floatTo16BitPCM(view, 44, pcmData);

  return new Blob([view], { type: "audio/wav" });
}

async function toWavBlob(sourceBlob) {
  const arrayBuffer = await sourceBlob.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    return encodeWav(audioBuffer);
  } finally {
    await audioCtx.close();
  }
}

function AudioUploader({ file, setFile }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setAudioPreviewUrl("");
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setAudioPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file]);

  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const openPicker = () => inputRef.current?.click();

  const clearFile = () => setFile(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedRecordingMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      setRecordTime(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const recordingType = recorder.mimeType || mimeType || "audio/webm";

        if (!chunksRef.current.length) {
          alert("No audio was recorded. Please check microphone permissions and try again.");
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const blob = new Blob(chunksRef.current, { type: recordingType });

        if (!blob.size) {
          alert("Recorded audio is empty. Please try recording again.");
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        try {
          const wavBlob = await toWavBlob(blob);
          if (!wavBlob.size) throw new Error("Empty WAV output");
          const recordedFile = new File([wavBlob], `recording-${Date.now()}.wav`, {
            type: "audio/wav",
          });
          setFile(recordedFile);
        } catch {
          const fallbackExtension = extensionFromMimeType(recordingType);
          const fallbackFile = new File([blob], `recording-${Date.now()}.${fallbackExtension}`, {
            type: recordingType,
          });
          setFile(fallbackFile);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      recorder.start(250);
      setRecording(true);
      timerRef.current = setInterval(() => setRecordTime((prev) => prev + 1), 1000);
    } catch {
      alert("Microphone permission is required for recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.requestData();
      }
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className={`uploader ${dragOver ? "drag-over" : ""}`}>
      <div className="temple-corners" />
      <div className="mandala-wrap">
        <div className="mandala ring-1" />
        <div className="mandala ring-2" />
        <div className="mandala ring-3" />
        <Music size={24} className="mandala-icon" />
      </div>

      <div
        className="drop-zone"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <p className="drop-title">Drop your audio here</p>
        <p className="drop-sub">Accepted: .wav .aac .mp3 .flac .m4a</p>
      </div>

      {file && (
        <>
          <div className="selected-file">
            <span>{file.name}</span>
            <small>{(file.size / 1024).toFixed(1)} KB</small>
            <button onClick={clearFile} className="clear-btn" type="button">
              <X size={16} />
            </button>
          </div>

          {audioPreviewUrl && (
            <div className="preview-player">
              <div className="preview-head">
                <span className="preview-label">
                  <Headphones size={15} /> Audio Preview
                </span>
                <span className="preview-ready">Ready to detect</span>
              </div>

              <div className="preview-wave" aria-hidden="true">
                {Array.from({ length: 16 }).map((_, idx) => (
                  <span key={idx} className="preview-bar" style={{ animationDelay: `${idx * 0.08}s` }} />
                ))}
              </div>

              <audio controls src={audioPreviewUrl} preload="metadata" className="preview-audio" />
            </div>
          )}
        </>
      )}

      <div className="or-divider">या / or</div>

      <div className="record-row">
        {!recording ? (
          <button type="button" className="record-btn" onClick={startRecording}>
            <Mic size={16} /> Live Recording
          </button>
        ) : (
          <button type="button" className="stop-btn" onClick={stopRecording}>
            <Square size={16} /> Stop ({formatTime(recordTime)})
          </button>
        )}
      </div>

      {recording && (
        <div className="waveform-wrap" aria-label="recording waveform">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span key={idx} className="wave-bar" style={{ animationDelay: `${idx * 0.12}s` }} />
          ))}
        </div>
      )}

      <button type="button" className="browse-btn" onClick={openPicker}>
        <Upload size={16} /> Browse Files
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
      />
    </div>
  );
}

export default AudioUploader;
