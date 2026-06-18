import spacy
from huggingface_hub import snapshot_download
import pdfplumber
from docx import Document
import re

# Load general spaCy model for locations
nlp_general = spacy.load("en_core_web_lg")

# Download and load the skill-extractor model from Hugging Face
model_path = snapshot_download("amjad-awad/skill-extractor", repo_type="model")
nlp_skills = spacy.load(model_path)  # Dedicated model for skills

def read_pdf(path):
    text = []
    with pdfplumber.open(path) as pdf:
        for p in pdf.pages:
            text.append(p.extract_text() or "")
    return "\n".join(text)

def read_docx(path):
    doc = Document(path)
    return "\n".join([p.text for p in doc.paragraphs])

def read_file(path):
    if path.endswith(".pdf"):
        return read_pdf(path)
    elif path.endswith(".docx"):
        return read_docx(path)
    else:
        raise ValueError("Unsupported file type.")

def extract_location(text):
    doc = nlp_general(text)
    locs = [ent.text for ent in doc.ents if ent.label_ in ("GPE", "LOC")]
    return list(set(locs))

def extract_experience(text):
    exp_lines = []

    # Keywords to identify actual experience lines
    experience_keywords = [
        "experience", "intern", "trainee", "developer", "engineer", "project",
        "job", "specialist", "analyst", "manager", "consultant", "architect",
        "scientist", "coordinator", "assistant", "lead", "head", "director",
        "associate", "fellow", "program", "role", "position", "work", "co-op", "researcher", "officer"
    ]

    for line in text.split("\n"):
        original_line = line.strip()
        if not original_line:
            continue

        # Remove common bullet points and other leading non-alphanumeric chars
        processed_line = re.sub(r'^[\s\u2022\-\d\*\-–—\.]+\s*', '', original_line)

        # Convert to lowercase for case-insensitive keyword checking
        lower_processed_line = processed_line.lower()

        # Check if any experience keyword is present in the line
        if any(key in lower_processed_line for key in experience_keywords):
            # Basic cleaning: Normalize spaces
            cleaned_line = re.sub(r'\s+', ' ', processed_line).strip()
            # Further filter out lines that are too short or just numbers
            if len(cleaned_line) > 5 and any(c.isalpha() for c in cleaned_line):
                exp_lines.append(cleaned_line)

    # Use set to deduplicate, then convert back to list for consistent output
    return list(set(exp_lines))

def extract_skills(text):
    doc = nlp_skills(text)  # Use the dedicated skills model
    skills = [ent.text for ent in doc.ents if "SKILLS" in ent.label_]  # Extract SKILLS entities
    # Clean up: Deduplicate and filter short/irrelevant
    skills = list(set([s.strip() for s in skills if len(s) > 2]))
    return skills

def parse_cv(path):
    text = read_file(path)
    return {
        "skills": extract_skills(text),
        "experience": extract_experience(text),
        "location": extract_location(text)
    }
