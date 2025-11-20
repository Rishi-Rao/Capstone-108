import numpy as np
import pandas as pd
import glob
from sklearn.preprocessing import StandardScaler

# csv_files = glob.glob("C:/Engineering/Capstone/MindBigData-Imagenet/*.csv") 
csv_files = glob.glob("C:/Engineering/Capstone/TrainEEGImagnet/*.csv")  
csv_files = sorted(csv_files)
print(len(csv_files)) #12199

fixed_seq_len = 360  

eeg_data_list = []
i=0
for file in csv_files[11000:]: #1199 for test
    df = pd.read_csv(file, header=None)  # No headers since data is horizontal
    if i==21 or i==52 or i==89:
        print(file)
    i+=1
    # Remove channel names
    df = df.iloc[:, 1:]  

    
    scaler = StandardScaler()
    df = pd.DataFrame(scaler.fit_transform(df))

    #(num_channels, time_steps) → (time_steps, num_channels)
    df = df.T  

  
    if df.shape[0] < fixed_seq_len:
        pad_length = fixed_seq_len - df.shape[0]
        df = np.pad(df.to_numpy(), ((0, pad_length), (0, 0)), mode='constant')
    else:
        df = df.iloc[:fixed_seq_len].to_numpy()

   
    eeg_data_list.append(df)  # Shape: (360, num_channels)


eeg_data = np.stack(eeg_data_list, axis=0)# (num_samples, 360, num_channels)


# np.save("formatted_eeg.npy", eeg_data)
# np.save("formatted_test_eeg.npy", eeg_data)



print(f"Formatted EEG Shape: {eeg_data.shape}")  # Expected: (num_samples, 360, num_channels)
