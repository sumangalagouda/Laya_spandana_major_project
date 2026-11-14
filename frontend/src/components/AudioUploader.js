import React, { useEffect, useRef, useState } from "react";
import { Headphones, Music, Upload, X } from "lucide-react";
import "./AudioUploader.css";

const ACCEPT = ".wav,.aac,.mp3,.flac,.m4a";

function AudioUploader({ file, setFile, audioRef }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");

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

              <audio ref={audioRef} controls src={audioPreviewUrl} preload="metadata" className="preview-audio" />
            </div>
          )}
        </>
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
