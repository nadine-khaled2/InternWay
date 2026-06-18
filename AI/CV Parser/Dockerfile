FROM python:3.11-slim

# مجلد العمل
WORKDIR /app

# انسخ كل ملفات المشروع
COPY . /app

# ثبت كل المكتبات
RUN pip install --no-cache-dir -r requirements.txt

# حمل موديل spaCy (مهم جدًا)
RUN python -m spacy download en_core_web_lg

# Hugging Face Spaces بيستخدم port 7860
EXPOSE 7860

# شغّل الـ API بـ gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]