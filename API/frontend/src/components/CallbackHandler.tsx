import qs from "qs";
import { useEffect } from "react";

const CallbackHandler: React.FC = () => {

        // Получаем текущий URL
        const currentUrl = window.location.href;
        
        // Создаем объект URL для анализа текущего адреса
        const url = new URL(currentUrl);
      
        // Используем URLSearchParams для извлечения параметров из query string
        const params = new URLSearchParams(url.search);
      
        // Извлекаем параметр 'code'
        const code = params.get('code');
      
        // Проверяем, что код существует
        if (!code) 
            console.error('Code parameter is missing in the callback URL');
      

        const verifier = localStorage.getItem('pkce_verifier');
        
        useEffect(() => {   
            const checkToken = async () => {   
        const response = await fetch(`${process.env.REACT_APP_KEYCLOAK_URL}/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/protocol/openid-connect/token`, {
                  method: 'POST', // Указываем метод POST
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded' // Устанавливаем заголовок
                  },
                  body: qs.stringify({ // Преобразуем данные в строку x-www-form-urlencoded
                      grant_type: 'authorization_code',
                      code: code,
                      redirect_uri: 'http://localhost:3000/callback',
                      client_id: `${process.env.REACT_APP_KEYCLOAK_CLIENT_ID}`,
                      code_verifier: verifier
                  })
        
        
        });
        
        const token_data = await response.json();
      
        // Проверяем, что код существует
        if (!token_data.access_token) {
        console.error('access_token parameter is missing');
        }
              
          // Сохраняем токен
        localStorage.setItem('access_token', token_data.access_token || '');
        
        window.location.href = '/';  // Перенаправляем на главную
     }

     checkToken()

    }, [verifier]);


    return(
        <div>
        
        </div>
    )

}

export default CallbackHandler