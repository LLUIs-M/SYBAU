from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
import requests
import json
import base64
import fitz  # PyMuPDF
import os
import tempfile
import whisper
import imageio_ffmpeg
import shutil

# INJECT FFMPEG FOR WHISPER
ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
local_ffmpeg = os.path.join(os.getcwd(), 'ffmpeg.exe')
if not os.path.exists(local_ffmpeg):
    try:
        shutil.copy(ffmpeg_path, local_ffmpeg)
    except Exception:
        pass
os.environ["PATH"] += os.pathsep + os.getcwd()

# PRE-LOAD WHISPER MODEL
print("Booting secondary neural net (Whisper Tiny)...")
whisper_model = whisper.load_model("tiny")
print("Whisper operational.")

app = Flask(__name__)
CORS(app)


@app.route('/tags', methods=['GET'])
def get_tags():
    try:
        url = 'http://127.0.0.1:11434/api/tags'
        res = requests.get(url)
        return Response(res.content, status=res.status_code, mimetype='application/json')
    except Exception as e:
        print(f"Error fetching tags: {e}")
        return {"models": []}, 500

@app.route('/pull', methods=['POST'])
def pull_model():
    data = request.json
    model_name = data.get('name')
    if not model_name:
        return {"error": "name is required"}, 400

    def generate():
        url = 'http://127.0.0.1:11434/api/pull'
        payload = {"name": model_name}
        try:
            with requests.post(url, json=payload, stream=True) as r:
                for line in r.iter_lines():
                    if line:
                        yield line + b'\n'
        except Exception as e:
            yield json.dumps({"error": str(e)}).encode('utf-8') + b'\n'

    return Response(stream_with_context(generate()), content_type='application/x-ndjson')

@app.route('/ps', methods=['GET'])
def get_ps():
    try:
        url = 'http://127.0.0.1:11434/api/ps'
        res = requests.get(url)
        return Response(res.content, status=res.status_code, mimetype='application/json')
    except Exception as e:
        print(f"Error fetching ps: {e}")
        return {"models": []}, 500

@app.route('/unload', methods=['POST'])
def unload_model():
    data = request.json
    model_name = data.get('model')
    if not model_name:
        return {"error": "model is required"}, 400
    try:
        url = 'http://127.0.0.1:11434/api/chat'
        payload = {
            "model": model_name,
            "keep_alive": 0
        }
        res = requests.post(url, json=payload)
        return Response(res.content, status=res.status_code, mimetype='application/json')
    except Exception as e:
        print(f"Error unloading model: {e}")
        return {"error": str(e)}, 500

@app.route('/chat', methods=['POST'])
def chat():
    if request.is_json:
        data = request.json
        model_name = data.get('model', 'deepseek-r1:8b')
        messages = data.get('messages', [])
        show_thinking = data.get('showThinking', True)
        options = data.get('options', {})
    else:
        model_name = request.form.get('model', 'deepseek-r1:8b')
        user_text = request.form.get('text', '')
        show_thinking = request.form.get('showThinking', 'true').lower() == 'true'

        # Try to parse options_json from formData
        options_json = request.form.get('options_json', None)
        options = {}
        if options_json:
            try:
                options = json.loads(options_json)
            except:
                pass

        message_obj = {"role": "user", "content": user_text}

        files = request.files.getlist('file')
        for file in files:
            if file and file.filename:
                filename = file.filename.lower()
                if filename.endswith('.pdf'):
                    doc = fitz.open(stream=file.read(), filetype="pdf")
                    pdf_text = ""
                    for page in doc:
                        pdf_text += page.get_text() + "\n"
                    message_obj["content"] += f"\n\n[Attached PDF Content ({filename}):]\n{pdf_text}"
                elif filename.endswith(('.txt', '.md', '.csv')):
                    doc_text = file.read().decode('utf-8', errors='ignore')
                    message_obj["content"] += f"\n\n[Attached Document Content ({filename}):]\n{doc_text}"
                elif filename.endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    img_encoded = base64.b64encode(file.read()).decode('utf-8')
                    if "images" not in message_obj:
                        message_obj["images"] = []
                    message_obj["images"].append(img_encoded)
                elif filename.endswith(('.mp3', '.wav', '.ogg', '.m4a')):
                    ext = os.path.splitext(filename)[1]
                    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_audio:
                        temp_audio.write(file.read())
                        temp_path = temp_audio.name

                    print(f"Transcribing audio from {filename}...")
                    result = whisper_model.transcribe(temp_path, fp16=False)
                    transcription = result["text"].strip()

                    try:
                        os.remove(temp_path)
                    except Exception:
                        pass

                    message_obj["content"] += f"\n\n[Attached Audio Transcript ({filename}):]\n{transcription}"

        messages = [message_obj]

    def generate():
        try:
            url = 'http://127.0.0.1:11434/api/chat'
            
            # If thinking is disabled, we instruct the model to avoid generating it
            if not show_thinking:
                # Prepend the system anti-think prompt
                messages.insert(0, {
                    "role": "system", 
                    "content": "Respond directly and immediately. Do NOT use <think> tags. Do NOT output your reasoning or thinking process. Just give the final answer."
                })

            payload = {
                "model": model_name,
                "messages": messages,
                "think": show_thinking
            }
            if options:
                payload["options"] = options

            in_thinking = False

            with requests.post(url, json=payload, stream=True) as r:
                for line in r.iter_lines():
                    if line:
                        chunk = json.loads(line)
                        if 'error' in chunk:
                            yield f"[Ollama Error]: {chunk['error']}".encode('utf-8')
                            break

                        msg = chunk.get('message', {})
                        thinking = msg.get('thinking', '')
                        content = msg.get('content', '')

                        if thinking:
                            if not in_thinking:
                                yield '<think>'.encode('utf-8')
                                in_thinking = True
                            yield thinking.encode('utf-8')

                        if content:
                            if in_thinking:
                                yield '</think>'.encode('utf-8')
                                in_thinking = False
                            yield content.encode('utf-8')

            if in_thinking:
                yield '</think>'.encode('utf-8')

        except Exception as e:
            print(f"Engine Error: {e}")
            yield f"\n\n[System Error]: {e}".encode('utf-8')

    headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
    }

    return Response(stream_with_context(generate()), headers=headers)


@app.route('/create_model', methods=['POST'])
def create_model():
    """Proxy for Ollama /api/create"""
    data = request.json
    try:
        url = 'http://127.0.0.1:11434/api/create'
        # Stream the creation process back to the client
        res = requests.post(url, json=data, stream=True)
        def generate():
            for line in res.iter_lines():
                if line:
                    yield line + b'\n'
        return Response(stream_with_context(generate()), content_type='application/x-ndjson')
    except Exception as e:
        print(f"Error creating model: {e}")
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)