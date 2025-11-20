import React from "react";
import { useNavigate } from "react-router-dom";

const Intro = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Brain2App</h1>
      <h3>Need for the Project</h3>
      <p>A brainwave-powered communication framework designed to help individuals with Locked-In Syndrome and severe speech impairments express themselves without physical movement.</p>
      <h3>Instructions for Use</h3>
      <ol>
        <li>Upload EEG and fMRI data.</li>
        <li>Wait for the system to process it.</li>
        <li>View generated image and text results.</li>
      </ol>
      <button onClick={()=>navigate('/upload')}>Get Started ➡️</button>
    </div>
  );
};

export default Intro;
