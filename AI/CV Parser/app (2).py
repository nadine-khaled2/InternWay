from flask import Flask, request, jsonify
import os
import json
from tempfile import NamedTemporaryFile

# Import functions from the separated core modules
from parser_core import parse_cv
from groq_service import validate_and_format_with_groq

 

# Initialize Flask app
app = Flask(__name__)

@app.route('/parse_resume', methods=['POST'])
def parse_resume_api():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    user_id = request.form.get('user_id')   

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        # Save the uploaded file temporarily
        with NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            file.save(tmp.name)
            temp_file_path = tmp.name

        try:
            raw_result = parse_cv(temp_file_path)
            final_clean_json_str = validate_and_format_with_groq(raw_result)
            final_clean_json = json.loads(final_clean_json_str)

             
            if user_id:
                final_clean_json["user_id"] = user_id
            else:
                final_clean_json["user_id"] = None

            return jsonify(final_clean_json), 200

        except Exception as e:
            app.logger.error(f"Error processing file {file.filename}: {e}")
            return jsonify({"error": f"Error processing file: {str(e)}"}), 500

        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)


if __name__ == "__main__":
     
    try:
        app.run(host="0.0.0.0", port=5000, debug=True)
    except Exception as e:
         
        import traceback
        traceback.print_exc()
