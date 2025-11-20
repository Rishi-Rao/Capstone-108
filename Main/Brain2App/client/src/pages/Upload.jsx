import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const navigate = useNavigate();
  const [eeg, setEeg] = useState(null);
  const [fmri, setFmri] = useState(null);
  const [generatedImg, setGeneratedImg] = useState(null);
  const [generatedText, setGeneratedText] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingText, setLoadingText] = useState(false);  
  const [audioSrc, setAudioSrc] = useState(null);
  const [error, setError] = useState(null);

  const handleListen = async () => {
    // Simple third-party TTS free endpoint 
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(generatedText)}`;
    setAudioSrc(url);
  };


  //  Send EEG file to FastAPI backend for image generation
  const handleGenerateImage = async () => {
    if (!eeg && !fmri) {
      alert("Please upload an EEG or fMRI file first!");
      return;
    }

    setLoadingImage(true);
    setError(null);
    setGeneratedImg(null);

    const formData = new FormData();
    if (eeg) formData.append("file", eeg);
    if (fmri) formData.append("file", fmri);

    const url = eeg
      ? "http://127.0.0.1:8000/generate_image" // EEG-to-Image
      : "https://audrie-isobathythermic-nola.ngrok-free.dev/reconstruct"; // fMRI-to-Image

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);

      // Response is an image blob
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImg(imageUrl);
    } catch (err) {
      console.error(err);
      setError(" Failed to generate image. Please check the backend server.");
    } finally {
      setLoadingImage(false);
    }
  };

  // Send EEG file to FastAPI backend for text generation
  const handleGenerateText = async () => {
    if (!eeg) {
      alert("Please upload an EEG CSV file first!");
      return;
    }

    setLoadingText(true);
    setError(null);
    setGeneratedText(null);

    const formData = new FormData();
    formData.append("file", eeg);

    try {
      const res = await fetch("http://127.0.0.1:8000/generate_text", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);

      const text = await res.text();
      setGeneratedText(text);
    } catch (err) {
      console.error(err);
      setError("Failed to generate text. Please check the backend server.");
    } finally {
      setLoadingText(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload Your Data</h1>

      <h4>Upload your EEG Readings</h4>
      <input
        type="file"
        accept=".csv,.txt,.pth"
        onChange={(e) => setEeg(e.target.files[0])}
      />

      <h4 style={{ marginTop: 16 }}>Upload your fMRI scans (optional)</h4>
      <input
        type="file"
        accept=".nii,.nii.gz,.zip"
        onChange={(e) => setFmri(e.target.files[0])}
      />

      <div style={{ marginTop: 24 }}>
        <button onClick={() => navigate("/intro")}>⬅️ Back</button>
        <button
          style={{ marginLeft: 8 }}
          onClick={handleGenerateImage}
          disabled={loadingImage}
        >
          {loadingImage ? "Generating Image..." : "Generate Image ➡️"}
        </button>
        <button
          style={{ marginLeft: 8 }}
          onClick={handleGenerateText}
          disabled={loadingText}
        >
          {loadingText ? "Generating Text..." : "Generate Text ➡️"}
        </button>
      </div>

      {/* Show generated image */}
      {generatedImg && (
        <div
          style={{
            marginTop: 32,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h3>Generated Image</h3>
          <img
            src={generatedImg}
            alt="Generated from EEG or fMRI"
            style={{
              width: 256,
              height: 256, 
              borderRadius: 8,
              objectFit: "cover", // ensures the image isn’t stretched
              border: "1px solid #ccc",
              marginTop: 16,
            }}
          />
          <button
            style={{ marginLeft: 8 }}
            onClick={() => { setGeneratedImg(null) }}
            disabled={loadingImage}
          >
            {"Clear"}
          </button>
        </div>
      )}

      {/* Show generated text */}
      {generatedText && (
        <div style={{ flex: 1 }}>
          <h4>Text Generated</h4>
          <textarea value={generatedText} readOnly rows={10} style={{ width: "100%" }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={handleListen}>Listen</button>
            {audioSrc && (
              <div style={{ marginTop: 8 }}>
                <audio controls autoPlay src={audioSrc} />
              </div>
            )}
          </div>
          <button
            style={{ marginLeft: 8 }}
            onClick={() => { setGeneratedText(null) }}
            disabled={loadingImage}
          >
            {"Clear"}
          </button>
        </div>
      )}

      {/*  Error message */}
      {error && <p style={{ color: "red", marginTop: 20 }}>{error}</p>}
    </div>
  );
};

export default Upload;
