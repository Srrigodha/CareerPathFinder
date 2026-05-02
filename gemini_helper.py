import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def generate_career_roadmap(stage, interests, goal):
    """
    Generates a personalized career roadmap using Groq (Llama-3).
    """
    prompt = f"""
    You are an expert academic and career counselor.
    A student has provided the following profile:
    - Current Stage: {stage}
    - Interests: {interests}
    - Career Goal: {goal}
    
    Generate a detailed career roadmap and return ONLY a raw JSON string strictly following this schema without any markdown formatting wrappers. Do not use words like 'None specified', if you are unsure, provide a generalized estimate (e.g. 'Standard entry criteria' or 'Typically conducted in Spring/Fall'):
    {{
        "roadmap": [
            {{"step": 1, "title": "Step Title", "description": "Detailed action-oriented description of what to do."}},
            {{"step": 2, "title": "Step Title", "description": "Detailed action-oriented description of what to do."}}
        ],
        "required_skills": ["Skill 1", "Skill 2", "Skill 3"],
        "recommended_exams": [
            {{"name": "Exam Name", "eligibility": "Required stage", "important_dates": "Tentative months/deadlines", "difficulty": "High/Medium/Low"}}
        ],
        "recommended_scholarships": [
            {{"name": "Scholarship Name", "eligibility": "Eligibility requirements", "deadline": "Expected deadline date", "amount": "Reward / Benefit amount"}}
        ],
        "alternative_careers": ["Alternative 1", "Alternative 2"]
    }}
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            # Use Llama 3 for fast JSON generation
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        
        text = chat_completion.choices[0].message.content.strip()
        import re
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            text = match.group(0)
        else:
            raise ValueError("No JSON object could be found in the AI response.")
            
        return json.loads(text)
    except Exception as e:
        error_str = str(e).lower()
        print(f"Error calling Groq: {e}")
        
        friendly_error = "Failed to generate roadmap due to an internal AI error."
        if "rate limit" in error_str or "429" in error_str:
            friendly_error = "Groq API Rate Limit Exceeded. Please wait a minute and try again."
        elif "authentication" in error_str or "unauthorized" in error_str:
            friendly_error = "API Error: Invalid Groq API Key."
            
        return {
            "error": friendly_error,
            "roadmap": [],
            "required_skills": [],
            "recommended_exams": [],
            "alternative_careers": []
        }

def generate_chat_response(context_data, user_message):
    """
    Generates a conversational response acting as a career assistant.
    """
    prompt = f"""
    You are an expert, friendly AI career assistant integrated into the 'Career Path Finder' platform.
    The user is viewing their personalized dashboard. Here is the context of their current AI roadmap and profile:
    {json.dumps(context_data) if context_data else "No roadmap generated yet."}
    
    The user asks: "{user_message}"
    
    Respond directly to the user. Be concise, helpful, and reference their specific roadmap/exams/scholarships if applicable.
    Keep the response under 4-5 sentences. Do not use markdown headers, just plain text or simple bullet points.
    If they ask about success rates, explain that it's calculated based on their preparation time and alignment with their roadmap.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful career assistant chatbot."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7
        )
        
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Chat Error: {e}")
        return "I'm currently having trouble connecting to my brain. Please try asking again in a moment!"
