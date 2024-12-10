// src/services/apiClient.js
import axios from 'axios';
import { msalInstance, loginRequest, environment } from '../authConfig';

const apiClient = axios.create({
    baseURL: environment.apiUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Centralize initialization
let initializationPromise = null;
const ensureInitialized = async () => {
    if (!initializationPromise) {
        initializationPromise = msalInstance.initialize();
    }
    return initializationPromise;
};

// Request interceptor with better error handling
apiClient.interceptors.request.use(async config => {
    try {
        await ensureInitialized();
        const accounts = msalInstance.getAllAccounts();
        
        if (accounts.length > 0) {
            const tokenResponse = await msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: accounts[0]
            });
            config.headers.Authorization = `Bearer ${tokenResponse.accessToken}`;
        }
        return config;
    } catch (error) {
        console.error('Token acquisition failed:', error);
        // Optionally redirect to login if token acquisition fails
        await msalInstance.loginRedirect(loginRequest);
        return Promise.reject(error);
    }
}, error => Promise.reject(error));

// Response interceptor with improved error handling
apiClient.interceptors.response.use(
    response => {
        const contentType = response.headers['content-type'];
        
        // Validate response type
        if (contentType && contentType.includes('text/html')) {
            return Promise.reject(new Error('Received HTML response instead of JSON'));
        }
        
        // Handle empty responses
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
            
            // Handle authentication errors
            if (error.response.status === 401) {
                msalInstance.loginRedirect(loginRequest).catch(console.error);
            }
        } else if (error.request) {
            errorMessage = 'No response received from server';
        }
        
        error.message = errorMessage;
        return Promise.reject(error);
    }
);

// Initialize on import
ensureInitialized().catch(console.error);

export { apiClient };