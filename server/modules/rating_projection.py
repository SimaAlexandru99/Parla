def project_customer_rating(average_sentiment, end_sentiment, satisfaction_score):
    # Define mapping of sentiment scores to rating scale
    # This mapping can be adjusted based on the specifics of the sentiment analysis output
    sentiment_to_rating = {
        "negative": 1,
        "neutral": 5,
        "positive": 10
    }

    # Start with the base rating from the satisfaction score
    base_rating = sentiment_to_rating.get(satisfaction_score, 5)
    
    # Adjust the rating based on average sentiment and end sentiment
    # Example logic: higher average sentiment and end sentiment should increase the rating
    rating = base_rating + (average_sentiment - 3) + (end_sentiment - 3)
    
    # Ensure the rating is within the range 1-10
    rating = max(1, min(10, rating))
    
    return round(rating)
