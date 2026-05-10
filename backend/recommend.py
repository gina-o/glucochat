# recommend.py
import pandas as pd

def detect_patterns(data):
    df = pd.DataFrame(data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp')

    patterns = []
    recommendations = []

    # MIDNIGHT SPIKES
    df['hour'] = df['timestamp'].dt.hour
    hourly_avg = df.groupby('hour')['glucose'].mean()
    if hourly_avg.get(0, 0) > 180:
        patterns.append("Midnight spikes detected")
        recommendations.append(
            "You tend to spike around midnight. Try reducing carbs after 10 PM or adjusting your evening insulin."
        )

    # POST-MEAL SPIKES
    meals = df[df['event'] == 'meal']
    for _, meal in meals.iterrows():
        time_window = df[(df['timestamp'] > meal['timestamp']) & 
                         (df['timestamp'] < meal['timestamp'] + pd.Timedelta(hours=2))]
        if len(time_window) > 1:
            rise = time_window['glucose'].max() - meal['glucose']
            if rise > 80:
                patterns.append("Big post-meal spike detected")
                recommendations.append(
                    "Your meals cause spikes. Try reducing fast carbs or pre-bolus 10 minutes earlier."
                )
                break

    return {
        "patterns": patterns,
        "recommendations": recommendations
    }
