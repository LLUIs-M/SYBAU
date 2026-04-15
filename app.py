from flask import Flask, render_template, request, Response, stream_with_context
import requests
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    
    def generate():
        try:
            url = 'http://127.0.0.1:11434/api/chat'
            payload = {
                "model": data.get('model', 'deepseek-r1:8b'),
                "messages": data.get('messages', []),
                "think": True
            }

            in_thinking = False

            with requests.post(url, json=payload, stream=True) as r:
                for line in r.iter_lines():
                    if line:
                        chunk = json.loads(line)
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
            yield f"\n\nSystem Error: {e}".encode('utf-8')

    # THE ANTI-BUFFER SHIELD: These headers forbid Windows and Web Browsers from holding the data
    headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
    }

    return Response(stream_with_context(generate()), headers=headers)

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)