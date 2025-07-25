import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import Keycloak, { KeycloakConfig } from 'keycloak-js';
import qs from 'qs';


const ReportPage: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testRes, setTestRes] = useState<any>({});

   
 // Функция для обновления токена
const refreshAccessToken = async () => {
  try {
    const refreshed = await keycloak.updateToken(30); // 30 - минимальное время жизни токена в секундах для обновления
    if (refreshed) {
      return keycloak.token;
    } else {
      return keycloak.token;
    }
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
    keycloak.login(); // Перенаправляем на вход при ошибке
    return null;
  }
};

//Функция проверки ролей токена

const checkRole = (checkedRole: string) => {

  const hasRole = keycloak.hasRealmRole(checkedRole);

  return hasRole
  
}


  const downloadReport = async () => {

   //Роль для доступа к отчету
    const checkedRole = 'prothetic_user'

    const isTrueRole = checkRole(checkedRole)

    const freshToken = await refreshAccessToken();
    
    if (!keycloak.authenticated) {
      setError('Not authenticated, 401');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (freshToken && isTrueRole) {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reports`, {
        headers: {
          'Authorization': `Bearer ${freshToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json()
      setTestRes({ report: data.report })  
      }
    else 
    setError( "Access denaid, 403" )
    
   
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const pkceLogin = async () => {

      const response = await fetch(`${process.env.REACT_APP_API_URL}/pkce/generate`)
      const pkce_data = await response.json();
      const code_verifier =  pkce_data['code_verifier']
      const code_challenge = pkce_data['code_challenge']
  
      localStorage.setItem('pkce_verifier', code_verifier);
  
  
        // Перенаправляем пользователя в Keycloak
        const keycloakUrl = new URL(`${process.env.REACT_APP_KEYCLOAK_URL}/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/protocol/openid-connect/auth`);
        const params = {
          client_id: `${process.env.REACT_APP_KEYCLOAK_CLIENT_ID}`,
          response_type: 'code',
          redirect_uri: 'http://localhost:3000/callback',
          code_challenge: code_challenge,
          code_challenge_method: 'S256',
          scope: 'openid profile email',
          prompt: 'login'

        };

        keycloakUrl.search = new URLSearchParams(params).toString();

        window.location.href = keycloakUrl.toString();


  }

  const pkceLogout = async () => {

    const freshToken = await refreshAccessToken();

    
    if (freshToken) {

    keycloak.logout()
    localStorage.setItem('access_token', '');
  }

  }


  if (loading) {
    return <div>Loading...</div>;
  }

  if (!keycloak.token && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <button
          onClick={pkceLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    );
  }

  return (

    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">

	 
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
        
     <div className="text-center">
        <button
          onClick={pkceLogout}
          disabled={loading}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 m-2.5 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Logout
        </button>
      </div>
        
        </div>
        {testRes.report && <p>Report: {testRes.report}</p>}

    </div>
  );
};

export default ReportPage;