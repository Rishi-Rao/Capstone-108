# EEG to Image Generation Pipeline

This repository contains scripts and resources for processing EEG data and generating images using a Generative Adversarial Network (GAN). The project integrates EEG data preprocessing with image generation, designed for analysis and research purposes in neuroscience and machine learning.

## Files Overview

### 1. **capstone-data-extraction.ipynb**
This Jupyter notebook is used to extract image data from the Imagenet Training set. Specifically, it helps gather images used by **MindBigData Imagenet** for the project.

### 2. **csvproc.py**
This Python script processes and formats the raw EEG readings from **MindBigData** into a single file, which is later used for EEG analysis and preprocessing.

### 3. **processEEG2.py**
This Python script is responsible for preprocessing the EEG data. It includes functions to filter, normalize, and prepare the raw EEG signals for further analysis or modeling.

### 4. **GAN.ipynb**
This Jupyter notebook trains a Generative Adversarial Network (GAN) on the preprocessed EEG data and produces output images based on the EEG signals. This is the core of the project where EEG patterns are used to generate images.

### 5. **match_eeg_system.ipynb**
This Jupyter notebook is designed to map and correlate electrode positions from different EEG standard systems (e.g., 10/20 system). It helps align and standardize electrode placements for the analysis and comparison of EEG data across different systems.

### Requirements
To run the notebooks and scripts, you will need the following:
- Python 3.10+
- Jupyter Notebook or JupyterLab
- Required Python libraries 



