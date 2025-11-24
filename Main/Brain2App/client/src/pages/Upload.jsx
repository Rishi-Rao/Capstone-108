import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const navigate = useNavigate();
  const [eeg, setEeg] = useState(null);
  const [fmri, setFmri] = useState(null);
  const [generatedImg, setGeneratedImg] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [error, setError] = useState(null);
  const [eegTextFile, setEegTextFile] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [generatedJson, setGeneratedJson] = useState(null);
  const [loadingJson, setLoadingJson] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [refinedText, setRefinedText] = useState("");


  const handleListen = async () => {
    const textToPlay = refinedText || generatedText;
    if (!textToPlay) return;
    // Simple third-party TTS free endpoint (no guarantee). For local TTS, you'd call server to generate audio.
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(textToPlay)}`;
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

  const handleGenerateJson = async () => {
    if (!eegTextFile) {
      alert("Please upload an EEG pickle file first!");
      return;
    }

    setLoadingJson(true);
    setError(null);
    setGeneratedJson(null);
    setGeneratedText("");
    setRefinedText("");


    const formData = new FormData();
    formData.append("file", eegTextFile);
    if (apiKey) {
      formData.append("api_key", apiKey);
    }

    try {
      const res = await fetch("https://unnitrogenised-unrepressible-shila.ngrok-free.dev/predict_text", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);

      const json = await res.json();
      setGeneratedText(json.generated_text);
      if (json.refined_text) {
        setRefinedText(json.refined_text);
      }
      setGeneratedJson(null); // Clear the raw JSON
    } catch (err) {
      console.error(err);
      setError("Failed to generate JSON. Please check the backend server.");
    } finally {
      setLoadingJson(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload Your Data</h1>

      <h4>Upload your EEG Readings for Image Generation</h4>
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
            onClick={() => { setGeneratedImg(null); setEegTextFile(null); setEeg(null); setFmri(null) ;}}
            disabled={loadingImage}
          >
            {"Clear"}
          </button>
        </div>
      )}

      <hr style={{ margin: "32px 0" }} />

      <h1>EEG to Text</h1>
      <h4>Upload your EEG Readings for Text Generation (.pkl)</h4>
      <input
        type="file"
        accept=".pickle"
        onChange={(e) => setEegTextFile(e.target.files[0])}
      />

      <h4 style={{ marginTop: 16 }}>Google API Key (optional)</h4>
      <input
        type="text"
        placeholder="Enter your Google API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />

      <div style={{ marginTop: 24 }}>
        <button
          onClick={handleGenerateJson}
          disabled={loadingJson}
        >
          {loadingJson ? "Generating JSON..." : "Generate JSON ➡️"}
        </button>
      </div>




      {/* Show generated text */}
      {(generatedText || refinedText) && (
        <div style={{ marginTop: 32 }}>
          <h3>Generated Text</h3>
          <div
            className="card"
            style={{
              padding: "16px",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            <p>
              <strong>Generated:</strong> {generatedText}
            </p>
            {refinedText && (
              <p>
                <strong>Refined:</strong> {refinedText}
              </p>
            )}
          </div>
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
            onClick={() => { setGeneratedImg(null); setEegTextFile(null); setEeg(null); setFmri(null); }}
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
