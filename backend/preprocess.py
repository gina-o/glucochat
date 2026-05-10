# preprocess.py
import pandas as pd

def clean_data(data):
    df = pd.DataFrame(data)
    df = df.dropna(subset=['timestamp', 'glucose'])  # remove invalid entries
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp')
    return df
