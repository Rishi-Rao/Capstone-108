import numpy as np
import logging
import os
from datetime import datetime
import yaml

def read_configuration(config_path):
    """
    Reads a YAML configuration file.
    """
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

class EarlyStopper:
    def __init__(self, patience=1, min_delta=0):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.min_validation_loss = np.inf

    def early_stop(self, validation_loss):
        if validation_loss < self.min_validation_loss:
            self.min_validation_loss = validation_loss
            self.counter = 0
        elif validation_loss > (self.min_validation_loss + self.min_delta):
            self.counter += 1
            if self.counter >= self.patience:
                return True
        return False

def init_logger(args):
    log_dir = args.get("log_dir", "./logs/logging/")
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    log_file_name = f"ZuCo-AR-EEG-{datetime.now().strftime('%b-%d-%Y_%H-%M-%S')}.log"
    log_file_path = os.path.join(log_dir, log_file_name)
    
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Create handlers
    c_handler = logging.StreamHandler()
    f_handler = logging.FileHandler(log_file_path)
    c_handler.setLevel(logging.INFO)
    f_handler.setLevel(logging.INFO)
    
    # Create formatters and add it to handlers
    c_format = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
    f_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    c_handler.setFormatter(c_format)
    f_handler.setFormatter(f_format)
    
    # Add handlers to the logger
    logger.addHandler(c_handler)
    logger.addHandler(f_handler)

def getLogger():
    return logging.getLogger()
