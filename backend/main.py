# main.py
from preprocess import clean_data
from recommend import detect_patterns

# Example data
data = [
    {"timestamp": "2025-11-30 00:15", "glucose": 190, "event": ""},
    {"timestamp": "2025-11-30 12:00", "glucose": 120, "event": "meal"},
    {"timestamp": "2025-11-30 12:30", "glucose": 210, "event": ""},
]

df = clean_data(data)
results = detect_patterns(df.to_dict('records'))

print("Patterns:", results['patterns'])
print("Recommendations:", results['recommendations'])
