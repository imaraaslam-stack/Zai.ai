from flask import Flask, request, jsonify, render_template
import os
import google.generativeai as genai

app = Flask(__name__)

# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/')
def home():
    # This looks for your index.html
    return render_template('index.html')

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    user_notes = data.get('notes', '')
    
    prompt = f"Create a student quiz based on these notes. Provide questions and hidden answers: {user_notes}"
    response = model.generate_content(prompt)
    
    return jsonify({"quiz": response.text})

# Vercel needs this line
app = app