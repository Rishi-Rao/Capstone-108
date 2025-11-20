import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from io import BytesIO

def preprocess_csv(file_like) -> np.ndarray:
    """Reads EEG CSV and returns normalized 360×5 array."""
    df = pd.read_csv(file_like, header=None)
    df = df.iloc[:, 1:]  # remove channel names
    scaler = StandardScaler()
    df = pd.DataFrame(scaler.fit_transform(df))
    df = df.T

    fixed_seq_len = 360
    if df.shape[0] < fixed_seq_len:
        pad_len = fixed_seq_len - df.shape[0]
        df = np.pad(df.to_numpy(), ((0, pad_len), (0, 0)), mode='constant')
    else:
        df = df.iloc[:fixed_seq_len].to_numpy()

    return df.astype(np.float32)
