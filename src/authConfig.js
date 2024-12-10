// src/authConfig.js
import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

// Environment-aware configuration
const isProd = import.meta.env.PROD;
const BASE_URL = isProd
  ? "https://proud-ground-0ddf4e803.5.azurestaticapps.net"
  : window.location.origin;

  const API_URL = isProd
  ? "https://proud-ground-0ddf4e803.5.azurestaticapps.net"
  : import.meta.env.VITE_API_URL || "http://localhost:7071/api";

// Ensure redirect URI matches the current environment
const redirectUri = `${BASE_URL}/room`;

export const msalConfig = {
  auth: {
    clientId: "9bc0f1d1-d9f3-45ce-b0ac-1f8484a6b435",
    authority: "https://login.microsoftonline.com/3acbef42-1ba8-4fd2-8f6c-bfc8d375fc6b",
    redirectUri,
    navigateToLoginRequestUrl: true,
    postLogoutRedirectUri: BASE_URL
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  },
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      logLevel: isProd ? LogLevel.Error : LogLevel.Verbose,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      }
    }
  }
};

export const loginRequest = {
  scopes: ["User.Read"]
};

// Export environment variables for use in other files
export const environment = {
  isProd,
  baseUrl: BASE_URL,
  apiUrl: API_URL
};

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Handle initialization and redirect
(async () => {
  try {
    await msalInstance.initialize();
    await msalInstance.handleRedirectPromise();
  } catch (error) {
    console.error("Error initializing MSAL:", error);
  }
})();

export { msalInstance };