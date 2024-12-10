import { ref, onMounted, watch } from 'vue';
import { InteractionStatus } from '@azure/msal-browser';
import { msalSingleton, loginRequest } from '../authConfig';

export function useMsal() {
  const inProgress = ref(InteractionStatus.None);
  const isInitialized = ref(false);
  const error = ref(null);
  const account = ref(null);

  const login = async () => {
    try {
      const instance = await msalSingleton.getInstance();
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      error.value = err;
      console.error('Login failed:', err);
    }
  };

  const logout = async () => {
    try {
      const instance = await msalSingleton.getInstance();
      await instance.logoutRedirect();
    } catch (err) {
      error.value = err;
      console.error('Logout failed:', err);
    }
  };

  const checkAccount = async () => {
    try {
      const instance = await msalSingleton.getInstance();
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0) {
        account.value = accounts[0];
        return true;
      }
      return false;
    } catch (err) {
      error.value = err;
      console.error('Check account failed:', err);
      return false;
    }
  };

  onMounted(async () => {
    try {
      const instance = await msalSingleton.getInstance();
      isInitialized.value = true;
      
      await msalSingleton.handleRedirect();
      await checkAccount();

      instance.addEventCallback((message) => {
        inProgress.value = message.interactionStatus;
        if (message.eventType === "msal:loginFailure") {
          error.value = message.error;
          console.error("Login failed:", message.error);
        }
      });
    } catch (err) {
      error.value = err;
      console.error('MSAL initialization failed:', err);
    }
  });

  return {
    inProgress,
    isInitialized,
    error,
    account,
    login,
    logout,
    checkAccount
  };
}