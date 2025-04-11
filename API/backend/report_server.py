import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from functools import wraps
import requests

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["*"],  # Можно указать конкретные домены, например ["http://localhost:3000"]
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Authorization", "Content-Type"],
        },
        r"/realms/*": {
            "origins": ["*"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Authorization", "Content-Type"],
        }
    }
)

KEYCLOAK_SERVER_URL = os.getenv('FLASK_APP_KEYCLOAK_URL')
KEYCLOAK_REALM = os.getenv('FLASK_APP_KEYCLOAK_REALM')
KEYCLOAK_CLIENT_ID = os.getenv('FLASK_APP_KEYCLOAK_CLIENT_ID')
KEYCLOAK_CLIENT_SECRET = os.getenv('FLASK_SECRET_KEY', 'default-secret-key')

# Генерация тестовых данных отчёта
def generate_report_data():
    report_data = {"report": "test_ok"}
    return report_data

# Генерация code_verifier и code_challenge (S256)
def generate_pkce():
    code_verifier = secrets.token_urlsafe(64)
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).decode().replace("=", "")
    return code_verifier, code_challenge

@app.route("/login")
def login():
    # Генерируем PKCE параметры
    code_verifier, code_challenge = generate_pkce()

    # Сохраняем code_verifier в сессии (в реальном приложении используйте сессии или Redis)
    app.config["CODE_VERIFIER"] = code_verifier

    # Формируем URL для аутентификации в Keycloak
    auth_url = (
        f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/auth?"
        f"response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&"
        f"code_challenge={code_challenge}&code_challenge_method=S256"
    )
    return redirect(auth_url)

# Маршрут для получения данных отчёта
@app.route('/api/reports', methods=['GET'])
def get_reports():
    expected_realm = 'prothetic_user' # Требуемая роль
    # 1. Проверяем наличие Bearer-токена в заголовке
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401
    token = auth_header.split(' ')[1]

    # 2. Проверяем токен через интроспекцию в Keycloak
    introspect_url = f"{KEYCLOAK_SERVER_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token/introspect"
    data = {
        'token': token,
        'client_id': KEYCLOAK_CLIENT_ID,
        'client_secret': KEYCLOAK_CLIENT_SECRET
    }
    response = requests.post(introspect_url, data=data)

    if response.status_code != 200:
        return jsonify({"error": "Token introspection failed"}), 401

    introspect_data = response.json()
    print('1', introspect_data)
    '''
    # 3. Проверяем, что токен активен и работает с заданной ролью
    if not introspect_data.get('active'):
        return jsonify({"error": "Token is not active"}), 401
    
    try:
        token_roles = introspect_data['realm_access']['roles']  # Извлекаем роли из realm_access
    except (KeyError, IndexError):
        return jsonify({"error": "Invalid token: 'iss' claim missing or malformed"}), 401

    if expected_realm not in token_roles:
        return jsonify({
            "error": "Access denied",
            "message": f"Token realm '{token_roles}' does not match expected '{expected_realm}'"
        }), 403
    '''
    report = generate_report_data()
    return jsonify(report)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)