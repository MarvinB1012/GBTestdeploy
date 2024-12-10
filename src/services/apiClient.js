import axios from 'axios';

// Verwende die Umgebungsvariable für die baseURL
const apiClient = axios.create({
    baseURL: 'https://blue-coast-05c01eb03.4.azurestaticapps.net/api' || 'http://localhost:7071/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Response Interceptor für bessere Fehlerbehandlung
apiClient.interceptors.response.use(
    response => {
        const contentType = response.headers['content-type'];
        
        // Validiere Response-Typ
        if (contentType && contentType.includes('text/html')) {
            return Promise.reject(new Error('Received HTML response instead of JSON'));
        }
        
        // Behandle leere Responses
        if (!response.data && !response.config.responseType) {
            return Promise.reject(new Error('Empty response received'));
        }
        
        return response;
    },
    error => {
        let errorMessage = 'An unexpected error occurred';
        
        if (error.response) {
            const contentType = error.response.headers['content-type'];
            
            if (contentType && contentType.includes('text/html')) {
                errorMessage = 'Received HTML response instead of JSON';
            } else {
                errorMessage = error.response.data?.message || error.response.statusText;
            }
        } else if (error.request) {
            errorMessage = 'No response received from server';
        }
        
        error.message = errorMessage;
        return Promise.reject(error);
    }
);

export { apiClient };