import torch
import torch.nn as nn

class EEGGenerator(nn.Module):
    def __init__(self, eeg_seq_len=360, eeg_channels=5):
        super().__init__()
        self.latent_dim = 256
        self.encoder = nn.Sequential(
            nn.Linear(eeg_seq_len * eeg_channels, 512),
            nn.ReLU(),
            nn.Linear(512, self.latent_dim),
            nn.ReLU()
        )
        self.decoder = nn.Sequential(
            nn.Linear(self.latent_dim, 512*4*4),
            nn.ReLU(),
            nn.Unflatten(1, (512,4,4)),
            nn.ConvTranspose2d(512,256,4,2,1), nn.ReLU(),
            nn.ConvTranspose2d(256,128,4,2,1), nn.ReLU(),
            nn.ConvTranspose2d(128,64,4,2,1), nn.ReLU(),
            nn.ConvTranspose2d(64,3,4,2,1), nn.Tanh()
        )

    def forward(self, eeg):
        x = eeg.view(eeg.size(0), -1)
        latent = self.encoder(x)
        img = self.decoder(latent)
        return img
