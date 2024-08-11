def calculate_impact(start_sentiment, end_sentiment, conversion_rate):
    if start_sentiment == 0:
        raise ValueError("Start sentiment cannot be zero for percentage change calculation.")
    
    # Calculate percentage change
    percentage_change = ((end_sentiment - start_sentiment) / abs(start_sentiment)) * 100

    # Determine if change is significant
    if abs(percentage_change) < 30:
        impact = "No significant change"
    else:
        if percentage_change > 0:
            impact = "Positive change"
            conversion_rate += conversion_rate * (percentage_change / 100)
        else:
            impact = "Negative change"
            conversion_rate += conversion_rate * (percentage_change / 100)
    
    return {
        "start_sentiment": start_sentiment,
        "end_sentiment": end_sentiment,
        "percentage_change": percentage_change,
        "impact": impact,
        "adjusted_conversion_rate": conversion_rate
    }
