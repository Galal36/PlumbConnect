import google.generativeai as genai
from django.conf import settings
import os
import json

def review_article_with_ai(article_text):
    """
    Sends article text to the Gemini API for review and returns a structured JSON response.
    Includes debugging print statements.
    """
    print("--- Starting AI Article Review ---")
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("🔴 ERROR: GEMINI_API_KEY not found in environment variables.")
            return None
        
        print("✅ API Key loaded successfully.")

        genai.configure(api_key=api_key)
        # --- THIS IS THE CORRECTED MODEL NAME ---
        model = genai.GenerativeModel('gemini-1.5-flash')
        # ----------------------------------------

        prompt = f"""
        Role and Goal: You are an expert plumber with 20 years of experience and a strict but fair content moderator for a website in Kuwait called PlumbConnect. Your goal is to review an article written by a plumber to ensure it is safe, accurate, relevant, and appropriate for our audience. The content is in Arabic.

        Article to Review:
        ---
        {article_text}
        ---

        Your Tasks:
        1.  Technical Accuracy Score (1-10): Based on your plumbing expertise, give a score from 1 (dangerously wrong) to 10 (perfectly accurate and safe).
        2.  Relevance Score (1-10): Give a score from 1 (not about plumbing at all) to 10 (highly relevant to plumbing in Kuwait).
        3.  Safety Concerns: List any advice in the article that could be dangerous or incorrect. If there are no concerns, return an empty list.
        4.  Content Moderation: Check for any profanity, spam, or inappropriate language. Note if any is found.
        5.  Summary: Provide a brief, one-sentence summary of the article's main point in Arabic.

        Output Format:
        Provide your entire response in a single, valid JSON object. Do not write any other text. The JSON structure must be:
        {{
          "technical_score": <number>,
          "relevance_score": <number>,
          "safety_concerns": ["concern 1", "concern 2", ...],
          "is_inappropriate": <true_or_false>,
          "summary": "<your one-sentence summary in Arabic>"
        }}
        """
        
        print("... Sending prompt to Gemini API ...")
        response = model.generate_content(prompt)
        
        print("--- Raw Response from Gemini ---")
        print(response.text)
        print("--------------------------------")

        # Clean up the response to ensure it's valid JSON
        cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
        
        print("... Attempting to parse JSON ...")
        parsed_json = json.loads(cleaned_response_text)
        print("✅ JSON parsed successfully!")
        
        return parsed_json

    except Exception as e:
        print(f"🔴 ERROR: An error occurred during AI review: {e}")
        return None
