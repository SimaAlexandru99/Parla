def predict_satisfaction_score(end_sentiment):
    if end_sentiment <= 2:
        return "negative"
    elif end_sentiment == 3:
        return "neutral"
    else:
        return "positive"
