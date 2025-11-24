import os
import numpy as np
import torch
import pickle
import argparse
from fastapi import FastAPI, File, UploadFile, Form
from transformers import BartTokenizer, BartForConditionalGeneration
from model_decoding_raw import BrainTranslator
from data_raw import get_input_sample
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from torch.nn.utils.rnn import pad_sequence
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

# =============== Global Variables ===============
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = None
tokenizer = None
model = None
# ==============================================

def gemini_refinement(corrupted_text, api_key):
    # This function remains the same
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key)
    messages = [
        SystemMessage(content="As a text reconstructor, your task is to restore corrupted sentences to their original form while making minimum changes. You should adjust the spaces and punctuation marks as necessary. Do not introduce any additional information. If you are unable to reconstruct the text, respond with [False]."),
        HumanMessage(content=f"Reconstruct the following text: [{corrupted_text}].")
    ]
    output = llm.invoke(messages).content
    output = output.replace('[','').replace(']','')
    if len(output)<10 and 'False' in output:
        return corrupted_text
    return output

def pad_and_sort_batch(data_loader_batch):
    # This function remains the same
    input_embeddings, seq_len, input_masks, input_mask_invert, target_ids, target_mask, sentiment_labels, sent_level_EEG, input_raw_embeddings, word_contents, word_contents_attn, subject = tuple(
        zip(*data_loader_batch))

    raw_eeg = []
    input_raw_embeddings_lenghts = []
    for sentence in input_raw_embeddings:
        input_raw_embeddings_lenghts.append(
            torch.Tensor([a.size(0) for a in sentence]))
        raw_eeg.append(pad_sequence(
            sentence, batch_first=True, padding_value=0).permute(1, 0, 2))

    input_raw_embeddings = pad_sequence(
        raw_eeg, batch_first=True, padding_value=0).permute(0, 2, 1, 3)

    return input_embeddings, seq_len, input_masks, input_mask_invert, target_ids, target_mask, sentiment_labels, sent_level_EEG, input_raw_embeddings, input_raw_embeddings_lenghts, word_contents, word_contents_attn, subject

def predict(eeg_data, subject, api_key=None):
    # This function remains the same
    global device, tokenizer, model

    input_sample = get_input_sample(eeg_data, tokenizer, subj=subject)
    
    if input_sample is None:
        return {"error": "Could not process the EEG sample."}

    dummy_batch = [(
        input_sample['input_embeddings'], input_sample['seq_len'],
        input_sample['input_attn_mask'], input_sample['input_attn_mask_invert'],
        input_sample['target_ids'], input_sample['target_mask'], 
        input_sample['sentiment_label'], input_sample['sent_level_EEG'],
        input_sample['input_raw_embeddings'], input_sample['word_contents'],
        input_sample['word_contents_attn'], input_sample['subject']
    )]

    _, _, input_masks_batch, input_mask_invert_batch, target_ids_batch, _, _, _, input_embeddings_batch, input_embeddings_lengths_batch, word_contents_batch, word_contents_attn_batch, subject_batch = pad_and_sort_batch(dummy_batch)

    input_embeddings_batch = input_embeddings_batch.to(device).float()
    input_masks_batch = torch.stack(input_masks_batch, 0).to(device)
    input_mask_invert_batch = torch.stack(input_mask_invert_batch, 0).to(device)
    target_ids_batch = torch.stack(target_ids_batch, 0).to(device)
    word_contents_batch = torch.stack(word_contents_batch, 0).to(device)
    word_contents_attn_batch = torch.stack(word_contents_attn_batch, 0).to(device)
    input_embeddings_lengths_batch = torch.stack([torch.tensor(a.clone().detach()) for a in input_embeddings_lengths_batch], 0).to(device)
    subject_batch = np.array(subject_batch)

    with torch.no_grad():
        seq2seqLMoutput = model(
            input_embeddings_batch, input_masks_batch, input_mask_invert_batch, 
            target_ids_batch, input_embeddings_lengths_batch, word_contents_batch, 
            word_contents_attn_batch, False, subject_batch, device
        )

    logits = seq2seqLMoutput
    probs = logits[0].softmax(dim=1)
    _, predictions = probs.topk(1)
    predictions = torch.squeeze(predictions)
    predicted_string = tokenizer.decode(predictions).split('</s></s>')[0].replace('<s>','')
    
    response = {
        "reference_text": eeg_data['content'],
        "generated_text": predicted_string
    }

    if api_key and api_key.strip():
        refined_text = gemini_refinement(predicted_string, api_key)
        response["refined_text"] = refined_text

    return response

@app.on_event("startup")
def load_model():
    global device, tokenizer, model
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--checkpoint_path', type=str, required=True)
    args, _ = parser.parse_known_args()

    device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
    print(f'[INFO] Using device {device}')

    tokenizer = BartTokenizer.from_pretrained('facebook/bart-large')

    pretrained_bart = BartForConditionalGeneration.from_pretrained('facebook/bart-large')
    model = BrainTranslator(pretrained_bart, in_feature=1024, decoder_embedding_size=1024,
                                    additional_encoder_nhead=8, additional_encoder_dim_feedforward=4096)
    model.load_state_dict(torch.load(args.checkpoint_path, map_location=device))
    model.to(device)
    model.eval()
    print("[INFO] Model loaded.")

@app.post("/predict_text")
async def predict_endpoint(file: UploadFile = File(...), api_key: str = Form(None)):
    try:
        contents = await file.read()
        eeg_data = pickle.loads(contents)
        subject = os.path.basename(file.filename).split('_')[0]
        
        result = predict(eeg_data, subject, api_key)
        print(result)
        return result
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--checkpoint_path', type=str, required=True)
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    
    # The checkpoint is loaded at startup
    uvicorn.run(app, host="0.0.0.0", port=args.port)
