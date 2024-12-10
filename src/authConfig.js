import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

const isProd = import.meta.env.PROD;
const BASE_URL = isProd
  ? "https://blue-coast-05c01eb03.4.azurestaticapps.net"
  : window.location.origin;
const API_URL = isProd
  ? "https://blue-coast-05c01eb03.4.azurestaticapps.net"
  : import.meta.env.VITE_API_URL || "http://localhost:7071/api";

export const msalConfig = {
  auth: {
    clientId: "9bc0f1d1-d9f3-45ce-b0ac-1f8484a6b435",
    authority: "https://login.microsoftonline.com/3acbef42-1ba8-4fd2-8f6c-bfc8d375fc6b",
    redirectUri: `${BASE_URL}/room`,
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

class MSALSingleton {
  constructor() {
    this.instance = null;
    this.initializing = false;
    this.initializationPromise = null;
  }

  async getInstance() {
    if (!this.instance) {
      await this.initialize();
    }
    return this.instance;
  }

  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise(async (resolve, reject) => {
      try {
        if (!this.instance) {
          this.instance = new PublicClientApplication(msalConfig);
          await this.instance.initialize();
        }
        resolve(this.instance);
      } catch (error) {
        console.error("MSAL initialization failed:", error);
        reject(error);
      }
    });

    return this.initializationPromise;
  }

  async handleRedirect() {
    try {
      const instance = await this.getInstance();
      const response = await instance.handleRedirectPromise();
      return response;
    } catch (error) {
      console.error("Handle redirect failed:", error);
      throw error;
    }
  }
}

export const msalSingleton = new MSALSingleton();
export const loginRequest = {
  scopes: ["User.Read"]
};

export const environment = {
  isProd,
  baseUrl: BASE_URL,
  apiUrl: API_URL
};