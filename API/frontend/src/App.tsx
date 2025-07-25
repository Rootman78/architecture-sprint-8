import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak, { KeycloakConfig } from 'keycloak-js';
import ReportPage from './components/ReportPage';
import CallbackHandler from './components/CallbackHandler';

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
  //silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html` // Для silent SSO 
};

const App: React.FC = () => {
  return (
    <div className="App">
    <ReactKeycloakProvider authClient={keycloak} initOptions={initOptions} >
    <Router>
      <Routes>
        {/* Маршрут для обработки callback */}
        <Route path="/callback" element={<CallbackHandler />} />


        {/* Маршрут по умолчанию */}
        
        <Route path="/" element={<ReportPage />} />
        
      </Routes>
    </Router>
     
    </ReactKeycloakProvider>

    </div>
  );
};

export default App;