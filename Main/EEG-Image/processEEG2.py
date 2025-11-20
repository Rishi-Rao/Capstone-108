import torch
import torch.nn as nn
import numpy as np

# 🚀 Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 📊 Hyperparameters
seq_len = 360
num_channels = 5
d_model = 64
num_heads = 4
num_layers = 3
dim_feedforward = 128
dropout = 0.1
batch_size = 64
epochs = 50
lr = 1e-4

# 🔢 Positional Encoding
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=360):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-np.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.pe = pe.unsqueeze(0)

    def forward(self, x):
        return x + self.pe[:, :x.size(1), :].to(x.device)

# 🔄 Transformer Autoencoder
class TransformerAutoencoder(nn.Module):
    def __init__(self, seq_len, num_channels, d_model, num_heads, num_layers, dim_feedforward, dropout):
        super().__init__()
        self.input_fc = nn.Linear(num_channels, d_model)
        self.pos_encoding = PositionalEncoding(d_model, seq_len)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=num_heads,
            dim_feedforward=dim_feedforward, dropout=dropout, batch_first=True
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)

        decoder_layer = nn.TransformerDecoderLayer(
            d_model=d_model, nhead=num_heads,
            dim_feedforward=dim_feedforward, dropout=dropout, batch_first=True
        )
        self.decoder = nn.TransformerDecoder(decoder_layer, num_layers=num_layers)

        self.output_fc = nn.Linear(d_model, num_channels)

    def forward(self, x, return_latent=False):
        x = self.input_fc(x)
        x = self.pos_encoding(x)
        encoded = self.encoder(x)

        if return_latent:
            return encoded.mean(dim=1)

        decoded = self.decoder(encoded, encoded)
        return self.output_fc(decoded)

# 🧠 Initialize model
model = TransformerAutoencoder(seq_len, num_channels, d_model, num_heads, num_layers, dim_feedforward, dropout).to(device)

# 📂 Load EEG data
clean_eeg = np.load("formatted_train_eeg.npy")   # (N, 360, 5)
clean_eeg = torch.tensor(clean_eeg, dtype=torch.float32)

# Add artificial Gaussian noise for training (denoising task)
noisy_eeg = clean_eeg + 0.1 * torch.randn_like(clean_eeg)

# Move to device
clean_eeg, noisy_eeg = clean_eeg.to(device), noisy_eeg.to(device)

# 📦 Dataset & Loader
dataset = torch.utils.data.TensorDataset(noisy_eeg, clean_eeg)
loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

# ⚙️ Optimizer & Loss
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=lr)

# 🔁 Training Loop
try:
    model.load_state_dict(torch.load("eeg_denoising_autoencoder.pth", map_location=device))

except:
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for noisy_batch, clean_batch in loader:
            optimizer.zero_grad()
            output = model(noisy_batch)
            loss = criterion(output, clean_batch)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(loader):.6f}")

    # 💾 Save model
    torch.save(model.state_dict(), "eeg_denoising_autoencoder.pth")
    print("✅ Model saved.")

# 💾 Load trained weights
model.load_state_dict(torch.load("eeg_denoising_autoencoder.pth", map_location=device))
model.eval()

# 📂 Load EEG data (shape: N × 360 × 5)
eeg_data = np.load("formatted_test_eeg.npy")
eeg_data = torch.tensor(eeg_data, dtype=torch.float32).to(device)

# 🔎 Denoise
with torch.no_grad():
    denoised_eeg = model(eeg_data)   # (N, 360, 5)



print("Input (noisy) shape:   ", eeg_data.shape)
print("Output (denoised) shape:", denoised_eeg.shape)
print(denoised_eeg[20])

model.eval()
with torch.no_grad():
    batch_out = model(eeg_data)
    single_outs = torch.cat([model(eeg_data[i].unsqueeze(0)) for i in range(eeg_data.shape[0])], dim=0)

diff = (batch_out - single_outs).abs().max()
print("Max difference:", diff.item())


# ✅ Save the denoised signals if you want
# torch.save(denoised_eeg, "DenoisedEEG_test.pth")

