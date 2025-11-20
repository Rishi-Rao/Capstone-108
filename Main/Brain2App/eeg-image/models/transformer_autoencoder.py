import torch
import torch.nn as nn
import numpy as np

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
