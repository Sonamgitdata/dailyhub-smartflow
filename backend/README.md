# DailyHub Mock API (Flask)

This is the Python Flask backend you uploaded. The Lovable app talks to it
when it's reachable, and falls back to built-in mock data otherwise.

## Run it locally

```bash
cd backend
python -m pip install flask flask-cors
python simulateapi.py
```

It will start on `http://127.0.0.1:5000`.

## Tell the frontend where it lives

Create a `.env` file in the project root (next to `package.json`):

```
VITE_DAILYHUB_API=http://127.0.0.1:5000
```

Restart the dev server. The app will now use your Flask endpoints
(`/food`, `/transport`, `/recommend`, `/book`, `/pay`) for the matching
services. If the API is down, it transparently falls back to mock data.

## CORS

The browser will block cross-origin requests by default. Add CORS to your
Flask app:

```python
from flask_cors import CORS
CORS(app)
```

(Already noted in the install command above.)
