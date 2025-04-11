import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak, { KeycloakConfig } from 'keycloak-js';
import ReportPage from './components/ReportPage';

const keycloakConfig: KeycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL,
  realm: process.env.REACT_APP_KEYCLOAK_REALM||"",
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID||""
};


const keycloak = new Keycloak(keycloakConfig);

const initOptions = {
  pkceMethod: 'S256', // Включаем PKCE с методом SHA-256
  usePKCE: true, // Включаем PKCE
  onLoad: 'check-sso', //  'check-sso' для автоматической проверки 
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html` // Для silent SSO 
};

const App: React.FC = () => {
  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={initOptions} >
      <div className="App">
        <ReportPage KeycloakConfig = {keycloakConfig} />
      </div>
    </ReactKeycloakProvider>
  );
};

export default App;