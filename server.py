import os
import json
import base64
import re
from io import BytesIO
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
from google.genai import types
from PIL import Image
from flask_mail import Mail, Message

# Load environment variables from .env file
load_dotenv()

# Configure the Gemini API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
GEMINI_AVAILABLE = False
GEMINI_CLIENT = None

# Default model names (override via env if you want)
GEMINI_TEXT_MODEL = os.environ.get("GEMINI_TEXT_MODEL", "gemini-2.5-flash")
GEMINI_VISION_MODEL = os.environ.get("GEMINI_VISION_MODEL", GEMINI_TEXT_MODEL)

if GEMINI_API_KEY:
    try:
        GEMINI_CLIENT = genai.Client(api_key=GEMINI_API_KEY)

        GEMINI_AVAILABLE = True
        print("✅ Gemini API configured successfully")
    except Exception as e:
        print(f"❌ Error configuring Gemini API: {e}")
        GEMINI_AVAILABLE = False
else:
    print(
        "⚠️  GEMINI_API_KEY not found. ML demos will use fallback responses.")

# Shared generation configs
GENERATION_CONFIG = types.GenerateContentConfig(
    temperature=0.2,
    top_p=0.8,
    top_k=40,
)

JSON_GENERATION_CONFIG = types.GenerateContentConfig(
    temperature=0.2,
    top_p=0.8,
    top_k=40,
    response_mime_type="application/json",
)

app = Flask(__name__, static_folder=".")
CORS(app)  # Enable CORS for all routes

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME',
                                             'noreply.portfoliobot@gmail.com')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', '')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get(
    'MAIL_USERNAME', 'noreply.portfoliobot@gmail.com')
mail = Mail(app)


# Serve the static files
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)


# API for image classification
@app.route('/api/classify-image', methods=['POST'])
def classify_image():
    try:
        data = request.json
        image_data = data.get('imageData')

        if not GEMINI_AVAILABLE:
            # Use fallback demo response
            import random
            shapes = [
                'Circle', 'Square', 'Triangle', 'Star', 'Heart', 'Arrow',
                'Line', 'Smiley Face'
            ]
            winner = random.choice(shapes)

            result = {
                "predictions": [{
                    "label": winner,
                    "confidence": random.randint(70, 95)
                }, {
                    "label":
                    random.choice([s for s in shapes if s != winner]),
                    "confidence":
                    random.randint(10, 25)
                }, {
                    "label":
                    random.choice([s for s in shapes if s != winner]),
                    "confidence":
                    random.randint(5, 15)
                }]
            }

            # Normalize to 100%
            total = sum(p["confidence"] for p in result["predictions"])
            for p in result["predictions"]:
                p["confidence"] = round(p["confidence"] * 100 / total)

            return jsonify(result)

        # Extract the base64 data from the data URL
        base64_data = image_data.split(',')[1]
        image_bytes = base64.b64decode(base64_data)

        # Convert to PIL Image
        image = Image.open(BytesIO(image_bytes))

        # Classify with Gemini
        prompt = """
        You are an expert image classifier. Please identify what's drawn in this image.
        Focus on simple shapes or objects that might be hand-drawn, like: 
        circle, square, triangle, star, heart, arrow, line, smiley face, house, tree, flower, 
        cat, dog, bird, sun, moon, cloud.
        
        Format your response as a JSON object like this:
        {
            "predictions": [
                {"label": "shape_name", "confidence": 85},
                {"label": "alternative_shape", "confidence": 10},
                {"label": "another_possibility", "confidence": 5}
            ]
        }
        
        Ensure confidence values add up to 100 and represent percentages. Include 3-4 possibilities.
        Respond ONLY with the JSON object.
        """

        response = GEMINI_CLIENT.models.generate_content(
            model=GEMINI_VISION_MODEL,
            contents=[image, prompt],
            config=JSON_GENERATION_CONFIG,
        )
        result_text = response.text or ""

        # Extract JSON from the response (handling potential markdown code blocks)
        json_pattern = r'```json\s*(.*?)\s*```|```\s*(.*?)\s*```|(\{.*\})'
        match = re.search(json_pattern, result_text, re.DOTALL)

        if match:
            json_str = match.group(1) or match.group(2) or match.group(3)
            result = json.loads(json_str)
        else:
            # If no JSON found, create a fallback response
            result = {
                "predictions": [{
                    "label": "Undefined Shape",
                    "confidence": 70
                }, {
                    "label": "Could be a Drawing",
                    "confidence": 20
                }, {
                    "label": "Not Recognized",
                    "confidence": 10
                }]
            }

        return jsonify(result)

    except Exception as e:
        print(f"Error in classify_image: {e}")

        # Check if it's a quota error and provide fallback
        if "quota" in str(e).lower() or "429" in str(e):
            print("API quota exceeded, using fallback response")
            # Use fallback demo response
            import random
            shapes = [
                'Circle', 'Square', 'Triangle', 'Star', 'Heart', 'Arrow',
                'Line', 'Smiley Face'
            ]
            winner = random.choice(shapes)

            result = {
                "predictions": [{
                    "label": winner,
                    "confidence": random.randint(70, 95)
                }, {
                    "label":
                    random.choice([s for s in shapes if s != winner]),
                    "confidence":
                    random.randint(10, 25)
                }, {
                    "label":
                    random.choice([s for s in shapes if s != winner]),
                    "confidence":
                    random.randint(5, 15)
                }]
            }

            # Normalize to 100%
            total = sum(p["confidence"] for p in result["predictions"])
            for p in result["predictions"]:
                p["confidence"] = round(p["confidence"] * 100 / total)

            return jsonify(result)

        return jsonify(
            {"error": "Unable to process image. Please try again later."}), 500


# API for sentiment analysis
@app.route('/api/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    try:
        data = request.json
        text = data.get('text')

        if not GEMINI_AVAILABLE:
            # Use simple rule-based fallback
            result = analyze_sentiment_fallback(text)
            return jsonify(result)

        prompt = f"""
        Analyze the sentiment of the following text: "{text}"
        
        Format your response as a JSON object with the following structure:
        {{
            "label": "Positive/Negative/Neutral",
            "emoji": "😃/😞/😐",
            "color": "#55FF55/#FF5555/#AAAAAA",
            "confidence": 85,
            "distribution": {{
                "positive": 70,
                "neutral": 20,
                "negative": 10
            }},
            "keyPhrases": ["important phrase 1", "important phrase 2", "important phrase 3"]
        }}
        
        The distribution values should add up to 100.
        The key phrases should be 2-4 important words or phrases from the text.
        Respond ONLY with the JSON object.
        """

        response = GEMINI_CLIENT.models.generate_content(
            model=GEMINI_TEXT_MODEL,
            contents=prompt,
            config=JSON_GENERATION_CONFIG,
        )
        result_text = response.text or ""

        # Extract JSON from the response (handling potential markdown code blocks)
        json_pattern = r'```json\s*(.*?)\s*```|```\s*(.*?)\s*```|(\{.*\})'
        match = re.search(json_pattern, result_text, re.DOTALL)

        if match:
            json_str = match.group(1) or match.group(2) or match.group(3)
            result = json.loads(json_str)
        else:
            # If no JSON found, create a fallback response
            result = {
                "label": "Neutral",
                "emoji": "😐",
                "color": "#AAAAAA",
                "confidence": 50,
                "distribution": {
                    "positive": 30,
                    "neutral": 40,
                    "negative": 30
                },
                "keyPhrases": ["Unable to analyze sentiment"]
            }

        return jsonify(result)

    except Exception as e:
        print(f"Error in analyze_sentiment: {e}")

        # Check if it's a quota error and provide fallback
        if "quota" in str(e).lower() or "429" in str(e):
            print("API quota exceeded, using fallback response")
            result = analyze_sentiment_fallback(text)
            return jsonify(result)

        return jsonify(
            {"error":
             "Unable to analyze sentiment. Please try again later."}), 500


def analyze_sentiment_fallback(text):
    """Simple rule-based sentiment analysis fallback"""
    import random

    # Simple keyword-based analysis
    positive_words = [
        'good', 'great', 'excellent', 'amazing', 'happy', 'love', 'like',
        'best', 'wonderful', 'beautiful', 'awesome', 'fantastic', 'perfect',
        'brilliant'
    ]
    negative_words = [
        'bad', 'terrible', 'awful', 'horrible', 'sad', 'hate', 'dislike',
        'worst', 'poor', 'ugly', 'stupid', 'boring', 'annoying', 'disgusting'
    ]

    text_lower = text.lower()

    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)

    # Extract key phrases (words > 3 chars)
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text)
    key_phrases = list(set(words))[:3] if words else ["general text"]

    # Determine sentiment
    if positive_count > negative_count:
        label = "Positive"
        emoji = "😃"
        color = "#55FF55"
        confidence = min(90, 60 + positive_count * 10)
        positive_dist = min(80, 50 + positive_count * 10)
        negative_dist = max(5, 25 - positive_count * 5)
        neutral_dist = 100 - positive_dist - negative_dist
    elif negative_count > positive_count:
        label = "Negative"
        emoji = "😞"
        color = "#FF5555"
        confidence = min(90, 60 + negative_count * 10)
        negative_dist = min(80, 50 + negative_count * 10)
        positive_dist = max(5, 25 - negative_count * 5)
        neutral_dist = 100 - positive_dist - negative_dist
    else:
        label = "Neutral"
        emoji = "😐"
        color = "#AAAAAA"
        confidence = random.randint(40, 70)
        positive_dist = random.randint(25, 40)
        negative_dist = random.randint(25, 40)
        neutral_dist = 100 - positive_dist - negative_dist

    return {
        "label": label,
        "emoji": emoji,
        "color": color,
        "confidence": confidence,
        "distribution": {
            "positive": positive_dist,
            "neutral": neutral_dist,
            "negative": negative_dist
        },
        "keyPhrases": key_phrases
    }


# API for sending contact emails
@app.route('/api/send-email', methods=['POST'])
def send_email():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        subject = data.get('subject')
        message_content = data.get('message')

        if not all([name, email, subject, message_content]):
            return jsonify({"error": "All fields are required"}), 400

        # Create message to send to Deepak
        recipient_email = "deepak.baghel2023@glbajajgroup.org"   # Deepak's email

        msg = Message(subject=f"Portfolio Contact: {subject}",
                      recipients=[recipient_email],
                      html=f"""
            <h3>New message from your portfolio website</h3>
            <p><strong>From:</strong> {name} ({email})</p>
            <p><strong>Subject:</strong> {subject}</p>
            <p><strong>Message:</strong></p>
            <p>{message_content}</p>
            """)

        # Add reply-to header so Deepak can reply directly to the sender
        msg.extra_headers = {"Reply-To": email}

        # Also send a confirmation email to the sender
        confirmation_msg = Message(
            subject="Thank you for contacting to Deepak",
            recipients=[email],
            html=f"""
            <h3>Thank you for your message!</h3>
            <p>Hello {name},</p>
            <p>I've received your message and will get back to you as soon as possible.</p>
            <p>Here's a copy of your message:</p>
            <p><strong>Subject:</strong> {subject}</p>
            <p><strong>Message:</strong></p>
            <p>{message_content}</p>
            <p>Best regards,<br>Deepak Baghel<br>AI/ML Engineer</p>
            """)

        # Send both emails
        mail.send(msg)
        mail.send(confirmation_msg)

        return jsonify({
            "success": True,
            "message": "Your message has been sent!"
        })

    except Exception as e:
        print(f"Email error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "gemini_available": GEMINI_AVAILABLE,
        "message": "ML Demos API is running"
    })


if __name__ == '__main__':
    print("🚀 Starting ML Portfolio Server...")
    print(f"🌐 Server will be available at: http://0.0.0.0:5000")
    print(
        f"🤖 Gemini AI: {'✅ Available' if GEMINI_AVAILABLE else '❌ Not Available (using fallback)'}"
    )
    print("📊 ML Demos: Ready to use!")
    app.run(host='0.0.0.0', port=5000, debug=False)