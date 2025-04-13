import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from functools import wraps
import requests
import base64
import hashlib

load_dotenv()

app = Flask(__name__)

CORS(app)

KEYCLOAK_SERVER_URL = os.getenv('FLASK_APP_KEYCLOAK_URL')
KEYCLOAK_REALM = os.getenv('FLASK_APP_KEYCLOAK_REALM')
KEYCLOAK_CLIENT_ID = os.getenv('FLASK_APP_KEYCLOAK_CLIENT_ID')
KEYCLOAK_CLIENT_SECRET = os.getenv('FLASK_SECRET_KEY', 'default-secret-key')




def generate_code_verifier(length=43):
    """Генерация code_verifier для PKCE"""
    # Должен быть 43-128 символов (рекомендуется 43)
    token = os.urandom(32)
    return base64.urlsafe_b64encode(token).rstrip(b'=').decode('utf-8')


def generate_code_challenge(code_verifier):
    """Генерация code_challenge (S256 метод)"""
    # SHA-256 хеш и base64url encoding
    m = hashlib.sha256()
    m.update(code_verifier.encode('utf-8'))
    digest = m.digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b'=').decode('utf-8')
    return challenge


@app.route('/pkce/generate')
def generate_pkce():
    """Генерация пары code_verifier и code_challenge"""
    code_verifier = generate_code_verifier()
    code_challenge = generate_code_challenge(code_verifier)

    return jsonify({
        'code_verifier': code_verifier,
        'code_challenge': code_challenge
    })



# Маршрут для получения данных отчёта
@app.route('/reports', methods=['GET'])
def get_reports():

    # Генерация тестовых данных отчёта
    def generate_report_data():
        report_data = {"report": "data"}
        return report_data


    report = generate_report_data()
    return jsonify(report)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)