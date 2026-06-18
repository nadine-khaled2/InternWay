from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import faiss
import re
from sentence_transformers import SentenceTransformer, CrossEncoder
from sklearn.feature_extraction.text import TfidfVectorizer

app = Flask(__name__)

# ========================= CONFIG =========================
MODEL_NAME = "BAAI/bge-base-en-v1.5"
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"
PREFILTER_N = 100
RERANK_TOP_K = 25

# =========================================================
 

# Load ESCO
esco_skills = pd.read_csv("skills_en.csv")
esco_relations = pd.read_csv("skillSkillRelations_en.csv")

skill_to_uri = {row['preferredLabel'].lower(): row['conceptUri'] 
                for _, row in esco_skills.iterrows()}

relations = {}
for _, row in esco_relations.iterrows():
    relations.setdefault(row['originalSkillUri'], set()).add(row['relatedSkillUri'])

embedder = SentenceTransformer(MODEL_NAME)
reranker = CrossEncoder(RERANKER_MODEL, max_length=512)
tfidf = TfidfVectorizer(min_df=1, max_df=0.95)

 

def clean_skills(skills_str):
    if isinstance(skills_str, str):
        return [s.strip().lower() for s in re.split(r'[,/()]+', skills_str) if s.strip()]
    return []

def esco_boost(student_skills, intern_skills):
    bonus = 0.0
    for s in student_skills:
        s_uri = skill_to_uri.get(s.lower())
        if not s_uri: continue
        for i in intern_skills:
            i_uri = skill_to_uri.get(i.lower())
            if not i_uri: continue
            if s_uri == i_uri:
                bonus += 0.1
            elif i_uri in relations.get(s_uri, []):
                bonus += 0.05
    return min(bonus, 0.15)

def recommend(student_data, internships_df):
    student_skills = [s.lower().strip() for s in student_data.get('skills', [])]
    experiences = student_data.get('experiences', [])
    student_city = str(student_data.get('location', {}).get('city', '')).lower().strip()

    student_text = " ".join(student_skills) + " " + " ".join([exp.get('title', '') for exp in experiences])

    internships_df = internships_df.copy()
    internships_df['clean_skills'] = internships_df['required_skills'].apply(clean_skills)
    internships_df['embed_text'] = (
        internships_df['title'].astype(str) + " " + 
        internships_df.get('company_name', '').astype(str) + " " + 
        internships_df['required_skills'].astype(str)
    )

    embeddings = embedder.encode(internships_df['embed_text'].tolist(), normalize_embeddings=True, batch_size=32)
    dimension = embeddings.shape[1]
    
    faiss_index = faiss.IndexFlatIP(dimension)
    faiss_index.add(embeddings.astype('float32'))

    tfidf_matrix = tfidf.fit_transform(internships_df['embed_text'])

    student_emb = embedder.encode([student_text], normalize_embeddings=True)
    tfidf_vec = tfidf.transform([student_text])
    tfidf_scores = (tfidf_matrix @ tfidf_vec.T).toarray().flatten()

    idx_tfidf = np.argsort(tfidf_scores)[-PREFILTER_N:]
    _, idx_faiss = faiss_index.search(student_emb.astype('float32'), PREFILTER_N)
    
    candidate_idx = set(idx_tfidf.tolist() + idx_faiss[0].tolist())

    candidates = []
    for idx in candidate_idx:
        if idx >= len(internships_df): continue
        row = internships_df.iloc[idx]
        
        intern_skills = set(row['clean_skills'])
        overlap = set(student_skills) & intern_skills
        coverage = len(overlap) / (len(intern_skills) + 1e-6)

        sem_score = float(np.dot(student_emb[0], embeddings[idx]))
        skill_score = 0.7 * sem_score + 0.3 * coverage
        skill_score += esco_boost(student_skills, intern_skills)

        loc_score = 0.95 if str(row.get('work_type', '')).lower() == "remote" else 0.65
        if student_city and str(row.get('governrate', '')).lower() == student_city:
            loc_score = 0.92

        base_score = min(skill_score * 0.68 + loc_score * 0.32, 1.0)

        rq = f"Skills: {', '.join(student_skills)}. Past roles: {', '.join([exp.get('title','') for exp in experiences])}."
        rd = f"Title: {row.get('title')}. Required skills: {', '.join(row['clean_skills'])}."

        candidates.append({
            'id': int(row['id']),
            'title': row.get('title'),
            'base_score': float(base_score),
            '_rq': rq,
            '_rd': rd
        })

    cdf = pd.DataFrame(candidates).drop_duplicates(subset=['id'])
    cdf = cdf.sort_values('base_score', ascending=False).reset_index(drop=True)

    # ====================== RERANKING  ======================
    if len(cdf) > 0:
        top_k = min(RERANK_TOP_K, len(cdf))
        top = cdf.head(top_k)
        pairs = list(zip(top['_rq'], top['_rd']))
        rerank_scores = reranker.predict(pairs)
        norm = (rerank_scores - rerank_scores.min()) / (rerank_scores.max() - rerank_scores.min() + 1e-8)
        
         
        cdf['final_score'] = cdf['base_score']                     
        cdf.loc[:top_k-1, 'final_score'] = 0.5 * cdf.loc[:top_k-1, 'base_score'] + 0.5 * norm
        
        cdf.loc[top_k:, 'final_score'] = cdf.loc[top_k:, 'base_score']
    else:
        cdf['final_score'] = cdf['base_score']

     
    result = cdf.sort_values('final_score', ascending=False).reset_index(drop=True)
    
    output = [
        {"id": int(row['id']), "score": round(float(row['final_score']), 4)}
        for _, row in result.iterrows()
    ]
    
    return output

# ========================= API =========================
@app.route('/recommend', methods=['POST'])
def recommend_endpoint():
    try:
        data = request.get_json(force=True)
        student = data.get('student')
        internships = data.get('internships')

        if not student or not internships:
            return jsonify({"error": "student and internships are required"}), 400

        df = pd.DataFrame(internships)
        if 'id' not in df.columns or 'title' not in df.columns or 'required_skills' not in df.columns:
            return jsonify({"error": "Missing required fields in internships"}), 400

        recommendations = recommend(student, df)

        return jsonify({
            "user_id": student.get('user_id'),
            "recommendations": recommendations,
            "total": len(recommendations)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model": MODEL_NAME})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860)
