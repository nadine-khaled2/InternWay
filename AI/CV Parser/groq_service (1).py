import json
from groq import Groq
import os

# Replace hardcoded API key with an environment variable for production
# Ensure the GROQ_API_KEY environment variable is set in the deployment environment
import os
from dotenv import load_dotenv

load_dotenv()   # ← ده مهم عشان يقرأ ملف .env

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
def validate_and_format_with_groq(extracted_data):
    print("دخلنا دالة validate_and_format_with_groq")
    data_str = json.dumps(extracted_data, indent=2)
    print("تم تحويل البيانات إلى string")

    prompt = f"""
    You are an expert HR assistant. I have extracted raw data from a resume using Regex and NER.
    The data might contain noise, duplicates, or formatting issues.

    Raw Data:
    {data_str}

    Your Task:
    1. Clean the 'skills' list (fix spelling, remove generic words, group similar skills).
       Return a single, flat list of unique, cleaned skills, without categorization.
    2. Format the 'experience' list into a professional structure. Each experience item should be a JSON object
       with the following keys: 'title', 'company', 'startDate', and 'endDate'.
       Include only entries that represent jobs, internships, or trainings, and explicitly exclude courses.
       If a start or end date is not available, leave the value as an empty string.
    3. Format the 'location' as a JSON object with 'city' and 'country' keys.
    4. Remove any irrelevant text that doesn't belong to skills, experience, or location.
    5. Return ONLY a valid JSON object following this exact structure:
    {{
        "skills": ["Skill1", "Skill2", "Skill3"],
        "experience": [
            {{
                "title": "Job Title",
                "company": "Company Name",
                "startDate": "Month Year",
                "endDate": "Month Year or present"
            }}
        ],
        "location": {{
            "city": "City Name",
            "country": "Country Name"
        }}
    }}
    """

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful assistant that outputs only JSON."},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"}
    )

    return chat_completion.choices[0].message.content
