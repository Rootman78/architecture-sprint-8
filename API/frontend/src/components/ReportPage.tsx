import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import CryptoJS from 'crypto-js';
import Keycloak, { KeycloakConfig } from 'keycloak-js';


const ReportPage: React.FC = (keycloakConfig:KeycloakConfig) => {
  const { keycloak, initialized } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testRes, setTestRes] = useState<{ report: string }>({ report: '' });

  const downloadReport = async () => {
    if (!keycloak?.token) {
      setError('Not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/reports`, {
        headers: {
          'Authorization': `Bearer ${keycloak.token}`,
          'Content-Type': 'application/json'
        }
      });
	  
	  // Извлекаем данные из тела ответа
      const data = await response.json();

      // Создаем объект с типом { report: string }
	  const reportData = { report: data.report };
	  
	  setTestRes(reportData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  

// Генерация code_verifier (RFC 7636)
const generateCodeVerifier = (): string => {
  return CryptoJS.lib.WordArray.random(64).toString(CryptoJS.enc.Base64url);
};

// Генерация code_challenge (SHA-256 + Base64url)
const generateCodeChallenge = (codeVerifier: string): string => {
  return CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64url);
};

// PKCE-совместимый аналог keycloak.login()
  const loginWithPKCE = () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Сохраняем code_verifier для последующего использования
  localStorage.setItem('pkce_code_verifier', codeVerifier);

  // Параметры запроса к Keycloak
  const authUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth`;
  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: keycloakConfig.clientId,
    redirect_uri: window.location.origin + '/callback', // Ваш redirect_uri
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: 'openid profile email', // Нужные scope
  });

  // Перенаправляем пользователя
  window.location.href = `${authUrl}?${queryParams.toString()}`;
};



  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <button
          onClick={loginWithPKCE}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    );
  }

  return (

    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">

	 {testRes.report && <p>Report: {testRes.report}</p>}
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Usage Reports</h1>
        
        <button
          onClick={downloadReport}
          disabled={loading}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Generating Report...' : 'Download Report'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;